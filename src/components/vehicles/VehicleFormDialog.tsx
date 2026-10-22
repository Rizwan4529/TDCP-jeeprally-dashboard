import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import type { RallyEvent } from "@/api/types/rally";
import { DialogCommon } from "@/components/common/DialogCommon";
import {
  FormCommon,
  ImagePicker,
  Input,
  Select,
} from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import {
  getRallyCategoriesForType,
  getRallyTypes,
} from "@/utils/rally-team-options";
import {
  emptyVehicleFormValues,
  ENGINE_TYPE_OPTIONS,
  TURBO_CHARGE_OPTIONS,
  vehicleFormFieldProps,
  vehicleFormSchema,
  VEHICLE_FIELD_LIMITS,
  type VehicleFormValues,
} from "@/utils/vehicle-form";

const fieldClassName =
  "h-11 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

/** Registration entry the new vehicle must match. */
export type LockedVehicleCategory = {
  typeId: string;
  categoryId: string;
  categoryTitle: string;
};

type VehicleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Active rally: source of the Type / Category options. */
  rally: RallyEvent | null;
  /** When set (registration flow), Type and Category are pre-filled and locked. */
  locked?: LockedVehicleCategory | null;
  isSubmitting?: boolean;
  onSubmit: (values: VehicleFormValues) => void | Promise<void>;
};

/** Add-vehicle modal shared by the Vehicle page and the registration flow. */
export function VehicleFormDialog({
  open,
  onOpenChange,
  rally,
  locked = null,
  isSubmitting = false,
  onSubmit,
}: VehicleFormDialogProps) {
  const rallyTypes = React.useMemo(() => getRallyTypes(rally), [rally]);

  const initialValues = React.useMemo(
    (): VehicleFormValues => ({
      ...emptyVehicleFormValues,
      typeId:
        locked?.typeId ?? (rallyTypes.length === 1 ? rallyTypes[0]._id : ""),
      category_id: locked?.categoryId ?? "",
    }),
    [locked?.typeId, locked?.categoryId, rallyTypes],
  );

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    if (open) form.reset(initialValues);
  }, [open, initialValues, form]);

  const selectedTypeId = form.watch("typeId") ?? "";

  const typeOptions = React.useMemo(() => {
    const options = rallyTypes.map((t) => ({ label: t.name, value: t._id }));
    if (locked?.typeId && !options.some((o) => o.value === locked.typeId)) {
      options.push({ label: "Selected type", value: locked.typeId });
    }
    return options;
  }, [rallyTypes, locked?.typeId]);

  const categoryOptions = React.useMemo(() => {
    const options = getRallyCategoriesForType(rally, selectedTypeId).map(
      (c) => ({ label: c.title, value: c._id }),
    );
    if (locked && !options.some((o) => o.value === locked.categoryId)) {
      options.push({ label: locked.categoryTitle, value: locked.categoryId });
    }
    return options;
  }, [rally, selectedTypeId, locked]);

  // Changing the type clears a category that doesn't belong to it.
  React.useEffect(() => {
    if (locked) return;
    const current = form.getValues("category_id");
    if (current && !categoryOptions.some((o) => o.value === current)) {
      form.setValue("category_id", "");
    }
  }, [locked, categoryOptions, form]);

  const noTypes = !locked && typeOptions.length === 0;

  const handleCancel = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSubmit: SubmitHandler<VehicleFormValues> = async (values) => {
    const typeId = locked?.typeId || values.typeId?.trim();
    if (!typeId) {
      form.setError("typeId", { message: "Select a vehicle type." });
      return;
    }
    await onSubmit({
      ...values,
      typeId,
      category_id: locked?.categoryId || values.category_id,
    });
  };

  return (
    <DialogCommon
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
        else onOpenChange(true);
      }}
      headerTitle="Add vehicle"
      headerDescription={
        locked
          ? `Create a vehicle for ${locked.categoryTitle}. Type and category are locked to your registration entry.`
          : "Create a vehicle to use when registering for events."
      }
      className="sm:max-w-[640px]"
    >
      <FormCommon form={form} onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <ImagePicker
            control={form.control}
            name="vehicleImage"
            label="Vehicle photo"
            description="Optional — you can upload later."
            variant="avatar"
            disabled={isSubmitting}
          />
        </div>

        {noTypes ? (
          <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
            <Typography variant="body-sm" className="text-[#8B2B2B]">
              Vehicle types and categories become available once an event is
              active.
            </Typography>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            control={form.control}
            name="typeId"
            label="Type"
            required
            placeholder="Select vehicle type"
            options={typeOptions}
            className={fieldClassName}
            disabled={Boolean(locked) || isSubmitting}
          />
          <Select
            control={form.control}
            name="category_id"
            {...vehicleFormFieldProps("category")}
            placeholder={selectedTypeId ? "Select category" : "Select a type first"}
            options={categoryOptions}
            className={fieldClassName}
            disabled={
              Boolean(locked) || isSubmitting || categoryOptions.length === 0
            }
          />
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
          <Input
            control={form.control}
            name="power"
            {...vehicleFormFieldProps("power")}
            className={fieldClassName}
            type="number"
            min={VEHICLE_FIELD_LIMITS.power.min}
            max={VEHICLE_FIELD_LIMITS.power.max}
            step={1}
          />
          <Select
            control={form.control}
            name="engineType"
            {...vehicleFormFieldProps("engineType")}
            options={ENGINE_TYPE_OPTIONS}
            className={fieldClassName}
          />
          <Select
            control={form.control}
            name="turboCharge"
            {...vehicleFormFieldProps("turboCharge")}
            options={TURBO_CHARGE_OPTIONS}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="desiredRallyNumber"
            {...vehicleFormFieldProps("desiredRallyNumber")}
            className={fieldClassName}
          />
          {/* Optional fields hidden for now.
          <Input
            control={form.control}
            name="frame"
            {...vehicleFormFieldProps("frame")}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="class"
            {...vehicleFormFieldProps("class")}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="weight"
            {...vehicleFormFieldProps("weight")}
            className={fieldClassName}
            type="number"
            min={VEHICLE_FIELD_LIMITS.weight.min}
            max={VEHICLE_FIELD_LIMITS.weight.max}
            step={1}
          />
          <Input
            control={form.control}
            name="length"
            {...vehicleFormFieldProps("length")}
            className={fieldClassName}
            type="number"
            min={VEHICLE_FIELD_LIMITS.length.min}
            max={VEHICLE_FIELD_LIMITS.length.max}
            step={0.1}
          />
          <Input
            control={form.control}
            name="tank_capacity"
            {...vehicleFormFieldProps("tank_capacity")}
            className={fieldClassName}
            type="number"
            min={VEHICLE_FIELD_LIMITS.tank_capacity.min}
            max={VEHICLE_FIELD_LIMITS.tank_capacity.max}
            step={1}
          /> */}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || noTypes}>
            Create vehicle
          </Button>
        </div>
      </FormCommon>
    </DialogCommon>
  );
}
