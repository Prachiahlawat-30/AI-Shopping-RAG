from __future__ import annotations

from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    PointStruct,
    Range,
    VectorParams,
)

from app.core.config import settings
from app.core.openai_client import client


COLLECTION_NAME = "products"
EMBEDDING_MODEL = "text-embedding-3-small"
VECTOR_SIZE = 1536


class EmbeddingService:

    def __init__(self):

        self.collection_name = COLLECTION_NAME

        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )

        self._create_collection()

    # ---------------------------------------------------------
    # Collection
    # ---------------------------------------------------------

    def _create_collection(self):

        collections = self.client.get_collections()

        names = [
            c.name
            for c in collections.collections
        ]

        if self.collection_name not in names:

            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE,
                ),
            )

            print(
                f"Created collection: {self.collection_name}"
            )

    # ---------------------------------------------------------
    # Embedding
    # ---------------------------------------------------------

    def create_embedding(
        self,
        text: str,
    ) -> List[float]:

        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text,
        )

        return response.data[0].embedding

    # Alias
    embed_text = create_embedding

    # ---------------------------------------------------------
    # Store Product
    # ---------------------------------------------------------

    def store_product(
        self,
        product_id: int,
        text: str,
        metadata: Dict[str, Any],
    ):

        vector = self.create_embedding(text)

        payload = {
            "product_id": product_id,
            "text": text,
            **metadata,
        }

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

    # Backward compatibility
    store_document = store_product

    # ---------------------------------------------------------
    # Build Filter
    # ---------------------------------------------------------

    def build_filter(
        self,
        filters: Optional[Dict[str, Any]],
    ) -> Optional[Filter]:

        if not filters:
            return None

        must = []

        if filters.get("brands"):

            must.append(
                FieldCondition(
                    key="brand",
                    match=MatchAny(
                        any=filters["brands"]
                    ),
                )
            )

        if filters.get("categories"):

            must.append(
                FieldCondition(
                    key="category",
                    match=MatchAny(
                        any=filters["categories"]
                    ),
                )
            )

        if filters.get("colors"):

            must.append(
                FieldCondition(
                    key="color",
                    match=MatchAny(
                        any=filters["colors"]
                    ),
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

        return Filter(
            must=must,
        )

    # ---------------------------------------------------------
    # Search
    # ---------------------------------------------------------

    def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ):

        vector = self.create_embedding(query)

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=top_k,
            query_filter=self.build_filter(filters),
        )

        output = []

        for point in results.points:

            output.append(
                {
                    "id": point.id,
                    "score": point.score,
                    "payload": point.payload,
                }
            )

        return output

    # ---------------------------------------------------------
    # Pagination
    # ---------------------------------------------------------

    def search_with_pagination(
        self,
        query: str,
        page: int = 1,
        limit: int = 20,
        filters: Optional[Dict[str, Any]] = None,
    ):

        results = self.search(
            query=query,
            top_k=page * limit,
            filters=filters,
        )

        start = (page - 1) * limit
        end = start + limit

        return results[start:end]

    # ---------------------------------------------------------
    # Similar Products
    # ---------------------------------------------------------

    def find_similar(
        self,
        summary: str,
        top_k: int = 6,
    ):

        return self.search(
            query=summary,
            top_k=top_k,
        )

    # ---------------------------------------------------------
    # Delete
    # ---------------------------------------------------------

    def delete(
        self,
        product_id: int,
    ):

        self.client.delete(
            collection_name=self.collection_name,
            points_selector=[product_id],
        )

    delete_document = delete

    # ---------------------------------------------------------
    # Count
    # ---------------------------------------------------------

    def count(self):

        return self.client.count(
            collection_name=self.collection_name,
            exact=True,
        ).count


embedding_service = EmbeddingService()