import os
import shutil
import tempfile
from typing import List

import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.cloudinary_client import cloudinary 
from app.database.models import Product
from app.repositories.product_repository import ProductRepository
from app.database.activity_models import ActivityLog
from app.services.embedding import embedding_service
from app.services.fusion import MetadataFusionService
from app.services.vision import VisionService


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
}


class ProductService:

    @staticmethod
    async def create_product(
        db: Session,
        images: List[UploadFile],
        user_id: str,
    ) -> Product:

        temp_paths = []
        cloud_urls = []

        # ------------------------------------
        # Save to temp disk (for vision analysis)
        # and upload to Cloudinary (permanent storage)
        # ------------------------------------

        for image in images:

            if image.content_type not in ALLOWED_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"{image.filename} is not supported.",
                )

            suffix = os.path.splitext(image.filename)[1] or ".jpg"

            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(image.file, tmp)
                temp_path = tmp.name

            temp_paths.append(temp_path)

            upload_result = cloudinary.uploader.upload(
                temp_path,
                folder=f"shopping-rag/{user_id}",
            )
            cloud_urls.append(upload_result["secure_url"])

        try:
            # ------------------------------------
            # Vision Analysis (reads from temp files)
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
            # Product Model
            # ------------------------------------

            product = Product(
                user_id=user_id,
                brand=fused.brand or "Unknown",
                product_name=fused.product_name or fused.category or "Unnamed Product",
                category=fused.category,
                model=fused.model,
                color=fused.color,
                material=fused.material,
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

            embedding_service.store_product(
                product_id=product.id,
                text=embedding_summary,
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
            # Always clean up temp files, even if something above fails
            for path in temp_paths:
                if os.path.exists(path):
                    os.remove(path)