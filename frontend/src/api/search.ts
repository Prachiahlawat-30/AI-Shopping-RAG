import { api } from "./client";

import {
  SearchRequest,
  SearchResponse,
  SimilarProductsResponse,
  SearchSuggestionsResponse,
  SearchHistoryResponse,
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
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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

export async function getSearchHistory(): Promise<SearchHistoryResponse> {
  const { data } =
    await api.get<SearchHistoryResponse>(
      "/search/history"
    );

  return data;
}

// --------------------------------------------------
// Hybrid Search (Future)
// --------------------------------------------------

export async function hybridSearch(
  formData: FormData
): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>(
    "/search/hybrid",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}