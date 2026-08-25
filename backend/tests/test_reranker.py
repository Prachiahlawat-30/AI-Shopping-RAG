from app.services.reranker import RelevanceReranker
from app.database.models import Product

def test_reranker_lexical_overlap():
    p1 = Product(
        id=1,
        brand="Apple",
        product_name="iPhone 15 Pro Max Titanium",
        category="Smartphones",
        color="Natural Titanium",
        material="Titanium",
        features=["A17 Pro", "USB-C"],
        specifications={"Storage": "256GB"},
        rating=4.8,
        review_count=120,
    )
    p2 = Product(
        id=2,
        brand="Samsung",
        product_name="Galaxy S24 Ultra",
        category="Smartphones",
        color="Titanium Gray",
        material="Titanium",
        features=["Galaxy AI", "S Pen"],
        specifications={"Storage": "512GB"},
        rating=4.7,
        review_count=90,
    )

    query = "Apple iPhone Pro Max"
    score1 = RelevanceReranker.calculate_lexical_score(query, p1)
    score2 = RelevanceReranker.calculate_lexical_score(query, p2)

    assert score1 > score2
    assert score1 > 0.2

def test_rerank_products_order():
    p1 = Product(id=1, brand="Sony", product_name="WH-1000XM5 Headphones", category="Audio", rating=4.9, review_count=500)
    p2 = Product(id=2, brand="Bose", product_name="QuietComfort 45", category="Audio", rating=4.5, review_count=300)

    candidates = [
        {"product": p2, "score": 85.0},
        {"product": p1, "score": 80.0},
    ]

    reranked = RelevanceReranker.rerank_products("Sony XM5 Headphones", candidates)
    assert reranked[0]["product"].brand == "Sony"
