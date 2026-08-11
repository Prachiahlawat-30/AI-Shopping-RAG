from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.activity import router as activity_router

from app.core.config import settings


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Shopping Assistant API",
    description="AI-powered shopping assistant with visual search, RAG, and AI chat.",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

allowed_origins = [
    "http://localhost:5173",
    settings.FRONTEND_URL,
]


# Remove duplicates while preserving order
allowed_origins = list(dict.fromkeys(allowed_origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Health Check
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Shopping Assistant Backend Running",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
    }


# ============================================================
# API Routers
# ============================================================

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(activity_router)