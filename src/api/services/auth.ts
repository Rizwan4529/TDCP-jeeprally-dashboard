import { apiClient } from "@/api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/api/types/auth";
import {
  appendUpdateProfileToFormData,
  hasUpdateProfileChanges,
} from "@/utils/profile-update";

const multipartHeaders = { "Content-Type": "multipart/form-data" } as const;

function appendRegisterFields(formData: FormData, payload: RegisterPayload) {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value);
    }
  }
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const formData = new FormData();
  appendRegisterFields(formData, payload);
  const { data } = await apiClient.post<RegisterResponse>(
    "/auth/register",
    formData,
    { headers: { ...multipartHeaders } },
  );
  return data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  if (!hasUpdateProfileChanges(payload)) {
    return { success: true, message: "No changes to save." };
  }

  const formData = new FormData();
  appendUpdateProfileToFormData(formData, payload);

  const { data } = await apiClient.put<UpdateProfileResponse>("/auth/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return body;
      },
    ],
  });
  return data;
}

export async function loginUser(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    "/auth/login",
    payload,
  );
  return data;
}
