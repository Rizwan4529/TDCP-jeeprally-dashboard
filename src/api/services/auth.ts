import { apiClient } from "@/api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
} from "@/api/types/auth";

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
): Promise<RegisterResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("gender", payload.gender);
  formData.append("age", payload.age);
  formData.append("address", payload.address);
  formData.append("contact_number", payload.contact_number);
  formData.append("license_number", payload.license_number);
  formData.append("license_expiry", payload.license_expiry);
  formData.append("cnic", payload.cnic);
  formData.append("date_of_birth", payload.date_of_birth);
  formData.append("occupation", payload.occupation);
  if (payload.profile_image instanceof File) {
    formData.append("profile_image", payload.profile_image);
  }
  if (payload.cnic_image instanceof File) {
    formData.append("cnic_image", payload.cnic_image);
  }
  if (payload.license_image instanceof File) {
    formData.append("license_image", payload.license_image);
  }
  const { data } = await apiClient.put<RegisterResponse>(
    "/auth/me",
    formData,
    { headers: { ...multipartHeaders } },
  );
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
