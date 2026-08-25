import { useMutation, useQuery } from "@tanstack/react-query";

import {
  semanticSearch,
  imageSearch,
  getSimilarProducts,
  getSuggestions,
  getSearchHistory,
} from "../api/search";

import {
  SearchRequest,
  SearchResponse,
  SimilarProductsResponse,
  SearchSuggestionsResponse,
  SearchHistoryResponse,
} from "@/types/search";


// -----------------------------------------------------
// Semantic Search
// -----------------------------------------------------

export function useSemanticSearch() {
  return useMutation<SearchResponse, Error, SearchRequest>({
    mutationFn: semanticSearch,
  });
}


// -----------------------------------------------------
// Image Search
// -----------------------------------------------------

export function useImageSearch() {
  return useMutation<SearchResponse, Error, File>({
    mutationFn: (file) => imageSearch(file),
  });
}


// -----------------------------------------------------
// Similar Products
// -----------------------------------------------------

export function useSimilarProducts(productId?: number) {
  return useQuery<SimilarProductsResponse>({
    queryKey: ["similar-products", productId],
    queryFn: () => getSimilarProducts(productId!),
    enabled: !!productId,
  });
}


// -----------------------------------------------------
// Search Suggestions
// -----------------------------------------------------

export function useSearchSuggestions(query: string) {
  return useQuery<SearchSuggestionsResponse>({
    queryKey: ["search-suggestions", query],
    queryFn: () => getSuggestions(query),
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 5,
  });
}


// -----------------------------------------------------
// Search History
// -----------------------------------------------------

export function useSearchHistory(limit = 10) {
  return useQuery<SearchHistoryResponse>({
    queryKey: ["search-history", limit],
    queryFn: () => getSearchHistory(limit),
    staleTime: 1000 * 60 * 10,
  });
}