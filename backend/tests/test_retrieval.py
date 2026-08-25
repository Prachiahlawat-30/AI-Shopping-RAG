from app.services.retrieval import RetrievalService
from app.database.models import Product
from app.schemas.search import SearchFilters

def test_format_context():
    p = Product(
        id=1,
        brand="Logitech",
        product_name="MX Master 3S Mouse",
        category="Peripherals",
        color="Graphite",
        price=7995.0,
        currency="INR",
        rating=4.9,
        review_count=350,
        availability="In Stock",
        description="Ergonomic performance wireless mouse.",
        features=["Quiet Clicks", "8K DPI"],
        specifications={"Battery": "500mAh", "Connectivity": "Bluetooth"}
    )
    context = RetrievalService.format_context([p])
    assert "Logitech" in context
    assert "MX Master 3S" in context
    assert "7995.0" in context
    assert "Quiet Clicks" in context

def test_filter_products():
    p1 = Product(id=1, brand="Apple", category="Electronics", price=500.0, rating=4.5, availability="In Stock")
    p2 = Product(id=2, brand="Dell", category="Computers", price=1200.0, rating=4.0, availability="Out of Stock")

    filters = SearchFilters(brands=["Apple"], max_price=600.0)
    filtered = RetrievalService._apply_filters([p1, p2], filters)
    assert len(filtered) == 1
    assert filtered[0].brand == "Apple"
