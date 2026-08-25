from app.database.database import Base, engine
from app.database.models import Product
from app.database.search_models import SearchHistory, ProductSimilarity
from app.database.activity_models import ActivityLog

Base.metadata.create_all(bind=engine)
print("[SUCCESS] Database tables created successfully in Neon PostgreSQL.")