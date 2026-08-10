from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.prompts.chat_prompt import (
    SYSTEM_PROMPT,
    build_chat_prompt,
)
from app.services.retrieval import RetrievalService


client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
)


class LLMService:

    @staticmethod
    def answer_question(
        db: Session,
        question: str,
    ) -> dict:

        # ---------------------------------
        # Retrieve Context
        # ---------------------------------

        context = RetrievalService.retrieve_context(
            db=db,
            question=question,
            top_k=5,
        )

        # ---------------------------------
        # Ask GPT
        # ---------------------------------

        response = client.responses.create(
            model=settings.MODEL_NAME,
            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": build_chat_prompt(
                        question=question,
                        context=context,
                    ),
                },
            ],
        )

        return {
            "question": question,
            "context": context,
            "answer": response.output_text,
        }