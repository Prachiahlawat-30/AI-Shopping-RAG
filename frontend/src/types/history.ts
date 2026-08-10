export type ActivityType = "upload" | "search" | "chat";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  time: string;
  image?: string;
  tags?: string[];
}

export interface ActivityResponse {
  events: ActivityEvent[];
}