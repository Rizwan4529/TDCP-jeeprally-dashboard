import axios from "axios";
import { StatusCodes } from "http-status-codes";

import { ROUTES } from "@/utils/constants";
import { fetchAuthToken, removeAuthToken } from "@/utils/helpers";

/** True when the `token` key exists in localStorage. */
export function isAuthenticated(): boolean {
  return Boolean(fetchAuthToken());
}

export function isUnauthorizedError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  // Only 401 means the session is invalid. 403 is "authenticated but not allowed"
  // for a specific resource — logging out on 403 breaks flows like edit registration.
  return error.response?.status === StatusCodes.UNAUTHORIZED;
}

/** Clears session and hard-redirects to login (used by axios + React Query). */
export function logoutAndRedirectToLogin(): void {
  removeAuthToken();

  if (typeof window === "undefined") {
    return;
  }

  const loginPath = ROUTES.LOGIN;
  if (window.location.pathname !== loginPath) {
    window.location.replace(loginPath);
  }
}
