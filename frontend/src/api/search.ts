import { api } from "./client";

import {
  ProductComparisonResponse,
  SearchFilters,
  SearchHistoryResponse,
  SearchRequest,
  SearchResponse,
  SearchSuggestionsResponse,
  SimilarProductsResponse,
  TrendingSearchesResponse,
} from "@/types/search";

// --------------------------------------------------
// Semantic Search
// --------------------------------------------------

export async function semanticSearch(
  request: SearchRequest
): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>(
    "/search/text",
    request
  );

  return data;
}

// --------------------------------------------------
// Image Search
// --------------------------------------------------

export async function imageSearch(
  image: File,
  limit = 20
): Promise<SearchResponse> {
  const formData = new FormData();

  formData.append("image", image);

  const { data } = await api.post<SearchResponse>(
    `/search/image?limit=${limit}`,
    formData
  );

  return data;
}

// --------------------------------------------------
// Multimodal Hybrid Search
// --------------------------------------------------

export async function hybridSearch(
  image?: File,
  query?: string,
  filters?: SearchFilters,
  limit = 20
): Promise<SearchResponse> {
  const formData = new FormData();
  if (image) {
    formData.append("image", image);
  }
  if (query) {
    formData.append("query", query);
  }
  if (filters) {
    formData.append("filters_json", JSON.stringify(filters));
  }
  formData.append("limit", limit.toString());

  const { data } = await api.post<SearchResponse>(
    "/search/hybrid",
    formData
  );

  return data;
}


// --------------------------------------------------
// Product Comparison
// --------------------------------------------------

export async function compareProducts(
  productIds: number[]
): Promise<ProductComparisonResponse> {
  const { data } = await api.post<ProductComparisonResponse>(
    "/search/compare",
    { product_ids: productIds }
  );

  return data;
}

// --------------------------------------------------
// Similar Products
// --------------------------------------------------

export async function getSimilarProducts(
  productId: number
): Promise<SimilarProductsResponse> {
  const { data } =
    await api.get<SimilarProductsResponse>(
      `/search/similar/${productId}`
    );

  return data;
}

// --------------------------------------------------
// Search Suggestions
// --------------------------------------------------

export async function getSuggestions(
  query: string
): Promise<SearchSuggestionsResponse> {
  const { data } =
    await api.get<SearchSuggestionsResponse>(
      "/search/suggestions",
      {
        params: {
          q: query,
        },
      }
    );

  return data;
}

// --------------------------------------------------
// Recent Searches
// --------------------------------------------------

export async function getSearchHistory(limit = 10): Promise<SearchHistoryResponse> {
  const { data } =
    await api.get<SearchHistoryResponse>(
      "/search/history",
      { params: { limit } }
    );

  return data;
}

// --------------------------------------------------
// Trending Searches
// --------------------------------------------------

export async function getTrendingSearches(limit = 6): Promise<TrendingSearchesResponse> {
  const { data } =
    await api.get<TrendingSearchesResponse>(
      "/search/trending",
      { params: { limit } }
    );

  return data;
}