import { useQuery } from "@tanstack/react-query";
import { getActivity } from "../api/history";
import { ActivityResponse } from "../types/history";

export function useActivity(limit = 20) {
  return useQuery<ActivityResponse>({
    queryKey: ["activity", limit],
    queryFn: () => getActivity(limit),
    staleTime: 1000 * 30,
  });
}