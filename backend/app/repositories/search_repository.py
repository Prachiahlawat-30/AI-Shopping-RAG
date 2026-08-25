from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.search_models import SearchHistory, ProductSimilarity


class SearchRepository:
    """
    Data access layer for search history, analytics, and similarity caching.
    """

    @staticmethod
    def log_search(
        db: Session,
        query: str,
        user_id: str,
        search_type: str = "text",
        result_count: int = 0,
    ) -> SearchHistory:
        history = SearchHistory(
            query=query,
            user_id=user_id,
            search_type=search_type,
            result_count=result_count,
        )
        db.add(history)
        db.commit()
        db.refresh(history)
        return history

    @staticmethod
    def get_recent_searches(
        db: Session,
        user_id: str,
        limit: int = 10,
    ) -> List[str]:
        records = (
            db.query(SearchHistory.query)
            .filter(SearchHistory.user_id == user_id)
            .order_by(SearchHistory.created_at.desc())
            .limit(limit * 2)
            .all()
        )
        # Deduplicate while preserving recency order
        seen = set()
        recent = []
        for (q,) in records:
            if q and q not in seen:
                seen.add(q)
                recent.append(q)
                if len(recent) >= limit:
                    break
        return recent

    @staticmethod
    def get_trending_searches(
        db: Session,
        limit: int = 6,
    ) -> List[str]:
        results = (
            db.query(SearchHistory.query, func.count(SearchHistory.id).label("count"))
            .group_by(SearchHistory.query)
            .order_by(func.count(SearchHistory.id).desc())
            .limit(limit)
            .all()
        )
        return [r[0] for r in results if r[0]]

    @staticmethod
    def cache_similarity(
        db: Session,
        product_id: int,
        similar_product_id: int,
        score: float,
    ) -> ProductSimilarity:
        similarity = ProductSimilarity(
            product_id=product_id,
            similar_product_id=similar_product_id,
            similarity_score=score,
        )
        db.add(similarity)
        db.commit()
        return similarity
