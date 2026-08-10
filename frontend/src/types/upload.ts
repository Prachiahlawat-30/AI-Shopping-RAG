export interface UploadedImage {
  file: File;
  preview: string;
}

/**
 * Upload API Response
 */
export interface UploadResponse {
  status: string;
  message: string;
  question: string;
  product_id: number;

  metadata: {
    product_name?: string;
    brand?: string;
    category?: string;
    model?: string;
    color?: string;
    material?: string;
    availability?: string;
  };

  summary: string;

  features: string[];

  specifications: Record<string, string>;

  confidence: number;

  confidence_scores: {
  brand: number;
  category: number;
  color: number;
  material: number;
  features: number;
  description: number;
};

  images: string[];

  pipeline: {
    upload: boolean;
    vision: boolean;
    metadata: boolean;
    postgres: boolean;
    embedding: boolean;
    qdrant: boolean;
  };

  individual_results: AnalysisResult[];
}

/**
 * Individual GPT Vision result for each uploaded image
 */
export interface AnalysisResult {
  brand?: string;
  product_name?: string;
  category?: string;
  model?: string;
  color?: string;
  material?: string;
  description: string;
  confidence: number;
  features: string[];
  specifications: Record<string, string>;
}