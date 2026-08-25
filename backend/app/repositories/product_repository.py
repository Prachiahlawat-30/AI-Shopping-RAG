from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.models import Product


class ProductRepository:
    """
    Handles all Product database operations with multi-tenancy support.
    """

    @staticmethod
    def create(
        db: Session,
        product: Product,
    ) -> Product:
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def get_by_id(
        db: Session,
        product_id: int,
        user_id: Optional[str] = None,
    ) -> Optional[Product]:
        query = db.query(Product).filter(Product.id == product_id)
        if user_id:
            query = query.filter(Product.user_id == user_id)
        return query.first()

    @staticmethod
    def get_all(
        db: Session,
        user_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Product]:
        query = db.query(Product)
        if user_id:
            query = query.filter(Product.user_id == user_id)
        return query.order_by(Product.created_at.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def update(
        db: Session,
        product: Product,
    ) -> Product:
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(
        db: Session,
        product: Product,
    ):
        db.delete(product)
        db.commit()