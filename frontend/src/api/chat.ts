import { api } from "./client";
import { ChatHistoryItem, ChatRequest, ChatResponse } from "../types/chat";

/**
 * Ask a question, grounded in retrieved product context (RAG).
 */
export async function sendChatMessage(
  question: string,
  history?: ChatHistoryItem[]
): Promise<ChatResponse> {
  const payload: ChatRequest = { question, history };

  const response = await api.post<ChatResponse>("/chat", payload);

  return response.data;
}