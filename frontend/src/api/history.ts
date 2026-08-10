import { api } from "./client";
import { ActivityResponse } from "../types/history";

/**
 * Fetch recent activity (uploads, searches, chats) from the backend.
 */
export async function getActivity(limit = 20): Promise<ActivityResponse> {
  const { data } = await api.get<ActivityResponse>("/activity", {
    params: { limit },
  });

  return data;
}