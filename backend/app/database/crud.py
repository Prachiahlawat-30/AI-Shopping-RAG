from sqlalchemy.orm import Session

from app.database.models import Product


def create_product(
    db: Session,
    product_data: dict,
):

    product = Product(**product_data)

    db.add(product)

    db.commit()

    db.refresh(product)

    return product


def get_product(
    db: Session,
    product_id: int,
):

    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def get_all_products(
    db: Session,
):

    return db.query(Product).all()

def get_products_by_ids(
    db: Session,
    product_ids: list[int],
):

    return (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .all()
    )