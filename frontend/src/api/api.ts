import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL as string,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default api;
