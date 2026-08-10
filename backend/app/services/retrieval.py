from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import Product
from app.services.embedding import embedding_service
from time import perf_counter

from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    ProductCard,
)


class RetrievalService:

    @staticmethod
    def retrieve(
        db: Session,
        question: str,
        user_id: int,
        top_k: int = 5,
    ) -> List[Product]:
        search_results = embedding_service.search(
            query=question,
            top_k=top_k,
        )

        if not search_results:
            return []

        product_ids = []
        for result in search_results:
            payload = result["payload"]
            product_id = payload.get("product_id")
            if product_id:
                product_ids.append(product_id)

        if not product_ids:
            return []

        products = (
            db.query(Product)
            .filter(
                Product.id.in_(product_ids),
                Product.user_id == user_id,
            )
            .all()
        )

        order = {pid: idx for idx, pid in enumerate(product_ids)}
        products.sort(key=lambda p: order.get(p.id, 999))

        return products

    # ------------------------------------------------

    @staticmethod
    def retrieve_context(
        db: Session,
        question: str,
        user_id: int,
        top_k: int = 5,
    ) -> str:
        products = RetrievalService.retrieve(
            db=db,
            question=question,
            user_id=user_id,
            top_k=top_k,
        )

        if not products:
            return "No relevant products found."

        context = []
        for product in products:
            specs = ", ".join(
                f"{k}: {v}" for k, v in (product.specifications or {}).items()
            )
            context.append(f"""
Product ID: {product.id}
Brand: {product.brand}
Product Name: {product.product_name}
Category: {product.category}
Description: {product.description}
Features: {", ".join(product.features or [])}
Specifications: {specs}
""")

        return "\n\n".join(context)

    # ------------------------------------------------

    @staticmethod
    def semantic_search(
        db: Session,
        request: SearchRequest,
        user_id: int,
    ) -> SearchResponse:
        start = perf_counter()

        search_results = embedding_service.search(
            query=request.query,
            top_k=request.limit,
        )

        if not search_results:
            return SearchResponse(
                query=request.query,
                total=0,
                page=request.page,
                limit=request.limit,
                search_time_ms=0,
                results=[],
            )

        cards = []
        for hit in search_results:
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

            if request.filters:
                f = request.filters

                if f.brands and product.brand not in f.brands:
                    continue
                if f.categories and product.category not in f.categories:
                    continue
                if f.colors and product.color not in f.colors:
                    continue
                if f.materials and product.material not in f.materials:
                    continue
                if (
                    f.min_price is not None
                    and product.price is not None
                    and product.price < f.min_price
                ):
                    continue
                if (
                    f.max_price is not None
                    and product.price is not None
                    and product.price > f.max_price
                ):
                    continue
                if (
                    f.min_rating is not None
                    and product.rating < f.min_rating
                ):
                    continue
                if f.availability and product.availability != f.availability:
                    continue

            cards.append(
                ProductCard(
                    id=product.id,
                    similarity_score=round(hit["score"] * 100, 2),
                    brand=product.brand,
                    product_name=product.product_name,
                    category=product.category,
                    model=product.model,
                    color=product.color,
                    material=product.material,
                    description=product.description,
                    price=product.price,
                    currency=product.currency,
                    rating=product.rating,
                    review_count=product.review_count,
                    availability=product.availability,
                    thumbnail=product.thumbnail,
                    image_paths=product.image_paths or [],
                    product_url=product.product_url,
                    features=product.features or [],
                    specifications=product.specifications or {},
                )
            )

        elapsed = (perf_counter() - start) * 1000

        return SearchResponse(
            query=request.query,
            total=len(cards),
            page=request.page,
            limit=request.limit,
            search_time_ms=round(elapsed, 2),
            results=cards,
        )

    # ------------------------------------------------

    @staticmethod
    def similar_products(
        db: Session,
        product_id: int,
        user_id: int,
        top_k: int = 6,
    ):
        product = (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.user_id == user_id,
            )
            .first()
        )

        if not product:
            return []

        query = (
            product.embedding_summary
            or product.description
            or product.product_name
        )

        response = RetrievalService.semantic_search(
            db=db,
            request=SearchRequest(query=query, limit=top_k + 1),
            user_id=user_id,
        )

        return [p for p in response.results if p.id != product_id][:top_k]