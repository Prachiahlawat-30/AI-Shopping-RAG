from time import perf_counter
from typing import Any, Dict, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.models import Product
from app.schemas.search import (
    ProductCard,
    SearchFilters,
    SearchRequest,
    SearchResponse,
)
from app.services.embedding import embedding_service
from app.services.reranker import RelevanceReranker


class RetrievalService:

    @staticmethod
    def format_context(products: List[Product]) -> str:
        """Format retrieved products into clean structured context for LLM prompt."""
        if not products:
            return "No relevant product context found."

        context = []
        for p in products:
            specs = ", ".join(
                f"{k}: {v}" for k, v in (p.specifications or {}).items()
            )
            price_str = f"{p.currency or 'INR'} {p.price}" if p.price else "Not listed"
            context.append(f"""Product #{p.id}: {p.product_name}
Brand: {p.brand} | Category: {p.category or 'General'} | Color: {p.color or 'N/A'} | Material: {p.material or 'N/A'}
Price: {price_str} | Rating: {p.rating} ({p.review_count} reviews) | Status: {p.availability}
Description: {p.description}
Key Features: {", ".join(p.features or [])}
Specs: {specs}""")

        return "\n\n---\n\n".join(context)

    @staticmethod
    def retrieve(
        db: Session,
        question: str,
        user_id: str,
        top_k: int = 5,
    ) -> List[Product]:
        """
        Multi-modal Hybrid Dense + Sparse Retrieval for RAG context.
        """
        # 1. Dense vector search in Qdrant
        search_results = embedding_service.search(
            query=question,
            top_k=top_k * 2,
            user_id=user_id,
        )

        product_ids = []
        score_map = {}
        for result in search_results:
            payload = result["payload"]
            pid = payload.get("product_id") or result["id"]
            if pid:
                product_ids.append(int(pid))
                score_map[int(pid)] = result["score"] * 100

        # 2. Sparse / Lexical keyword fallback in SQL
        keywords = [k.strip() for k in question.split() if len(k.strip()) > 2]
        if keywords:
            clauses = []
            for kw in keywords[:4]:
                clauses.append(Product.product_name.ilike(f"%{kw}%"))
                clauses.append(Product.brand.ilike(f"%{kw}%"))
                clauses.append(Product.category.ilike(f"%{kw}%"))
                clauses.append(Product.description.ilike(f"%{kw}%"))

            lexical_candidates = (
                db.query(Product)
                .filter(Product.user_id == user_id, or_(*clauses))
                .limit(top_k)
                .all()
            )
            for p in lexical_candidates:
                if p.id not in score_map:
                    product_ids.append(p.id)
                    score_map[p.id] = 60.0

        if not product_ids:
            return []

        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids), Product.user_id == user_id)
            .all()
        )

        # 3. Two-stage re-ranking
        candidates = [
            {"product": p, "score": score_map.get(p.id, 50.0)}
            for p in products
        ]
        reranked = RelevanceReranker.rerank_products(
            query=question,
            products_with_scores=candidates,
            top_k=top_k,
        )

        return [item["product"] for item in reranked]

    @staticmethod
    def retrieve_context(
        db: Session,
        question: str,
        user_id: str,
        top_k: int = 5,
    ) -> str:
        products = RetrievalService.retrieve(
            db=db,
            question=question,
            user_id=user_id,
            top_k=top_k,
        )
        return RetrievalService.format_context(products)

    @staticmethod
    def _apply_filters(products: List[Product], filters: Optional[SearchFilters]) -> List[Product]:
        if not filters:
            return products

        filtered = []
        for p in products:
            if filters.brands and p.brand not in filters.brands:
                continue
            if filters.categories and p.category not in filters.categories:
                continue
            if filters.colors and p.color not in filters.colors:
                continue
            if filters.materials and p.material not in filters.materials:
                continue
            if filters.min_price is not None and p.price is not None and p.price < filters.min_price:
                continue
            if filters.max_price is not None and p.price is not None and p.price > filters.max_price:
                continue
            if filters.min_rating is not None and (p.rating or 0) < filters.min_rating:
                continue
            if filters.availability and p.availability != filters.availability:
                continue
            filtered.append(p)
        return filtered

    @staticmethod
    def semantic_search(
        db: Session,
        request: SearchRequest,
        user_id: str,
    ) -> SearchResponse:
        start = perf_counter()

        # 1. Fetch dense candidates from Qdrant
        search_results = embedding_service.search(
            query=request.query,
            top_k=request.limit * 3,
            user_id=user_id,
        )

        product_ids = []
        score_map = {}
        for hit in search_results:
            payload = hit["payload"]
            pid = payload.get("product_id") or hit["id"]
            if pid:
                try:
                    pid_int = int(pid)
                    product_ids.append(pid_int)
                    score_map[pid_int] = hit["score"] * 100
                except (ValueError, TypeError):
                    pass

        # 2. Fetch products from Postgres
        products_query = db.query(Product).filter(Product.user_id == user_id)
        if product_ids:
            products_query = products_query.filter(Product.id.in_(product_ids))
            products = products_query.all()
        else:
            # Fallback to lexical search in DB if vector store is empty or returned 0
            products = (
                db.query(Product)
                .filter(
                    Product.user_id == user_id,
                    or_(
                        Product.product_name.ilike(f"%{request.query}%"),
                        Product.brand.ilike(f"%{request.query}%"),
                        Product.category.ilike(f"%{request.query}%"),
                        Product.description.ilike(f"%{request.query}%"),
                    ),
                )
                .limit(request.limit * 2)
                .all()
            )
            for p in products:
                score_map[p.id] = 70.0

        # 3. Apply post-filters
        filtered_products = RetrievalService._apply_filters(products, request.filters)

        # 4. Apply 2nd-stage Re-ranker
        candidates = [
            {"product": p, "score": score_map.get(p.id, 50.0)}
            for p in filtered_products
        ]
        reranked = RelevanceReranker.rerank_products(
            query=request.query,
            products_with_scores=candidates,
        )

        # 5. Pagination
        start_idx = (request.page - 1) * request.limit
        end_idx = start_idx + request.limit
        page_items = reranked[start_idx:end_idx]

        cards = [
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
            for item in page_items
        ]

        elapsed = (perf_counter() - start) * 1000

        return SearchResponse(
            query=request.query,
            total=len(reranked),
            page=request.page,
            limit=request.limit,
            search_time_ms=round(elapsed, 2),
            results=cards,
        )

    @staticmethod
    def similar_products(
        db: Session,
        product_id: int,
        user_id: str,
        top_k: int = 6,
    ) -> List[ProductCard]:
        product = (
            db.query(Product)
            .filter(Product.id == product_id, Product.user_id == user_id)
            .first()
        )
        if not product:
            return []

        query = (
            product.embedding_summary
            or f"{product.brand} {product.product_name} {product.category}"
            or product.description
        )

        response = RetrievalService.semantic_search(
            db=db,
            request=SearchRequest(query=query, limit=top_k + 2),
            user_id=user_id,
        )

        return [p for p in response.results if p.id != product_id][:top_k]

    @staticmethod
    def generate_comparison_matrix(
        db: Session,
        product_ids: List[int],
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Generate a side-by-side spec comparison matrix and AI comparison synthesis.
        """
        if not product_ids:
            return {"products": [], "shared_specs": {}, "comparison_summary": "No products selected."}

        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids), Product.user_id == user_id)
            .all()
        )

        if not products:
            return {"products": [], "shared_specs": {}, "comparison_summary": "Products not found."}

        # Collect all unique spec keys across products
        all_spec_keys = set()
        for p in products:
            if p.specifications and isinstance(p.specifications, dict):
                all_spec_keys.update(p.specifications.keys())

        spec_matrix = {}
        for key in sorted(all_spec_keys):
            spec_matrix[key] = {
                str(p.id): (p.specifications or {}).get(key, "N/A")
                for p in products
            }

        product_cards = [
            ProductCard(
                id=p.id,
                similarity_score=100.0,
                brand=p.brand or "Brand",
                product_name=p.product_name or "Product",
                category=p.category,
                model=p.model,
                color=p.color,
                material=p.material,
                description=p.description,
                price=p.price,
                currency=p.currency or "INR",
                rating=p.rating,
                review_count=p.review_count,
                availability=p.availability,
                thumbnail=p.thumbnail,
                image_paths=p.image_paths or [],
                product_url=p.product_url,
                features=p.features or [],
                specifications=p.specifications or {},
            )
            for p in products
        ]

        summary_lines = [
            f"Comparing {len(products)} products: {', '.join(p.product_name for p in products)}.",
            f"Price range: {min((p.price or 0) for p in products)} - {max((p.price or 0) for p in products)}.",
        ]

        return {
            "products": [c.model_dump() for c in product_cards],
            "spec_matrix": spec_matrix,
            "comparison_summary": " ".join(summary_lines),
        }