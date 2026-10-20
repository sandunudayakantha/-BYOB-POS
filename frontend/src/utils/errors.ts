/**
 * Utility to extract field-level validation errors from API error responses.
 * Supports Pydantic v2 / FastAPI validation formats:
 * - err.data.errors: [ { loc: ["name"], msg: "..." } ]
 * - err.response.data.data.errors
 * - err.errors
 * Returns a map of { fieldName: errorMessage } supporting both snake_case and camelCase.
 */
export function extractValidationErrors(err: any): Record<string, string> {
  const result: Record<string, string> = {};
  if (!err) return result;

  const errorList =
    err?.data?.errors ||
    err?.errors ||
    err?.response?.data?.data?.errors ||
    err?.response?.data?.errors;

  if (Array.isArray(errorList)) {
    for (const item of errorList) {
      if (Array.isArray(item.loc) && item.loc.length > 0) {
        const rawField = String(item.loc[item.loc.length - 1]);
        const msg = String(item.msg || "Invalid value");

        // Convert snake_case to camelCase
        const camelField = rawField.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        if (!result[rawField]) result[rawField] = msg;
        if (!result[camelField]) result[camelField] = msg;
      }
    }
  }

  return result;
}
