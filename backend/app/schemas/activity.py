from typing import List, Literal, Optional
from pydantic import BaseModel


class ActivityEvent(BaseModel):
    id: str
    type: Literal["upload", "search", "chat"]
    title: str
    subtitle: Optional[str] = None
    time: str
    image: Optional[str] = None
    tags: List[str] = []


class ActivityResponse(BaseModel):
    events: List[ActivityEvent]