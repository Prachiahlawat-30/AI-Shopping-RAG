from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.search import ProductCard


class ChatHistoryItem(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question")
    history: Optional[List[ChatHistoryItem]] = Field(default=None, description="Previous conversation turns")


class ChatResponse(BaseModel):
    question: str
    context: str
    answer: str
    products: List[ProductCard] = Field(default_factory=list, description="Retrieved product citations")
    suggested_followups: List[str] = Field(default_factory=list, description="Suggested follow-up queries")
    grounding_score: float = Field(default=1.0, description="Confidence score in context grounding")