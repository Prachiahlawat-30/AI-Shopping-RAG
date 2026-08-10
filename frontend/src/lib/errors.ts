export function getErrorMessage(err: any, fallback: string): string {
  const detail = err?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    // FastAPI/Pydantic validation error array
    return detail
      .map((d) => d.msg || "Invalid input")
      .join(", ");
  }

  return err?.message || fallback;
}