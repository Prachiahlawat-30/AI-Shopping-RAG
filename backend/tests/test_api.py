import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["OPENAI_API_KEY"] = "sk-dummy-test-key"
os.environ["DATABASE_URL"] = "sqlite:///./test_app.db"
os.environ["QDRANT_URL"] = ":memory:"
os.environ["DEV_MODE"] = "true"

from app.main import app
from app.database.database import Base, get_db
from app.database.models import Product
from app.core.dependencies import get_current_user_id

engine = create_engine("sqlite:///./test_app.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user_id] = lambda: "dev-user-001"

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    sample1 = Product(
        id=101,
        user_id="dev-user-001",
        brand="Apple",
        product_name="MacBook Pro 16",
        category="Laptops",
        price=249900.0,
        currency="INR",
        rating=4.9,
        review_count=85,
        availability="In Stock",
        description="Apple M3 Max silicon powerhouse.",
        features=["M3 Max", "36GB RAM", "Liquid Retina XDR"],
        specifications={"Processor": "M3 Max", "Memory": "36GB"},
    )
    sample2 = Product(
        id=102,
        user_id="dev-user-001",
        brand="Dell",
        product_name="XPS 15",
        category="Laptops",
        price=189900.0,
        currency="INR",
        rating=4.7,
        review_count=60,
        availability="In Stock",
        description="Dell flagship OLED laptop.",
        features=["Intel Core i9", "32GB RAM", "4K OLED"],
        specifications={"Processor": "Intel i9", "Memory": "32GB"},
    )
    db.merge(sample1)
    db.merge(sample2)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_search_text_endpoint():
    response = client.post("/search/text", json={"query": "MacBook Pro", "limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert data["query"] == "MacBook Pro"

def test_search_trending_endpoint():
    response = client.get("/search/trending")
    assert response.status_code == 200
    data = response.json()
    assert "trending_searches" in data

def test_compare_endpoint():
    response = client.post("/search/compare", json={"product_ids": [101, 102]})
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "spec_matrix" in data
    assert len(data["products"]) == 2

def test_chat_endpoint():
    response = client.post("/chat", json={"question": "What is the price of the MacBook Pro?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "question" in data
