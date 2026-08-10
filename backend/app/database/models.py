from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    JSON,
)

from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from app.database.database import Base


class Product(Base):
    """
    Main product table.

    Stores both AI extracted metadata and shopping metadata.
    """

    __tablename__ = "products"

    # -------------------------------------------------
    # Primary Key
    # -------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # -------------------------------------------------
    # Product Information
    # -------------------------------------------------

    brand = Column(
        String,
        nullable=True,
        index=True,
    )

    product_name = Column(
        String,
        nullable=True,
        index=True,
    )

    category = Column(
        String,
        index=True,
    )

    model = Column(String)

    color = Column(
        String,
        index=True,
    )

    material = Column(String)

    description = Column(Text)

    # -------------------------------------------------
    # Shopping Metadata
    # -------------------------------------------------

    price = Column(
        Float,
        nullable=True,
        index=True,
    )

    currency = Column(
        String,
        default="INR",
    )

    rating = Column(
        Float,
        default=0.0,
    )

    review_count = Column(
        Integer,
        default=0,
    )

    availability = Column(
        String,
        default="In Stock",
    )

    product_url = Column(String)

    thumbnail = Column(String)

    # -------------------------------------------------
    # AI Metadata
    # -------------------------------------------------

    features = Column(
        JSON,
        default=list,
    )

    specifications = Column(
        JSON,
        default=dict,
    )

    image_paths = Column(
        JSON,
        default=list,
    )

    # -------------------------------------------------
    # Vector Search Metadata
    # -------------------------------------------------

    embedding_summary = Column(Text)

    search_keywords = Column(
        JSON,
        default=list,
    )

    # -------------------------------------------------
    # Audit Fields
    # -------------------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    user_id = Column(String, nullable=False, index=True)