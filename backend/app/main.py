from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.upload import router as upload_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.activity import router as activity_router

app = FastAPI(title="Shopping Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-deployed-frontend-domain.com",  # update once you have it
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Shopping Assistant Backend Running"
    }


app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(activity_router)
