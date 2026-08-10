from typing import List

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Product
from app.database.search_models import SearchHistory
from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    SimilarProductsResponse,
    SearchSuggestionsResponse,
    SearchHistoryResponse,
)

from app.services.retrieval import RetrievalService
from app.services.image_search import ImageSearchService
from app.core.dependencies import get_current_user_id



router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.post("/text", response_model=SearchResponse)
def semantic_search(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    response = RetrievalService.semantic_search(
        db=db,
        request=request,
        user_id=current_user_id,
    )

    history = SearchHistory(
        query=request.query,
        search_type="text",
        result_count=response.total,
        user_id=current_user_id,
    )
    db.add(history)
    db.commit()

    return response


@router.get("/similar/{product_id}", response_model=SimilarProductsResponse)
def similar_products(
    product_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.user_id == current_user_id,
        )
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    products = RetrievalService.similar_products(
        db=db,
        product_id=product_id,
        user_id=current_user_id,
    )

    return SimilarProductsResponse(
        product_id=product_id,
        similar_products=products,
    )


@router.get("/history", response_model=SearchHistoryResponse)
def search_history(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    history = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user_id)
        .order_by(SearchHistory.created_at.desc())
        .limit(10)
        .all()
    )

    return SearchHistoryResponse(
        recent_searches=[item.query for item in history]
    )


@router.get("/suggestions", response_model=SearchSuggestionsResponse)
def search_suggestions(
    q: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    products = (
        db.query(Product)
        .filter(
            Product.product_name.ilike(f"%{q}%"),
            Product.user_id == current_user_id,
        )
        .limit(10)
        .all()
    )

    suggestions = []
    for product in products:
        if product.product_name not in suggestions:
            suggestions.append(product.product_name)

    return SearchSuggestionsResponse(suggestions=suggestions)


@router.post("/image", response_model=SearchResponse)
async def image_search(
    image: UploadFile = File(...),
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    return await ImageSearchService.search(
        db=db,
        image=image,
        user_id=current_user_id,
        limit=limit,
    )


@router.post("/hybrid")
async def hybrid_search():
    """
    Implemented after image search.
    """
    raise HTTPException(
        status_code=501,
        detail="Hybrid search not implemented yet.",
    )