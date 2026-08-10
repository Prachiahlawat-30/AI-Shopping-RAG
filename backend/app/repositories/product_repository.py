from sqlalchemy.orm import Session

from app.database.models import Product


class ProductRepository:
    """
    Handles all Product database operations.
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
    ) -> Product | None:

        return (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
    ):

        return db.query(Product).all()

    @staticmethod
    def update(
        db: Session,
        product: Product,
    ):

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