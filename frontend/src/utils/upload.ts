export const MAX_UPLOAD_IMAGES = 4;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateUploadFiles(
  files: File[]
): ValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      message: "Please select at least one image.",
    };
  }

  if (files.length > MAX_UPLOAD_IMAGES) {
    return {
      valid: false,
      message: `Maximum ${MAX_UPLOAD_IMAGES} images allowed.`,
    };
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: `${file.name} is not a supported image.`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `${file.name} exceeds the 10 MB limit.`,
      };
    }
  }

  return {
    valid: true,
  };
}