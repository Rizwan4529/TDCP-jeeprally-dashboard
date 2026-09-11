import axios from "axios";

import { AUTH_PUBLIC_API_PATHS } from "@/utils/constants";
import {
  isUnauthorizedError,
  logoutAndRedirectToLogin,
} from "@/utils/auth-session";
import { fetchAuthToken } from "@/utils/helpers";

const paymentsBaseUrl = (
  import.meta.env.VITE_PAYMENTS_API_BASE_URL ||
  "https://centeral-user-apis.tdcp.gop.pk/api/v1"
).replace(/\/$/, "");

const paymentsApiKey =
  import.meta.env.VITE_PAYMENTS_API_KEY || "shared_sync_key_123";

/** Central user APIs client — used for POST /payments/create-session. */
export const paymentsClient = axios.create({
  baseURL: paymentsBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

function isAuthPublicRequest(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PUBLIC_API_PATHS.some((path) => url.includes(path));
}

paymentsClient.interceptors.request.use((config) => {
  const token = fetchAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-api-key"] = paymentsApiKey;
  return config;
});

paymentsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (
      isUnauthorizedError(error) &&
      !isAuthPublicRequest(error.config?.url)
    ) {
      logoutAndRedirectToLogin();
    }

    return Promise.reject(error);
  },
);
