import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import {
  createVehicle,
  deleteVehicle,
  getMyVehicles,
  updateVehicle,
  uploadVehicleImage,
} from "@/api/services/vehicles";
import type {
  CreateVehiclePayload,
  DeleteVehicleResponse,
  GetMyVehiclesResponse,
  UpdateVehiclePayload,
  UploadVehicleImageResponse,
  UpsertVehicleResponse,
} from "@/api/types/vehicles";

export function useMyVehiclesQuery(enabled: boolean) {
  return useQuery<GetMyVehiclesResponse, Error>({
    queryKey: queryKeys.vehicles.myVehicles(),
    queryFn: getMyVehicles,
    enabled,
    staleTime: 30_000,
  });
}

/** @deprecated Use useMyVehiclesQuery */
export const useMyVehicleQuery = useMyVehiclesQuery;

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation<UpsertVehicleResponse, Error, CreateVehiclePayload>({
    mutationFn: createVehicle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UpsertVehicleResponse,
    Error,
    { id: string; payload: UpdateVehiclePayload }
  >({
    mutationFn: ({ id, payload }) => updateVehicle(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation<DeleteVehicleResponse, Error, string>({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

export function useUploadVehicleImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UploadVehicleImageResponse,
    Error,
    { vehicleId: string; file: File }
  >({
    mutationFn: ({ vehicleId, file }) => uploadVehicleImage(vehicleId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}
