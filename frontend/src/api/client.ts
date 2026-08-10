import axios from "axios";

declare global {
  interface Window {
    Clerk?: any;
  }
}

export const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || "http://localhost:8000",
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(
      error.response?.data || { message: "Something went wrong." }
    );
  }
);