export interface SearchFilters {
  brands?: string[];
  categories?: string[];
  colors?: string[];
  materials?: string[];
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  availability?: string;
}

export interface SearchRequest {
  query: string;
  page: number;
  limit: number;
  filters?: SearchFilters | null;
}

export interface ProductCard {
  id: number;

  similarity_score: number;

  brand: string;

  product_name: string;

  category?: string;

  model?: string;

  color?: string;

  material?: string;

  description?: string;

  price?: number;

  currency?: string;

  rating?: number;

  review_count?: number;

  availability?: string;

  thumbnail?: string;

  image_paths: string[];

  product_url?: string;

  features: string[];

  specifications: Record<string, any>;
}

export interface SearchResponse {
  query: string;

  total: number;

  page: number;

  limit: number;

  search_time_ms: number;

  results: ProductCard[];
}

export interface SimilarProductsResponse {
  product_id: number;

  similar_products: ProductCard[];
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
}

export interface SearchHistoryResponse {
  recent_searches: string[];
}