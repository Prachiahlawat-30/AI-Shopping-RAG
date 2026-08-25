from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm import LLMService
from app.core.dependencies import get_current_user_id
from app.database.activity_models import ActivityLog

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    history_dicts = (
        [turn.model_dump() for turn in request.history] if request.history else None
    )

    result = LLMService.answer_question(
        db=db,
        question=request.question,
        user_id=current_user_id,
        history=history_dicts,
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