import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import { DialogCommon } from "../common/DialogCommon";
import {
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  Select,
  Textarea,
} from "../common/FormCommon";
import { Typography } from "../common/Typography";
import { Button } from "../ui/button";
import { GENDER_OPTIONS } from "../../utils/constants";
import {
  coDriverFormSchema,
  emptyCoDriverFormValues,
  type CoDriverFormValues,
} from "../../utils/co-driver-form";
import { PROFILE_IMAGE_FIELDS } from "../../utils/profile-update";

const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

const genderSelectOptions = GENDER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

type AddCoDriverDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user cancels (not after a successful save). */
  onCancel?: () => void;
  /** Shown in the header description (team name when adding later). */
  teamName?: string;
  isSubmitting?: boolean;
  onSubmit: (values: CoDriverFormValues) => void | Promise<void>;
};

export function AddCoDriverDialog({
  open,
  onOpenChange,
  onCancel,
  teamName,
  isSubmitting = false,
  onSubmit,
}: AddCoDriverDialogProps) {
  const form = useForm<CoDriverFormValues>({
    resolver: zodResolver(coDriverFormSchema),
    defaultValues: emptyCoDriverFormValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(emptyCoDriverFormValues);
    }
  }, [open, form]);

  const handleSubmit: SubmitHandler<CoDriverFormValues> = async (values) => {
    await onSubmit(values);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <DialogCommon
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
        else onOpenChange(true);
      }}
      headerTitle="Add co-driver"
      headerDescription={
        teamName
          ? `Enter co-driver details for ${teamName}. Same profile fields as a driver; document photos are optional.`
          : "Enter co-driver details. Same profile fields as a driver; document photos are optional."
      }
      className="sm:max-w-[640px]"
    >
      <FormCommon
        form={form}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            control={form.control}
            name="name"
            label="Full name"
            required
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="email"
            label="Email"
            type="email"
            required
            className={fieldClassName}
          />
          <Select
            control={form.control}
            name="gender"
            label="Gender"
            required
            placeholder="Select gender"
            options={genderSelectOptions}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="age"
            label="Age"
            required
            inputMode="numeric"
            maxLength={3}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="occupation"
            label="Occupation"
            required
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="contact_number"
            label="Contact number"
            required
            inputMode="numeric"
            maxLength={11}
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="cnic"
            label="CNIC"
            required
            inputMode="numeric"
            maxLength={13}
            className={fieldClassName}
          />
          <DatePicker
            control={form.control}
            name="date_of_birth"
            label="Date of birth"
            required
            placeholder="YYYY-MM-DD"
            className={fieldClassName}
          />
          <Input
            control={form.control}
            name="license_number"
            label="License number"
            required
            className={fieldClassName}
          />
          <DatePicker
            control={form.control}
            name="license_expiry"
            label="License expiry"
            required
            placeholder="YYYY-MM-DD"
            calendarYearsFuture={50}
            className={fieldClassName}
          />
        </div>

        <Textarea
          control={form.control}
          name="address"
          label="Address"
          required
          rows={3}
          className={fieldClassName}
        />

        <div className="space-y-3 rounded-md border border-[#E8E8E8] bg-[#F9FAFD] px-4 py-4">
          <div>
            <Typography
              variant="label"
              className="text-[13px] font-bold tracking-wide text-[#1F1838]"
            >
              Documents &amp; photos
            </Typography>
            <Typography variant="body-sm" className="mt-1 text-[#6B7890]">
              Optional for now. You can upload these later if needed.
            </Typography>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROFILE_IMAGE_FIELDS.map(({ key, label }) => (
              <ImagePicker
                key={key}
                control={form.control}
                name={key}
                label={label}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                variant="profile-document"
                helperText="JPG, PNG, GIF"
                itemClassName="gap-2"
              />
            ))}
          </div>
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
            Save co-driver
          </Button>
        </div>
      </FormCommon>
    </DialogCommon>
  );
}
