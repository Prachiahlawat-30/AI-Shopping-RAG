import { useState } from "react";
import { uploadImages } from "../api/upload";
import { UploadResponse } from "../types/upload";

export function useUpload() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [result, setResult] = useState<UploadResponse | null>(null);

  const upload = async (
    files: File[],
    question: string
  ): Promise<UploadResponse | null> => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const response = await uploadImages(files, question);

      setResult(response);

      return response;
    } catch (err: any) {
      setError(
        err?.detail ||
          err?.message ||
          "Failed to upload images."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return {
    upload,
    loading,
    error,
    result,
    reset,
  };
}