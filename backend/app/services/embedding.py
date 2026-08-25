from __future__ import annotations

import logging
import hashlib
from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    MatchValue,
    PointStruct,
    Range,
    VectorParams,
)

from app.core.config import settings
from app.core.openai_client import client

logger = logging.getLogger("shopping_rag.embedding")

COLLECTION_NAME = "products"
EMBEDDING_MODEL = settings.EMBEDDING_MODEL or "text-embedding-3-small"
VECTOR_SIZE = 1536


class EmbeddingService:
    def __init__(self):
        self.collection_name = COLLECTION_NAME
        self._client: Optional[QdrantClient] = None
        self._collection_initialized = False

    @property
    def client(self) -> QdrantClient:
        if self._client is None:
            self._init_client()
        return self._client

    def _init_client(self):
        try:
            if settings.QDRANT_URL == ":memory:" or not settings.QDRANT_URL:
                logger.info("Initializing Qdrant in in-memory mode")
                self._client = QdrantClient(location=":memory:")
            else:
                logger.info(f"Connecting to Qdrant at {settings.QDRANT_URL}")
                self._client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY or None,
                    timeout=5.0,
                )
            self._ensure_collection()
        except Exception as e:
            logger.warning(f"Failed to connect to Qdrant at {settings.QDRANT_URL}: {e}. Falling back to :memory:")
            self._client = QdrantClient(location=":memory:")
            self._ensure_collection()

    def _ensure_collection(self):
        if self._collection_initialized:
            return
        try:
            collections = self._client.get_collections()
            names = [c.name for c in collections.collections]
            if self.collection_name not in names:
                self._client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=VECTOR_SIZE,
                        distance=Distance.COSINE,
                    ),
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            self._collection_initialized = True
        except Exception as e:
            logger.warning(f"Error verifying/creating collection: {e}")

    # ---------------------------------------------------------
    # Embedding Generation
    # ---------------------------------------------------------

    def create_embedding(self, text: str) -> List[float]:
        text = text.strip() or "empty product query"
        try:
            if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-dummy"):
                response = client.embeddings.create(
                    model=EMBEDDING_MODEL,
                    input=text,
                )
                return response.data[0].embedding
        except Exception as e:
            logger.warning(f"OpenAI embedding call failed: {e}. Generating deterministic fallback vector.")

        # Deterministic pseudo-embedding for testing / offline demo
        return self._generate_fallback_vector(text)

    def _generate_fallback_vector(self, text: str) -> List[float]:
        """Generate a normalized deterministic pseudo-embedding vector for offline / mock testing."""
        import numpy as np
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest()[:8], 16)
        rng = np.random.RandomState(seed)
        vec = rng.randn(VECTOR_SIZE).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    embed_text = create_embedding

    # ---------------------------------------------------------
    # Store Product
    # ---------------------------------------------------------

    def store_product(
        self,
        product_id: int,
        text: str,
        metadata: Dict[str, Any],
        user_id: Optional[str] = None,
    ):
        self._ensure_collection()
        vector = self.create_embedding(text)

        payload = {
            "product_id": product_id,
            "text": text,
            **metadata,
        }
        if user_id:
            payload["user_id"] = str(user_id)

        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=product_id,
                    vector=vector,
                    payload=payload,
                )
            ],
        )

    store_document = store_product

    # ---------------------------------------------------------
    # Build Filter
    # ---------------------------------------------------------

    def build_filter(
        self,
        filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> Optional[Filter]:
        must = []

        if user_id:
            must.append(
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=str(user_id)),
                )
            )

        if filters:
            if filters.get("brands"):
                must.append(
                    FieldCondition(
                        key="brand",
                        match=MatchAny(any=filters["brands"]),
                    )
                )

            if filters.get("categories"):
                must.append(
                    FieldCondition(
                        key="category",
                        match=MatchAny(any=filters["categories"]),
                    )
                )

            if filters.get("colors"):
                must.append(
                    FieldCondition(
                        key="color",
                        match=MatchAny(any=filters["colors"]),
                    )
                )

            if (
                filters.get("min_price") is not None
                or filters.get("max_price") is not None
            ):
                must.append(
                    FieldCondition(
                        key="price",
                        range=Range(
                            gte=filters.get("min_price"),
                            lte=filters.get("max_price"),
                        ),
                    )
                )

        if not must:
            return None

        return Filter(must=must)

    # ---------------------------------------------------------
    # Search
    # ---------------------------------------------------------

    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        self._ensure_collection()
        vector = self.create_embedding(query)
        q_filter = self.build_filter(filters=filters, user_id=user_id)

        try:
            # Try modern query_points if available, or fall back to search
            if hasattr(self.client, "query_points"):
                results = self.client.query_points(
                    collection_name=self.collection_name,
                    query=vector,
                    limit=top_k,
                    query_filter=q_filter,
                )
                points = results.points
            else:
                points = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=vector,
                    limit=top_k,
                    query_filter=q_filter,
                )

            output = []
            for point in points:
                output.append(
                    {
                        "id": point.id,
                        "score": point.score,
                        "payload": point.payload or {},
                    }
                )
            return output
        except Exception as e:
            logger.error(f"Qdrant search error: {e}")
            return []

    # ---------------------------------------------------------
    # Pagination & Helpers
    # ---------------------------------------------------------

    def search_with_pagination(
        self,
        query: str,
        page: int = 1,
        limit: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ):
        results = self.search(
            query=query,
            top_k=page * limit,
            filters=filters,
            user_id=user_id,
        )
        start = (page - 1) * limit
        end = start + limit
        return results[start:end]

    def find_similar(
        self,
        summary: str,
        top_k: int = 6,
        user_id: Optional[str] = None,
    ):
        return self.search(
            query=summary,
            top_k=top_k,
            user_id=user_id,
        )

    def delete(self, product_id: int):
        try:
            self._ensure_collection()
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=[product_id],
            )
        except Exception as e:
            logger.warning(f"Failed to delete product {product_id} from Qdrant: {e}")

    delete_document = delete

    def count(self) -> int:
        try:
            self._ensure_collection()
            return self.client.count(
                collection_name=self.collection_name,
                exact=True,
            ).count
        except Exception:
            return 0


embedding_service = EmbeddingService()