import json
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user_id
from app.database.database import get_db
from app.database.models import Product
from app.repositories.search_repository import SearchRepository
from app.schemas.search import (
    ProductComparisonRequest,
    ProductComparisonResponse,
    SearchFilters,
    SearchHistoryResponse,
    SearchRequest,
    SearchResponse,
    SearchSuggestionsResponse,
    SimilarProductsResponse,
    TrendingSearchesResponse,
)
from app.services.image_search import ImageSearchService
from app.services.retrieval import RetrievalService

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

    SearchRepository.log_search(
        db=db,
        query=request.query,
        user_id=current_user_id,
        search_type="text",
        result_count=response.total,
    )

    return response


@router.post("/image", response_model=SearchResponse)
async def image_search(
    image: UploadFile = File(...),
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    response = await ImageSearchService.search(
        db=db,
        image=image,
        user_id=current_user_id,
        limit=limit,
    )

    SearchRepository.log_search(
        db=db,
        query=f"Visual: {response.query[:40]}",
        user_id=current_user_id,
        search_type="image",
        result_count=response.total,
    )

    return response


@router.post("/hybrid", response_model=SearchResponse)
async def hybrid_search(
    image: Optional[UploadFile] = File(None),
    query: Optional[str] = Form(None),
    filters_json: Optional[str] = Form(None),
    limit: int = Form(20),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Multimodal Hybrid Search endpoint: Combines image analysis + text query + post-filters.
    """
    if not image and not (query and query.strip()):
        raise HTTPException(
            status_code=400,
            detail="Either an image or a text query must be provided for hybrid search.",
        )

    parsed_filters = None
    if filters_json:
        try:
            filters_dict = json.loads(filters_json)
            parsed_filters = SearchFilters(**filters_dict)
        except Exception:
            pass

    response = await ImageSearchService.hybrid_search(
        db=db,
        image=image,
        text_query=query,
        user_id=current_user_id,
        limit=limit,
        filters=parsed_filters,
    )

    log_query = f"Hybrid: {query or ''} [img:{image.filename if image else 'none'}]"
    SearchRepository.log_search(
        db=db,
        query=log_query[:60],
        user_id=current_user_id,
        search_type="hybrid",
        result_count=response.total,
    )

    return response


@router.post("/compare", response_model=ProductComparisonResponse)
def compare_products(
    request: ProductComparisonRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Side-by-side product comparison matrix.
    """
    comparison = RetrievalService.generate_comparison_matrix(
        db=db,
        product_ids=request.product_ids,
        user_id=current_user_id,
    )
    return ProductComparisonResponse(**comparison)


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
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    recent = SearchRepository.get_recent_searches(
        db=db,
        user_id=current_user_id,
        limit=limit,
    )
    return SearchHistoryResponse(recent_searches=recent)


@router.get("/trending", response_model=TrendingSearchesResponse)
def trending_searches(
    limit: int = 6,
    db: Session = Depends(get_db),
):
    trending = SearchRepository.get_trending_searches(db=db, limit=limit)
    return TrendingSearchesResponse(trending_searches=trending)


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
        if product.product_name and product.product_name not in suggestions:
            suggestions.append(product.product_name)

    return SearchSuggestionsResponse(suggestions=suggestions)