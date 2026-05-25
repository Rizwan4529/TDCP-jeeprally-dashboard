import axios from "axios";
import { StatusCodes } from "http-status-codes";

import { AUTH_PUBLIC_API_PATHS, ROUTES } from "@/utils/constants";
import { fetchAuthToken, removeAuthToken } from "@/utils/helpers";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthPublicRequest(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return AUTH_PUBLIC_API_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.request.use((config) => {
  const token = fetchAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url;

    if (
      status === StatusCodes.UNAUTHORIZED &&
      !isAuthPublicRequest(requestUrl)
    ) {
      removeAuthToken();
      window.location.replace(ROUTES.LOGIN);
    }

    return Promise.reject(error);
  },
);
