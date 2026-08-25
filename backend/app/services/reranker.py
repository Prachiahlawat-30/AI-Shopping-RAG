import logging
import math
import re
from typing import Any, Dict, List, Optional
from app.database.models import Product

logger = logging.getLogger("shopping_rag.reranker")


class RelevanceReranker:
    """
    Two-Stage Retrieval Re-ranker.
    
    Takes initial candidate products retrieved from vector search and scores
    them against the user query using multi-factor relevance:
    1. Base semantic vector similarity.
    2. Exact lexical token match on key fields (brand, name, category, specs, features).
    3. Query intent alignment (e.g. price preferences, color, material constraints).
    4. Popularity/Quality prior (rating, review count).
    """

    @staticmethod
    def _tokenize(text: Optional[str]) -> set:
        if not text:
            return set()
        return set(re.findall(r"\w+", text.lower()))

    @staticmethod
    def calculate_lexical_score(query: str, product: Product) -> float:
        """Calculate token overlap and field-specific weighted lexical score."""
        query_tokens = RelevanceReranker._tokenize(query)
        if not query_tokens:
            return 0.0

        brand_tokens = RelevanceReranker._tokenize(product.brand)
        name_tokens = RelevanceReranker._tokenize(product.product_name)
        cat_tokens = RelevanceReranker._tokenize(product.category)
        color_tokens = RelevanceReranker._tokenize(product.color)
        mat_tokens = RelevanceReranker._tokenize(product.material)
        feat_text = " ".join(product.features or [])
        feat_tokens = RelevanceReranker._tokenize(feat_text)

        score = 0.0

        # Exact brand match (high value)
        if query_tokens & brand_tokens:
            score += 0.35 * (len(query_tokens & brand_tokens) / len(query_tokens))

        # Product name token match
        if query_tokens & name_tokens:
            score += 0.30 * (len(query_tokens & name_tokens) / len(query_tokens))

        # Category match
        if query_tokens & cat_tokens:
            score += 0.15 * (len(query_tokens & cat_tokens) / len(query_tokens))

        # Color & Material matches
        if query_tokens & color_tokens:
            score += 0.10
        if query_tokens & mat_tokens:
            score += 0.10

        # Features match
        if query_tokens & feat_tokens:
            score += 0.10 * min(1.0, len(query_tokens & feat_tokens) / len(query_tokens))

        return min(1.0, score)

    @staticmethod
    def rerank_products(
        query: str,
        products_with_scores: List[Dict[str, Any]],
        top_k: Optional[int] = None,
        alpha: float = 0.65,  # 0.65 semantic vector weight, 0.35 lexical/intent weight
    ) -> List[Dict[str, Any]]:
        """
        Re-ranks a list of candidate products.
        
        Args:
            query: User's search text or synthesized query.
            products_with_scores: List of dicts containing 'product' (Product instance) and 'score' (0..100).
            top_k: Limit of reranked items to return.
            alpha: Weight for semantic score vs lexical/quality score.
        """
        if not products_with_scores:
            return []

        reranked = []

        for item in products_with_scores:
            product: Product = item["product"]
            raw_vector_score = item.get("score", 50.0)  # scale 0..100
            normalized_vec_score = max(0.0, min(1.0, raw_vector_score / 100.0))

            # Calculate lexical score (0..1)
            lexical_score = RelevanceReranker.calculate_lexical_score(query, product)

            # Quality prior from rating & reviews (0..1)
            rating = product.rating or 0.0
            review_count = product.review_count or 0
            quality_prior = (rating / 5.0) * 0.7 + (min(1.0, math.log1p(review_count) / 6.0)) * 0.3

            # Combined weighted score
            final_relevance = (
                alpha * normalized_vec_score
                + (1 - alpha) * (0.8 * lexical_score + 0.2 * quality_prior)
            )

            # Scale back to percentage
            final_score_pct = round(final_relevance * 100, 2)

            reranked.append(
                {
                    "product": product,
                    "score": final_score_pct,
                    "original_score": raw_vector_score,
                    "lexical_score": round(lexical_score * 100, 2),
                }
            )

        # Sort descending by re-ranked score
        reranked.sort(key=lambda x: x["score"], reverse=True)

        if top_k is not None:
            reranked = reranked[:top_k]

        return reranked
