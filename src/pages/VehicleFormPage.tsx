import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CarIcon } from "lucide-react";

import {
  EmptyState,
  SelectFieldSkeleton,
  TextLineSkeleton,
} from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import { FormCommon, ImagePicker, Input, Select } from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import {
  SCROLL_PAGE,
  SIDEBAR_PAGE_PADDING,
} from "@/components/layout/pageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActiveRallyQuery } from "@/hooks/api/use-active-rally";
import {
  useCreateVehicleMutation,
  useMyVehiclesQuery,
  useUpdateVehicleMutation,
  useUploadVehicleImageMutation,
} from "@/hooks/api/use-vehicles";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";
import { fetchAuthToken } from "@/utils/helpers";
import {
  findRallyCategory,
  findRallyType,
  getRallyCategoriesForType,
  getRallyTypes,
  getTypeIdForCategory,
} from "@/utils/rally-team-options";
import {
  buildCreateVehiclePayload,
  buildUpdateVehiclePayload,
  emptyVehicleFormValues,
  vehicleFormFieldProps,
  VEHICLE_FIELD_LIMITS,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormValues,
} from "@/utils/vehicle-form";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-4 text-[14px] text-[#1F1838] shadow-none placeholder:text-[#9AA6C8]";

export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const token = useMemo(() => fetchAuthToken(), []);

  // Types and categories come from the active rally (same source as teams).
  const activeRallyQuery = useActiveRallyQuery(Boolean(token));
  const activeRally = activeRallyQuery.data?.data ?? null;
  const rallyTypes = useMemo(() => getRallyTypes(activeRally), [activeRally]);
  const typeOptions = useMemo(
    () => rallyTypes.map((t) => ({ label: t.name, value: t._id })),
    [rallyTypes],
  );

  const defaultFormValues = useMemo((): VehicleFormValues => {
    return {
      ...emptyVehicleFormValues,
      typeId: rallyTypes.length === 1 ? rallyTypes[0]._id : "",
    };
  }, [rallyTypes]);

  const vehiclesQuery = useMyVehiclesQuery(Boolean(token) && isEditMode);
  const vehicles = Array.isArray(vehiclesQuery.data?.data)
    ? vehiclesQuery.data.data
    : [];
  const editingVehicle = isEditMode
    ? (vehicles.find((v) => v._id === id) ?? null)
    : null;

  const createVehicleMutation = useCreateVehicleMutation();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const uploadImageMutation = useUploadVehicleImageMutation();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyVehicleFormValues,
  });

  const selectedTypeId = form.watch("typeId") ?? "";

  /** Editing a vehicle whose category isn't in the active rally: keep it selectable. */
  const legacyCategoryOption = useMemo(() => {
    const category = editingVehicle?.category_id;
    if (!category?._id || findRallyCategory(activeRally, category._id)) {
      return null;
    }
    return { label: category.title ?? category.key, value: category._id };
  }, [editingVehicle, activeRally]);

  const categoryOptions = useMemo(() => {
    const options = getRallyCategoriesForType(activeRally, selectedTypeId).map(
      (c) => ({ label: c.title, value: c._id }),
    );
    return legacyCategoryOption ? [...options, legacyCategoryOption] : options;
  }, [activeRally, selectedTypeId, legacyCategoryOption]);

  // Changing the type clears a category that doesn't belong to it.
  useEffect(() => {
    const current = form.getValues("category_id");
    if (current && !categoryOptions.some((o) => o.value === current)) {
      form.setValue("category_id", "");
    }
  }, [categoryOptions, form]);

  useEffect(() => {
    if (isEditMode && editingVehicle) {
      const values = vehicleToFormValues(editingVehicle);
      form.reset({
        ...values,
        // API may return the type key; fall back to the category's type.
        typeId:
          findRallyType(activeRally, values.typeId)?._id ||
          getTypeIdForCategory(activeRally, values.category_id),
      });
      return;
    }
    if (!isEditMode) {
      form.reset(defaultFormValues);
    }
  }, [isEditMode, editingVehicle, defaultFormValues, activeRally, form]);

  const isSaving =
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    uploadImageMutation.isPending;

  const onSubmit: SubmitHandler<VehicleFormValues> = async (values) => {
    if (!values.typeId?.trim()) {
      form.setError("typeId", { message: "Select a vehicle type." });
      return;
    }
    const imageFile =
      values.vehicleImage instanceof File ? values.vehicleImage : null;

    try {
      if (isEditMode && id) {
        await updateVehicleMutation.mutateAsync({
          id,
          payload: buildUpdateVehiclePayload(values),
        });
        if (imageFile) {
          await uploadImageMutation.mutateAsync({
            vehicleId: id,
            file: imageFile,
          });
        }
        toast.success("Vehicle updated.");
        navigate(ROUTES.VEHICLE);
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
      toast.success("Vehicle created.");
      navigate(ROUTES.VEHICLE);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save vehicle.",
      );
    }
  };

  if (isEditMode && vehiclesQuery.isLoading) {
    return (
      <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "gap-4 pb-8")}>
        <PageHeader title="Edit vehicle" />
        <Card
          className={cn(
            surface,
            "shrink-0 overflow-visible rounded-md space-y-4 p-6",
          )}
        >
          <TextLineSkeleton className="h-5 w-40" />
          <TextLineSkeleton className="h-11 w-full" />
          <TextLineSkeleton className="h-11 w-full" />
          <TextLineSkeleton className="h-11 w-2/3" />
        </Card>
      </div>
    );
  }

  if (isEditMode && !vehiclesQuery.isLoading && !editingVehicle) {
    return (
      <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "gap-4 pb-8")}>
        <PageHeader title="Edit vehicle" />
        <EmptyState
          icon={CarIcon}
          title="Vehicle not found"
          description="This vehicle may have been removed or is unavailable."
          action={
            <Button asChild size="default" variant="outline">
              <Link to={ROUTES.VEHICLE}>Back to vehicles</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={cn(SCROLL_PAGE, SIDEBAR_PAGE_PADDING, "gap-4 pb-8")}>
      <PageHeader title={isEditMode ? "Edit vehicle" : "Add vehicle"} />

      <Card
        className={cn(
          surface,
          "shrink-0 overflow-visible rounded-md p-6",
        )}
      >
        <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-[#EEF0F4] pb-6 md:flex-row md:items-start md:gap-10">
            <ImagePicker
              control={form.control}
              name="vehicleImage"
              label="Vehicle photo"
              description="Optional. Uploaded when you save."
              variant="avatar"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-5 pt-1 md:grid-cols-2">
            <Input
              control={form.control}
              name="model"
              {...vehicleFormFieldProps("model")}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="engine"
              {...vehicleFormFieldProps("engine")}
              className={fieldClassName}
            />
            {activeRallyQuery.isLoading ? (
              <>
                <SelectFieldSkeleton />
                <SelectFieldSkeleton />
              </>
            ) : activeRallyQuery.isError || typeOptions.length === 0 ? (
              <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4 md:col-span-2">
                <Typography variant="body-sm" className="text-[#8B2B2B]">
                  {activeRallyQuery.isError
                    ? "Could not load vehicle types. Try again later."
                    : "Vehicle types and categories become available once an event is active."}
                </Typography>
              </div>
            ) : (
              <>
                <Select
                  control={form.control}
                  name="typeId"
                  label="Type"
                  required
                  placeholder="Select vehicle type"
                  options={typeOptions}
                  className={fieldClassName}
                  disabled={isSaving}
                />
                <Select
                  control={form.control}
                  name="category_id"
                  {...vehicleFormFieldProps("category")}
                  placeholder={
                    selectedTypeId || legacyCategoryOption
                      ? "Select category"
                      : "Select a type first"
                  }
                  options={categoryOptions}
                  className={fieldClassName}
                  disabled={isSaving || categoryOptions.length === 0}
                />
              </>
            )}
            <Input
              control={form.control}
              name="frame"
              {...vehicleFormFieldProps("frame")}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="power"
              {...vehicleFormFieldProps("power")}
              type="number"
              min={VEHICLE_FIELD_LIMITS.power.min}
              max={VEHICLE_FIELD_LIMITS.power.max}
              step={1}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="weight"
              {...vehicleFormFieldProps("weight")}
              type="number"
              min={VEHICLE_FIELD_LIMITS.weight.min}
              max={VEHICLE_FIELD_LIMITS.weight.max}
              step={1}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="length"
              {...vehicleFormFieldProps("length")}
              type="number"
              min={VEHICLE_FIELD_LIMITS.length.min}
              max={VEHICLE_FIELD_LIMITS.length.max}
              step={0.1}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="tank_capacity"
              {...vehicleFormFieldProps("tank_capacity")}
              type="number"
              min={VEHICLE_FIELD_LIMITS.tank_capacity.min}
              max={VEHICLE_FIELD_LIMITS.tank_capacity.max}
              step={1}
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="class"
              {...vehicleFormFieldProps("class")}
              className={fieldClassName}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="destructive-outline"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.VEHICLE);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={
                isSaving ||
                activeRallyQuery.isLoading ||
                typeOptions.length === 0
              }
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </div>
        </FormCommon>
      </Card>
    </div>
  );
}
