import { useState } from "react";
import { sendChatMessage } from "../api/chat";
import { ChatResponse } from "../types/chat";

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (question: string): Promise<ChatResponse | null> => {
    if (!question.trim()) return null;

    try {
      setLoading(true);
      setError("");

      const response = await sendChatMessage(question);

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