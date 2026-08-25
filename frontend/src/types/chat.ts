import { ProductCard } from "./search";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  question: string;
  history?: ChatHistoryItem[];
}

export interface ChatResponse {
  question: string;
  context: string;
  answer: string;
  products?: ProductCard[];
  suggested_followups?: string[];
  grounding_score?: number;
}