import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

export function getImageUrl(path?: string | null): string {
  if (!path) return "/placeholder-product.png";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}