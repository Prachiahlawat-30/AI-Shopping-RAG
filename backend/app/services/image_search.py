from time import perf_counter
from typing import List

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.database.models import Product
from app.schemas.search import ProductCard, SearchResponse
from app.services.embedding import embedding_service
from app.services.vision import VisionService

class ImageSearchService:

    @staticmethod
    async def search(
        db: Session,
        image: UploadFile,
        user_id: int,
        limit: int = 20,
    ) -> SearchResponse:
        start = perf_counter()

        product_info = await VisionService.analyze_upload(image)
        semantic_query = VisionService.build_search_query(product_info)

        hits = embedding_service.search(query=semantic_query, top_k=limit)

        cards: List[ProductCard] = []
        for hit in hits:
            payload = hit["payload"]
            product = (
                db.query(Product)
                .filter(
                    Product.id == payload["product_id"],
                    Product.user_id == user_id,
                )
                .first()
            )
            if not product:
                continue

            cards.append(ProductCard(
                id=product.id,
                similarity_score=round(hit["score"] * 100, 2),
                brand=product.brand, product_name=product.product_name,
                category=product.category, model=product.model,
                color=product.color, material=product.material,
                description=product.description, price=product.price,
                currency=product.currency, rating=product.rating,
                review_count=product.review_count, availability=product.availability,
                thumbnail=product.thumbnail,
                image_paths=product.image_paths or [],
                product_url=product.product_url, features=product.features or [],
                specifications=product.specifications or {},
            ))

        elapsed = (perf_counter() - start) * 1000
        return SearchResponse(
            query=semantic_query, total=len(cards), page=1,
            limit=limit, search_time_ms=round(elapsed, 2), results=cards,
        )