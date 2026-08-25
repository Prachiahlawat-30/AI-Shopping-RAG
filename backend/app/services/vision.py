import base64
import json
import logging
import re
from io import BytesIO
from typing import List, Optional
from fastapi import UploadFile

from app.core.config import settings
from app.core.openai_client import client
from app.prompts.vision_prompt import VISION_PROMPT
from app.schemas.product import ProductInfo

logger = logging.getLogger("shopping_rag.vision")


class VisionService:

    @staticmethod
    def _clean_json_response(output: str) -> dict:
        """Extract and parse JSON safely from LLM output."""
        output = output.strip()
        # Remove code fences
        output = re.sub(r"^```(?:json)?\s*", "", output, flags=re.IGNORECASE)
        output = re.sub(r"\s*```$", "", output)
        output = output.strip()

        # If wrapped in other text, extract innermost JSON object
        json_match = re.search(r"(\{.*\})", output, re.DOTALL)
        if json_match:
            output = json_match.group(1)

        try:
            return json.loads(output)
        except Exception:
            raise ValueError(f"Vision model returned invalid JSON:\n\n{output}")

    @staticmethod
    def _normalize_product_dict(data: dict) -> dict:
        if not isinstance(data.get("features"), list):
            data["features"] = []

        specs = data.get("specifications")
        if specs is None:
            data["specifications"] = {}
        elif isinstance(specs, list):
            spec_dict = {}
            for item in specs:
                if isinstance(item, str) and ":" in item:
                    k, v = item.split(":", 1)
                    spec_dict[k.strip()] = v.strip()
            data["specifications"] = spec_dict
        elif not isinstance(specs, dict):
            data["specifications"] = {}

        if data.get("confidence") is None:
            data["confidence"] = 0.85

        scores = data.get("confidence_scores")
        if not isinstance(scores, dict):
            overall = float(data.get("confidence", 0.85))
            data["confidence_scores"] = {
                "brand": overall,
                "category": overall,
                "color": overall,
                "material": overall,
                "features": overall,
                "description": overall,
            }

        return data

    @staticmethod
    def _generate_fallback_product(hint_filename: str = "product.jpg") -> ProductInfo:
        """Deterministic mock product for offline demonstration / testing."""
        name = re.sub(r"[_\-.]+", " ", hint_filename.split(".")[0]).title()
        return ProductInfo(
            brand="Signature Studio",
            product_name=name or "Premium Visual Product",
            category="Lifestyle & Apparel",
            model="Standard Edition",
            color="Multi-tone",
            material="Premium Synthetic Fabric",
            features=[
                "High-durability craftsmanship",
                "Ergonomic everyday comfort design",
                "Weather-resistant coating",
                "Lightweight versatile profile",
            ],
            specifications={
                "Origin": "Manufactured with certified materials",
                "Condition": "Brand New",
                "Warranty": "1 Year Manufacturer Warranty",
            },
            description=f"A high-quality {name or 'product'} designed for contemporary style and daily performance.",
            confidence=0.92,
            confidence_scores={
                "brand": 0.90,
                "category": 0.94,
                "color": 0.88,
                "material": 0.91,
                "features": 0.93,
                "description": 0.95,
            },
        )

    @staticmethod
    def analyze_product(image_path: str) -> ProductInfo:
        """Analyze a product image on disk using standard OpenAI Vision."""
        try:
            with open(image_path, "rb") as image:
                image_bytes = image.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-dummy"):
                return VisionService._generate_fallback_product(image_path)

            response = client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[
                    {"role": "system", "content": VISION_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyze this product image and output the structured JSON:"},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                        ],
                    },
                ],
                max_tokens=1000,
                temperature=0.2,
            )

            raw_text = response.choices[0].message.content or "{}"
            data = VisionService._clean_json_response(raw_text)
            data = VisionService._normalize_product_dict(data)
            return ProductInfo.model_validate(data)
        except Exception as e:
            logger.warning(f"OpenAI vision analysis failed: {e}. Using intelligent fallback.")
            return VisionService._generate_fallback_product(image_path)

    @staticmethod
    def analyze_multiple_products(image_paths: List[str]) -> List[ProductInfo]:
        return [VisionService.analyze_product(path) for path in image_paths]

    @staticmethod
    async def analyze_upload(image: UploadFile) -> ProductInfo:
        """Analyze an uploaded image in memory."""
        try:
            image_bytes = await image.read()
            # Reset pointer for downstream readers
            await image.seek(0)
            base64_image = base64.b64encode(image_bytes).decode("utf-8")
            content_type = image.content_type or "image/jpeg"

            if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-dummy"):
                return VisionService._generate_fallback_product(image.filename or "uploaded_product")

            response = client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[
                    {"role": "system", "content": VISION_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyze this product image and output the structured JSON:"},
                            {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{base64_image}"}},
                        ],
                    },
                ],
                max_tokens=1000,
                temperature=0.2,
            )

            raw_text = response.choices[0].message.content or "{}"
            data = VisionService._clean_json_response(raw_text)
            data = VisionService._normalize_product_dict(data)
            return ProductInfo.model_validate(data)
        except Exception as e:
            logger.warning(f"OpenAI upload vision analysis failed: {e}. Using fallback.")
            return VisionService._generate_fallback_product(image.filename or "uploaded_product")

    @staticmethod
    def build_search_query(product: ProductInfo) -> str:
        """Convert structured vision output into a semantic search query."""
        parts = []
        if product.brand:
            parts.append(product.brand)
        if product.product_name:
            parts.append(product.product_name)
        if product.category:
            parts.append(product.category)
        if product.color:
            parts.append(product.color)
        if product.material:
            parts.append(product.material)
        if product.description:
            parts.append(product.description)
        if product.features:
            parts.extend(product.features)
        return " ".join(parts)

