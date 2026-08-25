from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_id
from app.database.database import get_db
from app.database.activity_models import ActivityLog
from app.database.search_models import SearchHistory
from app.schemas.activity import ActivityEvent, ActivityResponse

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("", response_model=ActivityResponse)
def get_activity(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )

    searches = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user_id)
        .order_by(SearchHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    combined = []

    for log in logs:
        combined.append(
            (
                log.created_at,
                ActivityEvent(
                    id=f"log-{log.id}",
                    type=log.event_type,
                    title=log.title,
                    subtitle=log.subtitle,
                    time=log.created_at.strftime("%I:%M %p") if log.created_at else "",
                    image=log.image,
                    tags=log.tags or [],
                ),
            )
        )

    for s in searches:
        combined.append(
            (
                s.created_at,
                ActivityEvent(
                    id=f"search-{s.id}",
                    type="search",
                    title=f'Searched "{s.query}"',
                    subtitle=f"{s.result_count} result{'s' if s.result_count != 1 else ''} · {s.search_type}",
                    time=s.created_at.strftime("%I:%M %p") if s.created_at else "",
                    tags=["Semantic Search"],
                ),
            )
        )

    # Sort strictly by timestamp descending
    combined.sort(key=lambda item: item[0] or 0, reverse=True)
    events = [item[1] for item in combined[:limit]]

    return ActivityResponse(events=events)