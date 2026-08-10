import os
from typing import Annotated, List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile as UF,
)

from pydantic import WithJsonSchema
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.product_service import ProductService
from app.core.dependencies import get_current_user_id


UploadFile = Annotated[UF, WithJsonSchema({"type": "string", "format": "binary"})]

router = APIRouter(
    prefix="",
    tags=["Upload"],
)

UPLOAD_DIR = "uploads"


@router.post("/upload")
async def upload_images(
    images: List[UploadFile] = File(...),
    question: str = Form(...),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Upload Product Images

    Pipeline

    Upload Images
            ↓
    ProductService
            ↓
    Save Images
            ↓
    GPT Vision
            ↓
    Metadata Fusion
            ↓
    PostgreSQL
            ↓
    OpenAI Embedding
            ↓
    Qdrant
    """

    product, fused_product, image_results = await ProductService.create_product(
        db=db,
        images=images,
        user_id=current_user_id,
    )

    image_urls = [
        f"/uploads/{os.path.basename(path)}"
        for path in product.image_paths
    ]

    return {

        "status": "success",

        "message": "Product analyzed successfully.",

        "question": question,

        "product_id": product.id,

        "metadata": {

            "product_name": product.product_name,

            "brand": product.brand,

            "category": product.category,

            "model": product.model,

            "color": product.color,

            "material": product.material,

            "availability": product.availability,

        },

        "shopping": {

            "price": product.price,

            "currency": product.currency,

            "rating": product.rating,

            "review_count": product.review_count,

            "product_url": product.product_url,

        },

        "summary": product.description,

        "embedding_summary": product.embedding_summary,

        "features": product.features,

        "specifications": product.specifications,

        "search_keywords": product.search_keywords,

        "confidence": fused_product.confidence,

        "confidence_scores": fused_product.confidence_scores,

        "images": image_urls,

        "pipeline": {

            "upload": True,

            "vision": True,

            "metadata": True,

            "postgres": True,

            "embedding": True,

            "qdrant": True,

        },

        "individual_results": [

            product.model_dump()

            for product in image_results

        ],

    }