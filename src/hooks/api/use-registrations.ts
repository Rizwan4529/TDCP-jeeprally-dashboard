import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  getEventRegistrations,
  getMyRegistrations,
  getRegistrationById,
  updateRegistration,
} from "@/api/services/registrations";
import type {
  GetEventRegistrationsResponse,
  GetMyRegistrationsResponse,
  GetRegistrationByIdResponse,
  UpdateRegistrationPayload,
  UpdateRegistrationResponse,
} from "@/api/types/registrations";

/** GET /registrations/my-registrations */
export function useMyRegistrationsQuery(enabled = true) {
  return useQuery<GetMyRegistrationsResponse, Error>({
    queryKey: queryKeys.registrations.my(),
    queryFn: getMyRegistrations,
    enabled,
    staleTime: 30_000,
  });
}

/** @deprecated Prefer useMyRegistrationsQuery */
export function useEventRegistrationsQuery(
  eventId: string | null | undefined,
  enabled = true,
) {
  const id = eventId?.trim() ?? "";
  return useQuery<GetEventRegistrationsResponse, Error>({
    queryKey: queryKeys.rally.registrations(id),
    queryFn: () => getEventRegistrations(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useRegistrationByIdQuery(
  registrationId: string | null | undefined,
  enabled = true,
) {
  const id = registrationId?.trim() ?? "";
  return useQuery<GetRegistrationByIdResponse, Error>({
    queryKey: queryKeys.rally.registration(id),
    queryFn: () => getRegistrationById(id),
    enabled: enabled && Boolean(id),
    staleTime: 15_000,
  });
}

export function useUpdateRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateRegistrationResponse,
    Error,
    { registrationId: string; payload: UpdateRegistrationPayload }
  >({
    mutationFn: ({ registrationId, payload }) =>
      updateRegistration(registrationId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rally.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.rally.registration(variables.registrationId),
      });
    },
  });
}
