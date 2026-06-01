import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  isAuthenticated,
  isUnauthorizedError,
  logoutAndRedirectToLogin,
} from "@/utils/auth-session";
import { ROUTES } from "@/utils/constants";

/** Guest pages: send authenticated users to the dashboard. */
export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [navigate]);
}

/** Protected pages: redirect to login when session is missing or API rejects auth. */
export function useAuthRedirectOnQueryError(
  error: unknown,
  isError: boolean,
) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (isError && isUnauthorizedError(error)) {
      logoutAndRedirectToLogin();
    }
  }, [error, isError, navigate]);
}
