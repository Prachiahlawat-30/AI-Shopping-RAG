from time import perf_counter
from typing import List, Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.database.models import Product
from app.schemas.search import ProductCard, SearchFilters, SearchResponse
from app.services.embedding import embedding_service
from app.services.reranker import RelevanceReranker
from app.services.vision import VisionService


class ImageSearchService:

    @staticmethod
    async def search(
        db: Session,
        image: UploadFile,
        user_id: str,
        limit: int = 20,
        filters: Optional[SearchFilters] = None,
    ) -> SearchResponse:
        start = perf_counter()

        # 1. Extract visual product info
        product_info = await VisionService.analyze_upload(image)
        semantic_query = VisionService.build_search_query(product_info)

        # 2. Vector search in Qdrant
        hits = embedding_service.search(
            query=semantic_query,
            top_k=limit * 3,
            user_id=user_id,
        )

        product_ids = []
        score_map = {}
        for hit in hits:
            payload = hit["payload"]
            pid = payload.get("product_id") or hit["id"]
            if pid:
                try:
                    pid_int = int(pid)
                    product_ids.append(pid_int)
                    score_map[pid_int] = hit["score"] * 100
                except (ValueError, TypeError):
                    pass

        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids), Product.user_id == user_id)
            .all()
        )

        # 3. Apply optional filters
        if filters:
            from app.services.retrieval import RetrievalService
            products = RetrievalService._apply_filters(products, filters)

        # 4. Re-ranking
        candidates = [
            {"product": p, "score": score_map.get(p.id, 50.0)}
            for p in products
        ]
        reranked = RelevanceReranker.rerank_products(
            query=semantic_query,
            products_with_scores=candidates,
            top_k=limit,
        )

        cards: List[ProductCard] = [
            ProductCard(
                id=item["product"].id,
                similarity_score=item["score"],
                brand=item["product"].brand or "Brand",
                product_name=item["product"].product_name or "Product",
                category=item["product"].category,
                model=item["product"].model,
                color=item["product"].color,
                material=item["product"].material,
                description=item["product"].description,
                price=item["product"].price,
                currency=item["product"].currency or "INR",
                rating=item["product"].rating,
                review_count=item["product"].review_count,
                availability=item["product"].availability,
                thumbnail=item["product"].thumbnail,
                image_paths=item["product"].image_paths or [],
                product_url=item["product"].product_url,
                features=item["product"].features or [],
                specifications=item["product"].specifications or {},
            )
            for item in reranked
        ]

        elapsed = (perf_counter() - start) * 1000
        return SearchResponse(
            query=semantic_query,
            total=len(cards),
            page=1,
            limit=limit,
            search_time_ms=round(elapsed, 2),
            results=cards,
        )

    @staticmethod
    async def hybrid_search(
        db: Session,
        image: Optional[UploadFile],
        text_query: Optional[str],
        user_id: str,
        limit: int = 20,
        filters: Optional[SearchFilters] = None,
    ) -> SearchResponse:
        """
        Multimodal Hybrid Search: Combines visual cues from uploaded image + text intent.
        Example: Image of running shoe + text "in waterproof blue under $100"
        """
        combined_queries = []

        if image:
            product_info = await VisionService.analyze_upload(image)
            visual_query = VisionService.build_search_query(product_info)
            combined_queries.append(visual_query)

        if text_query and text_query.strip():
            combined_queries.append(text_query.strip())

        joint_query = " ".join(combined_queries) if combined_queries else "popular products"

        from app.schemas.search import SearchRequest
        from app.services.retrieval import RetrievalService

        return RetrievalService.semantic_search(
            db=db,
            request=SearchRequest(
                query=joint_query,
                page=1,
                limit=limit,
                filters=filters,
            ),
            user_id=user_id,
        )