from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class ActivityLog(Base):
    """
    Stores upload and chat events for the activity/history feed.
    Search events are already tracked separately in SearchHistory —
    this table covers the event types that weren't logged before.
    """

    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)

    event_type = Column(String, nullable=False, index=True)
    # "upload" | "chat"

    title = Column(String, nullable=False)

    subtitle = Column(String, nullable=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )

    image = Column(String, nullable=True)
    # optional thumbnail path, e.g. for upload events

    tags = Column(JSON, default=list)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )
    user_id = Column(String, nullable=False, index=True)