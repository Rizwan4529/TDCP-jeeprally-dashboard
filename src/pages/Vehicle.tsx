import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { CameraIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useMyVehiclesQuery,
  useUpdateVehicleMutation,
  useUploadVehicleImageMutation,
} from "@/hooks/api/use-vehicles";
import { useMyTeamQuery } from "@/hooks/api/use-teams";
import { fetchAuthToken, toPublicFileUrl } from "@/utils/helpers";
import { FormCommon, Input, Select } from "@/components/common/FormCommon";
import type { Vehicle } from "@/api/types/vehicles";
import {
  buildCreateVehiclePayload,
  buildUpdateVehiclePayload,
  emptyVehicleFormValues,
  vehicleCategorySelectOptions,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormValues,
} from "@/utils/vehicle-form";
import { CATEGORY, CATEGORY_LABELS, type Category } from "@/utils/constants";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-4 text-[14px] text-[#1F1838] shadow-none placeholder:text-[#9AA6C8]";

export default function VehiclePage() {
  return <VehicleScreen />;
}

function VehicleScreen() {
  const token = useMemo(() => fetchAuthToken(), []);
  const teamQuery = useMyTeamQuery(Boolean(token));
  const teams = Array.isArray(teamQuery.data?.data) ? teamQuery.data.data : [];
  const team = teams[0] ?? null;

  const defaultFormValues = useMemo((): VehicleFormValues => {
    const cat = team?.category;
    return {
      ...emptyVehicleFormValues,
      category: (cat ?? CATEGORY.JEEP) as VehicleFormValues["category"],
    };
  }, [team?.category]);

  const vehiclesQuery = useMyVehiclesQuery(Boolean(token));
  const vehicles = Array.isArray(vehiclesQuery.data?.data)
    ? vehiclesQuery.data.data
    : [];

  const [panel, setPanel] = useState<"none" | "new" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingVehicle =
    panel === "edit" && editingId
      ? (vehicles.find((v) => v._id === editingId) ?? null)
      : null;

  const createVehicleMutation = useCreateVehicleMutation();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const deleteVehicleMutation = useDeleteVehicleMutation();
  const uploadImageMutation = useUploadVehicleImageMutation();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyVehicleFormValues,
    values:
      panel === "edit" && editingVehicle
        ? vehicleToFormValues(editingVehicle)
        : panel === "new"
          ? defaultFormValues
          : undefined,
  });

  const isSaving =
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    uploadImageMutation.isPending;

  const openNew = () => {
    setPanel("new");
    setEditingId(null);
    form.reset(defaultFormValues);
  };

  const openEdit = (v: Vehicle) => {
    setPanel("edit");
    setEditingId(v._id);
    form.reset(vehicleToFormValues(v));
  };

  const closePanel = () => {
    setPanel("none");
    setEditingId(null);
    form.reset(defaultFormValues);
  };

  const onSubmit: SubmitHandler<VehicleFormValues> = async (values) => {
    const imageFile =
      values.vehicleImage instanceof File ? values.vehicleImage : null;

    if (panel === "edit" && editingId) {
      await updateVehicleMutation.mutateAsync({
        id: editingId,
        payload: buildUpdateVehiclePayload(values),
      });
      if (imageFile) {
        await uploadImageMutation.mutateAsync({
          vehicleId: editingId,
          file: imageFile,
        });
      }
      closePanel();
      return;
    }

    const created = await createVehicleMutation.mutateAsync(
      buildCreateVehiclePayload(values),
    );
    const newId = created.data?._id;
    if (imageFile && newId) {
      await uploadImageMutation.mutateAsync({
        vehicleId: newId,
        file: imageFile,
      });
    }
    closePanel();
  };

  return (
    <div className="space-y-6">
      <Card className={cn(surface, "rounded-[14px] px-6 py-6")}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography
              as="h2"
              variant="h4"
              className="text-[28px] font-semibold leading-none text-[#1F1838]"
            >
              Your vehicles
            </Typography>
            <Typography variant="body-sm" className="mt-2 text-[#6B7890]">
              {vehiclesQuery.isLoading
                ? "Loading…"
                : vehicles.length === 0
                  ? "No vehicles yet. Add one to get started."
                  : `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} on file.`}
            </Typography>
          </div>
          <Button
            type="button"
            className="h-11 rounded-[10px] bg-[#3FA565] px-5 text-[14px] font-semibold hover:bg-[#369A5D]"
            onClick={openNew}
            disabled={!token || panel !== "none"}
          >
            <PlusIcon className="size-4" />
            Add vehicle
          </Button>
        </div>
      </Card>

      {vehiclesQuery.isLoading ? (
        <Card className={cn(surface, "rounded-[14px] p-6")}>
          <Typography variant="body" className="text-[#6B7890]">
            Loading vehicles…
          </Typography>
        </Card>
      ) : vehiclesQuery.isError ? (
        <Card className={cn(surface, "rounded-[14px] p-6")}>
          <Typography variant="body" className="text-destructive">
            Could not load vehicles. Try again later.
          </Typography>
        </Card>
      ) : panel !== "none" ? null : vehicles.length === 0 ? (
        <Card className={cn(surface, "rounded-[14px] p-8")}>
          <Typography variant="body" className="text-center text-[#6B7890]">
            You have not added any vehicles yet. Use{" "}
            <span className="font-semibold text-[#1F1838]">Add vehicle</span>{" "}
            above to create your first entry.
          </Typography>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => {
            const img = toPublicFileUrl(v.image);
            return (
              <Card
                key={v._id}
                className={cn(surface, "overflow-hidden rounded-[14px]")}
              >
                <div className="flex gap-4 border-b border-[#E8E8E8] p-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#E8E8E8] bg-[#F9FAFD]">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[11px] text-[#9AA6C8]">
                        No photo
                      </div>
                    )}
                    <label
                      className={cn(
                        "absolute bottom-1 right-1 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#3FA565] text-white shadow-md",
                        uploadImageMutation.isPending &&
                          "pointer-events-none opacity-70",
                      )}
                      aria-label="Change photo"
                    >
                      <CameraIcon className="size-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!token || uploadImageMutation.isPending}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await uploadImageMutation.mutateAsync({
                            vehicleId: v._id,
                            file,
                          });
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Typography
                      as="h3"
                      variant="label"
                      className="truncate text-[15px] font-semibold text-[#1F1838]"
                    >
                      {v.model}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="mt-1 text-[#6B7890]"
                    >
                      {CATEGORY_LABELS[v.category as Category] ?? v.category}
                      {v.class ? ` · ${v.class}` : ""}
                      {v.power != null ? ` · Power ${v.power}` : ""}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  <Button
                    type="button"
                    variant="primary-outline"
                    size="sm"
                    className="rounded-[10px]"
                    onClick={() => openEdit(v)}
                    disabled={panel !== "none"}
                  >
                    <PencilIcon className="size-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive-outline"
                    size="sm"
                    className="rounded-[10px]"
                    disabled={
                      deleteVehicleMutation.isPending || panel !== "none"
                    }
                    onClick={async () => {
                      await deleteVehicleMutation.mutateAsync(v._id);
                      if (editingId === v._id) closePanel();
                    }}
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {panel !== "none" ? (
        <Card className={cn(surface, "rounded-[14px] p-6")}>
          <Typography
            as="h3"
            variant="label"
            className="text-[14px] font-bold tracking-wide text-[#1F1838]"
          >
            {panel === "edit" ? "EDIT VEHICLE" : "ADD VEHICLE"}
          </Typography>
          <div className="pt-5">
            <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
              {/* <div className="flex flex-col gap-4 border-b border-[#EEF0F4] pb-6 md:flex-row md:items-start md:gap-10">
                <ImagePicker
                  control={form.control}
                  name="vehicleImage"
                  label="Vehicle photo"
                  description="Optional. Uploaded when you save."
                  variant="avatar"
                  disabled={isSaving}
                />
              </div> */}
              <div className="grid gap-5 pt-1 md:grid-cols-2">
                <Input
                  control={form.control}
                  name="model"
                  label="Model"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="engine"
                  label="Engine"
                  className={fieldClassName}
                />
                <Select
                  control={form.control}
                  name="category"
                  label="Category"
                  placeholder="Select category"
                  options={vehicleCategorySelectOptions}
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="frame"
                  label="Frame (optional)"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="power"
                  label="Power (optional)"
                  type="number"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="weight"
                  label="Weight (optional)"
                  type="number"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="length"
                  label="Length (optional)"
                  type="number"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="tank_capacity"
                  label="Tank capacity (optional)"
                  type="number"
                  className={fieldClassName}
                />
                <Input
                  control={form.control}
                  name="class"
                  label="Class (optional)"
                  className={fieldClassName}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="primary-outline"
                  className="h-11 rounded-[10px] px-5 text-[14px] font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    closePanel();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 rounded-[10px] bg-[#3FA565] px-5 text-[14px] font-semibold hover:bg-[#369A5D]"
                  disabled={isSaving}
                >
                  {panel === "edit" ? "Update" : "Save"}
                </Button>
              </div>
            </FormCommon>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
