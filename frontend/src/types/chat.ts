export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  question: string;
  context: string;
  answer: string;
}