// src/utils/extractData.ts
export interface SupabaseResult<T> {
  data?: T | T[];
  error?: {
    message?: string;
    details?: string;
    code?: string;
  };
}

export function extractData<T>(result: SupabaseResult<T>): T[] {
  if (!result?.data || result.error) {
    console.warn("⚠️ Supabase fetch failed:", {
      message: result.error?.message ?? "Unknown error",
      details: result.error?.details ?? null,
      code: result.error?.code ?? null,
    });
    return [];
  }

  return Array.isArray(result.data) ? result.data : [result.data];
}
