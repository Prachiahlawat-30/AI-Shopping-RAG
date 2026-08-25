import os
from openai import OpenAI
from app.core.config import settings

api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY") or "sk-dummy-placeholder-key-for-init"

client = OpenAI(
    api_key=api_key,
)