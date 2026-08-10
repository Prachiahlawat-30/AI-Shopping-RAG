from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.chat import ChatRequest
from app.services.llm import LLMService

from app.core.dependencies import get_current_user_id
from app.database.activity_models import ActivityLog
router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    result = LLMService.answer_question(
        db=db,
        question=request.question,
        user_id=current_user_id,
    )

    activity = ActivityLog(
        event_type="chat",
        title=f'Asked: "{request.question[:60]}"',
        subtitle=result["answer"][:100],
        user_id=current_user_id,
    )
    db.add(activity)
    db.commit()

    return result
    
@router.post("")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    result = LLMService.answer_question(
        db=db,
        question=request.question,
        user_id=current_user_id,
    )

    activity = ActivityLog(
        event_type="chat",
        title=f'Asked: "{request.question[:60]}"',
        subtitle=result["answer"][:100],
        user_id=current_user_id,
    )
    db.add(activity)
    db.commit()

    return result