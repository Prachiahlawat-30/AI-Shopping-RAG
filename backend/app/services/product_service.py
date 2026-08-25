import logging
import os
import shutil
import tempfile
import uuid
from typing import List

import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.cloudinary_client import cloudinary 
from app.database.models import Product
from app.repositories.product_repository import ProductRepository
from app.database.activity_models import ActivityLog
from app.services.embedding import embedding_service
from app.services.fusion import MetadataFusionService
from app.services.vision import VisionService

logger = logging.getLogger("shopping_rag.product")

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
}

UPLOAD_LOCAL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_LOCAL_DIR, exist_ok=True)


class ProductService:

    @staticmethod
    async def create_product(
        db: Session,
        images: List[UploadFile],
        user_id: str,
    ):
        temp_paths = []
        cloud_urls = []

        for image in images:
            if image.content_type and image.content_type not in ALLOWED_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"{image.filename} has unsupported format ({image.content_type}).",
                )

            suffix = os.path.splitext(image.filename or "photo.jpg")[1] or ".jpg"
            unique_name = f"{uuid.uuid4().hex}{suffix}"

            # Save temporary file for analysis
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(image.file, tmp)
                temp_path = tmp.name

            temp_paths.append(temp_path)

            # Upload to Cloudinary if configured, otherwise persist locally
            if (
                settings.CLOUDINARY_CLOUD_NAME
                and settings.CLOUDINARY_API_KEY
                and settings.CLOUDINARY_API_SECRET
            ):
                try:
                    upload_result = cloudinary.uploader.upload(
                        temp_path,
                        folder=f"shopping-rag/{user_id}",
                    )
                    cloud_urls.append(upload_result["secure_url"])
                except Exception as e:
                    logger.warning(f"Cloudinary upload failed: {e}. Storing locally.")
                    local_dest = os.path.join(UPLOAD_LOCAL_DIR, unique_name)
                    shutil.copy(temp_path, local_dest)
                    cloud_urls.append(f"/uploads/{unique_name}")
            else:
                local_dest = os.path.join(UPLOAD_LOCAL_DIR, unique_name)
                shutil.copy(temp_path, local_dest)
                cloud_urls.append(f"/uploads/{unique_name}")

        try:
            # ------------------------------------
            # Vision Analysis
            # ------------------------------------
            products = VisionService.analyze_multiple_products(temp_paths)

            # ------------------------------------
            # Merge Metadata
            # ------------------------------------
            fused = MetadataFusionService.merge(products)

            embedding_summary = MetadataFusionService.create_embedding_summary(fused)
            keywords = MetadataFusionService.create_search_keywords(fused)
            shop = MetadataFusionService.default_shop_metadata()

            # ------------------------------------
            # Persist Product in Database
            # ------------------------------------
            product = Product(
                user_id=user_id,
                brand=fused.brand or "Signature Brand",
                product_name=fused.product_name or fused.category or "Analyzed Product",
                category=fused.category or "General",
                model=fused.model or "Standard",
                color=fused.color or "Original",
                material=fused.material or "Mixed Materials",
                description=fused.description,
                features=fused.features,
                specifications=fused.specifications,
                image_paths=cloud_urls,
                embedding_summary=embedding_summary,
                search_keywords=keywords,
                thumbnail=cloud_urls[0] if cloud_urls else None,
                price=shop["price"],
                currency=shop["currency"],
                rating=shop["rating"],
                review_count=shop["review_count"],
                availability=shop["availability"],
                product_url=shop["product_url"],
            )

            product = ProductRepository.create(db=db, product=product)

            # ------------------------------------
            # Log Activity
            # ------------------------------------
            activity = ActivityLog(
                event_type="upload",
                title=f"Uploaded {product.product_name or product.category or 'product'}",
                subtitle=f"{len(images)} image{'s' if len(images) != 1 else ''} analyzed · {round(fused.confidence * 100)}% confidence",
                product_id=product.id,
                user_id=user_id,
                image=product.thumbnail,
                tags=[t for t in [product.category, product.brand] if t],
            )
            db.add(activity)
            db.commit()

            # ------------------------------------
            # Vector Indexing in Qdrant (with user_id)
            # ------------------------------------
            embedding_service.store_product(
                product_id=product.id,
                text=embedding_summary,
                user_id=user_id,
                metadata={
                    "brand": product.brand,
                    "product_name": product.product_name,
                    "category": product.category,
                    "color": product.color,
                    "price": product.price,
                },
            )

            return (product, fused, products)

        finally:
            # Clean up temp files
            for path in temp_paths:
                if os.path.exists(path):
                    try:
                        os.remove(path)
                    except Exception:
                        pass