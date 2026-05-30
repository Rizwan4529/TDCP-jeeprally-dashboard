import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { updateMyProfile } from "@/api/services/auth";
import type { LoginUser, UpdateProfilePayload, UpdateProfileResponse } from "@/api/types/auth";
import { fetchAuthUser, updateAuthUser } from "@/utils/helpers";
import { parseLoginUserFromApiEnvelope } from "@/utils/profile-driver";
import { normDateForProfile } from "@/utils/profile-update";

function mergeSessionAfterProfileUpdate(
  prev: LoginUser,
  variables: UpdateProfilePayload,
): LoginUser {
  const next: LoginUser = { ...prev };

  if (variables.name !== undefined) next.name = variables.name;
  if (variables.gender !== undefined) next.gender = variables.gender;
  if (variables.age !== undefined) {
    const ageNum = Number.parseInt(String(variables.age), 10);
    next.age = Number.isFinite(ageNum) ? ageNum : variables.age;
  }
  if (variables.address !== undefined) next.address = variables.address;
  if (variables.location !== undefined) next.location = variables.location;
  if (variables.contact_number !== undefined) {
    next.contact_number = variables.contact_number;
  }
  if (variables.license_number !== undefined) {
    next.license_number = variables.license_number;
  }
  if (variables.license_expiry !== undefined) {
    next.license_expiry = normDateForProfile(variables.license_expiry)
      ? `${normDateForProfile(variables.license_expiry)}T00:00:00.000Z`
      : variables.license_expiry;
  }
  if (variables.date_of_birth !== undefined) {
    const dob = normDateForProfile(variables.date_of_birth);
    next.date_of_birth = dob ? `${dob}T00:00:00.000Z` : variables.date_of_birth;
  }
  if (variables.occupation !== undefined) next.occupation = variables.occupation;
  if (variables.cnic !== undefined) next.cnic = variables.cnic;

  return next;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
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
