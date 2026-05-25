import { apiClient } from "@/api/client";
import type { GetCategoriesResponse } from "@/api/types/categories";

function normalizeCategoriesResponse(raw: unknown): GetCategoriesResponse {
  if (!raw || typeof raw !== "object") {
    return { success: false, message: "Invalid response", data: [] };
  }
  const r = raw as GetCategoriesResponse;
  return Array.isArray(r.data) ? r : { ...r, data: [] };
}

export async function getCategories(): Promise<GetCategoriesResponse> {
  const { data } = await apiClient.get<unknown>("/categories");
  return normalizeCategoriesResponse(data);
}
