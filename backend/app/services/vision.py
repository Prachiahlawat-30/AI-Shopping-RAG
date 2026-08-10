import base64
import json
import re
from io import BytesIO
from fastapi import UploadFile
from typing import List

from openai import OpenAI

from app.core.config import settings
from app.prompts.vision_prompt import VISION_PROMPT
from app.schemas.product import ProductInfo

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class VisionService:

    @staticmethod
    def analyze_product(image_path: str) -> ProductInfo:
        """
        Analyze a product image using OpenAI Vision.
        """

        with open(image_path, "rb") as image:
            image_bytes = image.read()

        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        response = client.responses.create(
            model=settings.MODEL_NAME,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": VISION_PROMPT,
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{base64_image}",
                        }
                    ],
                },
            ],
        )

        output = response.output_text

        output = re.sub(r"```json", "", output)
        output = re.sub(r"```", "", output)
        output = output.strip()

        try:
            data = json.loads(output)

        except Exception:
            raise ValueError(
                f"Vision model returned invalid JSON:\n\n{output}"
            )

        # -----------------------------
        # Features
        # -----------------------------

        if not isinstance(data.get("features"), list):
            data["features"] = []

        # -----------------------------
        # Specifications
        # -----------------------------

        specs = data.get("specifications")

        if specs is None:
            data["specifications"] = {}

        elif isinstance(specs, list):
            spec_dict = {}
            for item in specs:
                if isinstance(item, str) and ":" in item:
                    key, value = item.split(":", 1)
                    spec_dict[key.strip()] = value.strip()
            data["specifications"] = spec_dict

        elif not isinstance(specs, dict):
            data["specifications"] = {}

        # -----------------------------
        # Confidence
        # -----------------------------

        if data.get("confidence") is None:
            data["confidence"] = 0.0

        # -----------------------------
        # Confidence Scores
        # -----------------------------

        scores = data.get("confidence_scores")

        if not isinstance(scores, dict):
            overall = float(data["confidence"])
            data["confidence_scores"] = {
                "brand": overall,
                "category": overall,
                "color": overall,
                "material": overall,
                "features": overall,
                "description": overall,
            }

        # -----------------------------
        # Product
        # -----------------------------

        return ProductInfo.model_validate(data)

    @staticmethod
    def analyze_multiple_products(
        image_paths: List[str],
    ) -> List[ProductInfo]:

        products = []

        for path in image_paths:
            products.append(
                VisionService.analyze_product(path)
            )

        return products

    @staticmethod
    async def analyze_upload(
        image: UploadFile,
    ) -> ProductInfo:
        """
        Analyze an uploaded image without saving it to disk.
        """

        image_bytes = await image.read()

        base64_image = base64.b64encode(
            image_bytes
        ).decode("utf-8")

        response = client.responses.create(
            model=settings.MODEL_NAME,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": VISION_PROMPT,
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_image",
                            "image_url": (
                                f"data:{image.content_type};base64,{base64_image}"
                            ),
                        }
                    ],
                },
            ],
        )

        output = response.output_text

        output = re.sub(r"```json", "", output)
        output = re.sub(r"```", "", output)
        output = output.strip()

        data = json.loads(output)

        return ProductInfo.model_validate(data)

    @staticmethod
    def build_search_query(
        product: ProductInfo,
    ) -> str:
        """
        Convert structured vision output into a semantic search query.
        """

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
