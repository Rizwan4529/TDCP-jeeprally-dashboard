import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import { DialogCommon } from "../common/DialogCommon";
import {
  FormCommon,
  ImagePicker,
  Input,
} from "../common/FormCommon";
import { Typography } from "../common/Typography";
import { Button } from "../ui/button";
import {
  emptyVehicleFormValues,
  vehicleFormFieldProps,
  vehicleFormSchema,
  VEHICLE_FIELD_LIMITS,
  type VehicleFormValues,
} from "../../utils/vehicle-form";

const fieldClassName =
  "h-11 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

type CreateVehicleRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryTitle: string;
  typeId: string;
  isSubmitting?: boolean;
  onSubmit: (values: VehicleFormValues) => void | Promise<void>;
};

export function CreateVehicleRegistrationDialog({
  open,
  onOpenChange,
  categoryId,
  categoryTitle,
  typeId,
  isSubmitting = false,
  onSubmit,
}: CreateVehicleRegistrationDialogProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      ...emptyVehicleFormValues,
      category_id: categoryId,
      typeId,
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      ...emptyVehicleFormValues,
      category_id: categoryId,
      typeId,
    });
  }, [open, categoryId, typeId, form]);

  const handleCancel = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSubmit: SubmitHandler<VehicleFormValues> = async (values) => {
    await onSubmit({
      ...values,
      category_id: categoryId,
      typeId: typeId || values.typeId,
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
      headerDescription={`Create a vehicle for ${categoryTitle}. Category is locked to your registration entry.`}
      className="sm:max-w-[640px]"
    >
      <FormCommon form={form} onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-md border border-[#E4E7EE] bg-[#F9FAFD] px-3 py-2">
          <Typography variant="body-sm" className="text-[#5B6785]">
            Category:{" "}
            <span className="font-semibold text-[#25314D]">{categoryTitle}</span>
          </Typography>
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            name="power"
            {...vehicleFormFieldProps("power")}
            className={fieldClassName}
            type="number"
            min={VEHICLE_FIELD_LIMITS.power.min}
            max={VEHICLE_FIELD_LIMITS.power.max}
            step={1}
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
          />
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
          <Button type="submit" disabled={isSubmitting}>
            Create vehicle
          </Button>
        </div>
      </FormCommon>
    </DialogCommon>
  );
}
