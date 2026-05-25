import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { updateMyProfile } from "@/api/services/auth";
import type { LoginUser, RegisterResponse, UpdateProfilePayload } from "@/api/types/auth";
import { fetchAuthUser, updateAuthUser } from "@/utils/helpers";
import { parseLoginUserFromApiEnvelope } from "@/utils/profile-driver";

function dateOnlyToUtcIso(dateYmd: string): string {
  const trimmed = dateYmd.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  return trimmed;
}

function mergeSessionAfterProfileUpdate(
  prev: LoginUser,
  variables: UpdateProfilePayload,
): LoginUser {
  const ageNum = Number.parseInt(String(variables.age), 10);
  return {
    ...prev,
    name: variables.name,
    gender: variables.gender,
    age: Number.isFinite(ageNum) ? ageNum : prev.age,
    address: variables.address,
    contact_number: variables.contact_number,
    license_number: variables.license_number,
    license_expiry: dateOnlyToUtcIso(variables.license_expiry),
    date_of_birth: dateOnlyToUtcIso(variables.date_of_birth),
    occupation: variables.occupation,
    cnic: variables.cnic,
  };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, UpdateProfilePayload>({
    mutationFn: updateMyProfile,
    onSuccess: (data, variables) => {
      const fromApi = parseLoginUserFromApiEnvelope(data);
      const prev = fetchAuthUser();
      const next = fromApi ?? (prev ? mergeSessionAfterProfileUpdate(prev, variables) : null);
      if (next) {
        updateAuthUser(next);
        queryClient.setQueryData(queryKeys.auth.sessionUser(), next);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.myTeams() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
