import { useState } from "react";
import { sendChatMessage } from "../api/chat";
import { ChatHistoryItem, ChatResponse } from "../types/chat";

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (
    question: string,
    history?: ChatHistoryItem[]
  ): Promise<ChatResponse | null> => {
    if (!question.trim()) return null;

    try {
      setLoading(true);
      setError("");

      const response = await sendChatMessage(question, history);

      return response;
    } catch (err: any) {
      setError(
        err?.detail || err?.message || "Failed to get a response."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading, error };
}