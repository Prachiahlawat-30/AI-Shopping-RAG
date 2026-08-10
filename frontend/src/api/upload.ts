import { api } from "./client";
import { UploadResponse } from "../types/upload";

/**
 * Upload product images to FastAPI.
 */
export async function uploadImages(
  files: File[],
  question: string
): Promise<UploadResponse> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  formData.append("question", question);

  const response = await api.post<UploadResponse>(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}