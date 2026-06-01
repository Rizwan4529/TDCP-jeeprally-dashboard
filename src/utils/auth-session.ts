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

  const status = error.response?.status;
  return (
    status === StatusCodes.UNAUTHORIZED || status === StatusCodes.FORBIDDEN
  );
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
