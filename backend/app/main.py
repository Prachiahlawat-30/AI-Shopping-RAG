import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.upload import router as upload_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.activity import router as activity_router
from app.database.database import Base, engine
from app.core.config import settings

# Ensure models are imported for metadata creation
import app.database.models
import app.database.search_models
import app.database.activity_models

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup if they do not exist
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Multimodal AI Shopping RAG API",
    description="Enterprise-grade AI Shopping Assistant with Visual Search, Dense+Sparse Hybrid Retrieval, Re-ranking, and RAG Chat.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:80",
    settings.FRONTEND_URL,
]
allowed_origins = list(dict.fromkeys([o for o in allowed_origins if o]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def home():
    return {
        "service": "Multimodal AI Shopping RAG API",
        "status": "healthy",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "database": "connected",
        "vector_store": "ready",
    }


# API Routers
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(activity_router)