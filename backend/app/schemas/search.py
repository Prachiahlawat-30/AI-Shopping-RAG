from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================================
# Search Filters
# ============================================================

class SearchFilters(BaseModel):
    """
    Metadata filters applied after semantic search.
    """

    brands: Optional[List[str]] = None

    categories: Optional[List[str]] = None

    colors: Optional[List[str]] = None

    materials: Optional[List[str]] = None

    min_price: Optional[float] = None

    max_price: Optional[float] = None

    min_rating: Optional[float] = None

    availability: Optional[str] = None


# ============================================================
# Text Search Request
# ============================================================

class SearchRequest(BaseModel):
    """
    Semantic search using text.
    """

    query: str = Field(
        ...,
        min_length=2,
        description="User search query",
    )

    page: int = Field(
        default=1,
        ge=1,
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
    )

    filters: Optional[SearchFilters] = None


# ============================================================
# Image Search Request
# ============================================================

class ImageSearchRequest(BaseModel):
    """
    Search using uploaded image.
    """

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
    )

    filters: Optional[SearchFilters] = None


# ============================================================
# Hybrid Search
# ============================================================

class HybridSearchRequest(BaseModel):
    """
    Search using both image and text.
    """

    query: Optional[str] = None

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
    )

    filters: Optional[SearchFilters] = None


# ============================================================
# Product Card
# ============================================================

class ProductCard(BaseModel):
    id: int
    similarity_score: float
    brand: str
    product_name: str
    category: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "INR"
    rating: Optional[float] = None
    review_count: Optional[int] = None
    availability: Optional[str] = None
    thumbnail: Optional[str] = None
    image_paths: List[str] = []
    product_url: Optional[str] = None
    features: List[str] = []              # was Dict[str, Any] = {}
    specifications: Dict[str, Any] = {}    # this one stays a dict — correct

    class Config:
        from_attributes = True


# ============================================================
# Search Response
# ============================================================

class SearchResponse(BaseModel):
    """
    Response returned after search.
    """

    query: str

    total: int

    page: int

    limit: int

    search_time_ms: float

    results: List[ProductCard]


# ============================================================
# Similar Products
# ============================================================

class SimilarProductsResponse(BaseModel):

    product_id: int

    similar_products: List[ProductCard]


# ============================================================
# Search Suggestions
# ============================================================

class SearchSuggestionsResponse(BaseModel):

    suggestions: List[str]


# ============================================================
# Search History
# ============================================================

class SearchHistoryResponse(BaseModel):
    recent_searches: List[str]


# ============================================================
# Trending Searches
# ============================================================

class TrendingSearchesResponse(BaseModel):
    trending_searches: List[str]


# ============================================================
# Product Comparison
# ============================================================

class ProductComparisonRequest(BaseModel):
    product_ids: List[int] = Field(
        ...,
        min_length=2,
        max_length=5,
        description="List of 2 to 5 product IDs to compare",
    )


class ProductComparisonResponse(BaseModel):
    products: List[ProductCard]
    spec_matrix: Dict[str, Dict[str, Any]]
    comparison_summary: str