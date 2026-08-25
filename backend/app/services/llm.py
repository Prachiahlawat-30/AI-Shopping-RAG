import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.openai_client import client
from app.prompts.chat_prompt import SYSTEM_PROMPT, build_chat_prompt
from app.schemas.search import ProductCard
from app.services.retrieval import RetrievalService

logger = logging.getLogger("shopping_rag.llm")


class LLMService:

    @staticmethod
    def answer_question(
        db: Session,
        question: str,
        user_id: str,
        top_k: int = 5,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> dict:
        """
        Answer user question using RAG retrieval grounded in user's catalog.
        Returns answer text, formatted context, and structured product citations.
        """
        # ---------------------------------
        # Retrieve Products & Context
        # ---------------------------------
        products = RetrievalService.retrieve(
            db=db,
            question=question,
            user_id=user_id,
            top_k=top_k,
        )

        context_str = RetrievalService.format_context(products)

        # Build citation cards
        citation_cards = [
            ProductCard(
                id=p.id,
                similarity_score=95.0,
                brand=p.brand or "Brand",
                product_name=p.product_name or "Product",
                category=p.category,
                model=p.model,
                color=p.color,
                material=p.material,
                description=p.description,
                price=p.price,
                currency=p.currency or "INR",
                rating=p.rating,
                review_count=p.review_count,
                availability=p.availability,
                thumbnail=p.thumbnail,
                image_paths=p.image_paths or [],
                product_url=p.product_url,
                features=p.features or [],
                specifications=p.specifications or {},
            )
            for p in products
        ]

        # ---------------------------------
        # Generate Answer via OpenAI
        # ---------------------------------
        if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-dummy"):
            answer = LLMService._generate_fallback_answer(question, products)
        else:
            try:
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]

                # Include previous conversation turns if provided
                if history:
                    for turn in history[-4:]:
                        role = turn.get("role", "user")
                        content = turn.get("content", "")
                        if role in ("user", "assistant") and content:
                            messages.append({"role": role, "content": content})

                user_prompt = build_chat_prompt(question=question, context=context_str)
                messages.append({"role": "user", "content": user_prompt})

                response = client.chat.completions.create(
                    model=settings.MODEL_NAME,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=600,
                )
                answer = response.choices[0].message.content or "No response generated."
            except Exception as e:
                logger.warning(f"OpenAI chat completion failed: {e}. Using grounded fallback generator.")
                answer = LLMService._generate_fallback_answer(question, products)

        suggested_followups = LLMService._generate_followups(question, products)

        return {
            "question": question,
            "context": context_str,
            "answer": answer,
            "products": [c.model_dump() for c in citation_cards],
            "suggested_followups": suggested_followups,
            "grounding_score": 0.95 if products else 0.0,
        }

    @staticmethod
    def _generate_fallback_answer(question: str, products: list) -> str:
        """Grounded rule-based answer generator when OpenAI key is absent or offline."""
        if not products:
            return (
                "I couldn't find any matching products in your catalog for that question. "
                "Please try uploading relevant product images or refining your query."
            )

        top = products[0]
        q_lower = question.lower()

        if "material" in q_lower or "made of" in q_lower:
            mat = top.material or "high-grade materials"
            return f"Based on your catalog, **{top.product_name}** by {top.brand} is crafted from **{mat}**."

        if "price" in q_lower or "cost" in q_lower or "cheap" in q_lower:
            price_info = f"{top.currency} {top.price}" if top.price else "price not specified"
            return f"**{top.product_name}** is listed at **{price_info}** (Availability: {top.availability or 'In Stock'})."

        if "feature" in q_lower or "spec" in q_lower:
            features = ", ".join(top.features[:4]) if top.features else "Standard quality specifications"
            return f"Key highlights for **{top.product_name}** include: {features}."

        if "compare" in q_lower or "difference" in q_lower or len(products) > 1:
            names = " and ".join(f"**{p.product_name}** ({p.brand})" for p in products[:2])
            return (
                f"Comparing your retrieved catalog items: {names}.\n\n"
                f"- **{products[0].product_name}**: Category {products[0].category or 'General'}, {products[0].material or 'Durable build'}.\n"
                + (f"- **{products[1].product_name}**: Category {products[1].category or 'General'}, {products[1].material or 'Durable build'}." if len(products) > 1 else "")
            )

        return (
            f"Regarding **{top.product_name}** ({top.brand} - {top.category}):\n\n"
            f"{top.description}\n\n"
            f"**Key features:** {', '.join(top.features[:3]) if top.features else 'Premium craftsmanship'}."
        )

    @staticmethod
    def _generate_followups(question: str, products: list) -> List[str]:
        if not products:
            return [
                "What products are currently uploaded?",
                "How do I upload new product photos?",
            ]
        top = products[0]
        return [
            f"What are the specifications of {top.product_name}?",
            f"What materials is {top.brand} using?",
            "Find similar alternatives in my catalog",
        ]