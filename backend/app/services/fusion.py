from typing import Dict, List

from app.schemas.product import ProductInfo


class MetadataFusionService:
    """
    Merge metadata extracted from multiple images.
    """

    @staticmethod
    def merge(products: List[ProductInfo]) -> ProductInfo:

        if not products:
            raise ValueError("No product metadata found.")

        base = products[0]

        features = []

        seen_features = set()

        specifications: Dict[str, str] = {}

        confidence_scores: Dict[str, float] = {}

        for product in products:

            # -------------------------
            # Basic Information
            # -------------------------

            if not base.brand and product.brand:
                base.brand = product.brand

            if not base.product_name and product.product_name:
                base.product_name = product.product_name

            if not base.category and product.category:
                base.category = product.category

            if not base.model and product.model:
                base.model = product.model

            if not base.color and product.color:
                base.color = product.color

            if not base.material and product.material:
                base.material = product.material

            if not base.description and product.description:
                base.description = product.description

            if product.confidence > base.confidence:
                base.confidence = product.confidence

            # -------------------------
            # Features
            # -------------------------

            for feature in product.features:

                if feature not in seen_features:

                    seen_features.add(feature)

                    features.append(feature)

            # -------------------------
            # Specifications
            # -------------------------

            specifications.update(product.specifications)

            # -------------------------
            # Confidence Scores
            # -------------------------

            for key, value in product.confidence_scores.items():

                if (
                    key not in confidence_scores
                    or value > confidence_scores[key]
                ):
                    confidence_scores[key] = value

        base.features = features

        base.specifications = specifications

        base.confidence_scores = confidence_scores

        return base

    @staticmethod
    def create_summary(product: ProductInfo) -> str:

        specs = "\n".join(
            f"{k}: {v}"
            for k, v in product.specifications.items()
        )

        summary = f"""
Brand:
{product.brand}

Product Name:
{product.product_name}

Category:
{product.category}

Model:
{product.model}

Color:
{product.color}

Material:
{product.material}

Description:
{product.description}

Features:
{", ".join(product.features)}

Specifications:
{specs}
"""

        return summary.strip()
    
    @staticmethod
    def create_search_keywords(
        product: ProductInfo,
    ) -> List[str]:
        """
        Generate searchable keywords for vector search
        and future autocomplete.
        """

        keywords = set()

        fields = [
            product.brand,
            product.product_name,
            product.category,
            product.model,
            product.color,
            product.material,
        ]

        for value in fields:

            if value:
                keywords.add(value.lower())

        for feature in product.features:

            if feature:
                keywords.add(feature.lower())

        return sorted(keywords)
    
    
    @staticmethod
    def create_embedding_summary(
        product: ProductInfo,
    ) -> str:
        """
        Optimized summary for embedding generation.
        """

        parts = []

        if product.brand:
            parts.append(product.brand)

        if product.product_name:
            parts.append(product.product_name)

        if product.category:
            parts.append(product.category)

        if product.model:
            parts.append(product.model)

        if product.color:
            parts.append(product.color)

        if product.material:
            parts.append(product.material)

        if product.description:
            parts.append(product.description)

        if product.features:
            parts.extend(product.features)

        for key, value in product.specifications.items():

            parts.append(f"{key}: {value}")

        return " ".join(parts)
    
    
    @staticmethod
    def get_thumbnail(
        image_paths: List[str],
    ) -> str | None:

        if not image_paths:
            return None

        return image_paths[0]
    
    
    @staticmethod
    def default_shop_metadata() -> dict:

        return {

            "price": None,

            "currency": "INR",

            "rating": 0.0,

            "review_count": 0,

            "availability": "In Stock",

            "product_url": None,

        }