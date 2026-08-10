from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.activity_models import ActivityLog
from app.database.search_models import SearchHistory
from app.schemas.activity import ActivityEvent, ActivityResponse

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("", response_model=ActivityResponse)
def get_activity(limit: int = 20, db: Session = Depends(get_db)):
    logs = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )

    searches = (
        db.query(SearchHistory)
        .order_by(SearchHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    events = [
        ActivityEvent(
            id=f"log-{log.id}",
            type=log.event_type,
            title=log.title,
            subtitle=log.subtitle,
            time=log.created_at.strftime("%I:%M %p") if log.created_at else "",
            image=log.image,
            tags=log.tags or [],
        )
        for log in logs
    ] + [
        ActivityEvent(
            id=f"search-{s.id}",
            type="search",
            title=f'Searched "{s.query}"',
            subtitle=f"{s.result_count} result{'s' if s.result_count != 1 else ''} · {s.search_type}",
            time=s.created_at.strftime("%I:%M %p") if s.created_at else "",
            tags=["Semantic Search"],
        )
        for s in searches
    ]

    events.sort(key=lambda e: e.time, reverse=True)

    return ActivityResponse(events=events[:limit])