import { api } from "./client";
import { ChatRequest, ChatResponse } from "../types/chat";

/**
 * Ask a question, grounded in retrieved product context (RAG).
 */
export async function sendChatMessage(
  question: string
): Promise<ChatResponse> {
  const payload: ChatRequest = { question };

  const response = await api.post<ChatResponse>("/chat", payload);

  return response.data;
}