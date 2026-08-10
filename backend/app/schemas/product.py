from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ProductInfo(BaseModel):

    brand: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None

    features: List[str] = Field(default_factory=list)

    specifications: Dict[str, str] = Field(default_factory=dict)

    description: str

    confidence: float

    confidence_scores: Dict[str, float] = Field(default_factory=dict)