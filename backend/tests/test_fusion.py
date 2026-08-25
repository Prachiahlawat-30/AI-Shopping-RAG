from app.schemas.product import ProductInfo
from app.services.fusion import MetadataFusionService

def test_metadata_fusion_merge():
    p1 = ProductInfo(
        brand="Nike",
        product_name="Nike Pegasus",
        category="Shoes",
        color="Black",
        material="Mesh",
        description="Daily running shoes.",
        confidence=0.85,
        features=["Lightweight", "Breathable"],
        specifications={"Sole": "Rubber"},
        confidence_scores={"brand": 0.9}
    )
    p2 = ProductInfo(
        brand="Nike",
        product_name="Nike Air Pegasus 40",
        category="Running Shoes",
        color="Black",
        material="Flyknit",
        description="Premium responsive running shoes.",
        confidence=0.95,
        features=["Air Zoom", "Lightweight"],
        specifications={"Closure": "Lace"},
        confidence_scores={"brand": 0.95, "material": 0.88}
    )

    merged = MetadataFusionService.merge([p1, p2])

    assert merged.brand == "Nike"
    assert "Lightweight" in merged.features
    assert "Air Zoom" in merged.features
    assert merged.specifications["Sole"] == "Rubber"
    assert merged.specifications["Closure"] == "Lace"

def test_embedding_summary_creation():
    p = ProductInfo(
        brand="Apple",
        product_name="iPhone 15 Pro",
        category="Smartphones",
        color="Titanium",
        material="Titanium Glass",
        description="Flagship smartphone.",
        confidence=0.98,
        features=["A17 Pro", "Dynamic Island"],
        specifications={"Storage": "256GB"}
    )
    summary = MetadataFusionService.create_embedding_summary(p)
    assert "Apple" in summary
    assert "iPhone 15 Pro" in summary
    assert "A17 Pro" in summary
    assert "Storage: 256GB" in summary
