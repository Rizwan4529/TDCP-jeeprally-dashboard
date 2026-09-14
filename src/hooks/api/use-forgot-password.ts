import { useMutation } from "@tanstack/react-query";

import { forgotPassword, resetPassword } from "@/api/services/auth";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/api/types/auth";

export function useForgotPasswordMutation() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
    mutationFn: forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPassword,
  });
}
