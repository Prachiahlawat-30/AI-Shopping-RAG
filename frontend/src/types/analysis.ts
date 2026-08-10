export interface AnalysisData {
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
    [key: string]: any;
  };

  summary: string;

  features: string[];

  specifications: Record<string, string>;

  confidence: number;

  confidence_scores: Record<string, number>;

  images: string[];

  pipeline: {
    upload: boolean;
    vision: boolean;
    metadata: boolean;
    postgres: boolean;
    embedding: boolean;
    qdrant: boolean;
  };

  individual_results: any[];
}

export interface AnalysisComponentProps {
  data: AnalysisData;
}