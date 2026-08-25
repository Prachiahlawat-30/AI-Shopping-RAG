from typing import List, Optional
from sqlalchemy.orm import Session

from app.database.models import Product


def create_product(
    db: Session,
    product_data: dict,
    user_id: Optional[str] = None,
) -> Product:
    if user_id and "user_id" not in product_data:
        product_data["user_id"] = user_id
    product = Product(**product_data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(
    db: Session,
    product_id: int,
    user_id: Optional[str] = None,
) -> Optional[Product]:
    query = db.query(Product).filter(Product.id == product_id)
    if user_id:
        query = query.filter(Product.user_id == user_id)
    return query.first()


def get_all_products(
    db: Session,
    user_id: Optional[str] = None,
) -> List[Product]:
    query = db.query(Product)
    if user_id:
        query = query.filter(Product.user_id == user_id)
    return query.all()


def get_products_by_ids(
    db: Session,
    product_ids: list[int],
    user_id: Optional[str] = None,
) -> List[Product]:
    if not product_ids:
        return []
    query = db.query(Product).filter(Product.id.in_(product_ids))
    if user_id:
        query = query.filter(Product.user_id == user_id)
    return query.all()