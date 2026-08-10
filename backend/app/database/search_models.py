from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func

from app.database.database import Base


class SearchHistory(Base):
    """
    Stores user search queries for:
    - Recent searches
    - Trending searches
    - Analytics
    """

    __tablename__ = "search_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    query = Column(
        String,
        nullable=False,
        index=True,
    )

    search_type = Column(
        String,
        nullable=False,
        default="text",
    )
    # text | image | hybrid

    result_count = Column(
        Integer,
        default=0,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    user_id = Column(String, nullable=False, index=True)


class ProductSimilarity(Base):
    """
    Cache of similar products.

    Instead of recomputing nearest neighbours every time,
    similar products can be stored here for faster retrieval.
    """

    __tablename__ = "product_similarity"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    similar_product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    similarity_score = Column(
        Float,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )