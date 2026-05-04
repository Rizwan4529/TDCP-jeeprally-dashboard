import { apiClient } from "@/lib/api/client"
import type { RegisterRequest, RegisterResponse } from "@/lib/api/types/auth"

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    "/auth/register",
    payload,
  )
  return data
}
