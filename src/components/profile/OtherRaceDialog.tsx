import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { FormCommon, Input, Select } from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OtherRace } from "@/api/types/other-races";
import {
  getOtherRaceErrorMessage,
  useCreateOtherRaceMutation,
  useUpdateOtherRaceMutation,
} from "@/hooks/api/use-other-races";
import {
  buildCreateOtherRacePayload,
  buildUpdateOtherRacePayload,
  emptyOtherRaceFormValues,
  hasUpdateOtherRaceChanges,
  OTHER_RACE_ROLE_OPTIONS,
  otherRaceFormSchema,
  otherRaceToFormValues,
  type OtherRaceFormValues,
} from "@/utils/other-race-form";

const fieldClassName =
  "h-11 w-full rounded-[10px] border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

export type OtherRaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: OtherRace | null;
  onSuccess?: () => void;
};

export function OtherRaceDialog({
  open,
  onOpenChange,
  editingEntry,
  onSuccess,
}: OtherRaceDialogProps) {
  const isEdit = editingEntry != null;
  const createMutation = useCreateOtherRaceMutation();
  const updateMutation = useUpdateOtherRaceMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<OtherRaceFormValues>({
    resolver: zodResolver(otherRaceFormSchema),
    defaultValues: emptyOtherRaceFormValues,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      editingEntry ? otherRaceToFormValues(editingEntry) : emptyOtherRaceFormValues,
    );
  }, [open, editingEntry, form]);

  const onSubmit: SubmitHandler<OtherRaceFormValues> = async (values) => {
    try {
      if (isEdit && editingEntry) {
        const payload = buildUpdateOtherRacePayload(values, editingEntry);
        if (!hasUpdateOtherRaceChanges(payload)) {
          toast.message("No changes to save.");
          onOpenChange(false);
          return;
        }
        await updateMutation.mutateAsync({ id: editingEntry._id, payload });
        toast.success("Other race updated.");
      } else {
        await createMutation.mutateAsync(buildCreateOtherRacePayload(values));
        toast.success("Other race added.");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(getOtherRaceErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-[#EEF0F4] px-5 py-4">
          <DialogTitle className="text-[18px] font-semibold text-[#1F1838]">
            {isEdit ? "Edit other race" : "Add other race"}
          </DialogTitle>
          <DialogDescription className="text-[#6B7890]">
            Record a past team, vehicle, and role for your driver profile.
          </DialogDescription>
        </DialogHeader>

        <FormCommon
          form={form}
          onSubmit={onSubmit}
          className="space-y-4 px-5 py-5"
        >
          <Input
            control={form.control}
            name="team"
            label="Team / race name"
            placeholder="e.g. Red bull gas factory race"
            className={fieldClassName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              control={form.control}
              name="position"
              label="Position"
              placeholder="e.g. 1 stage"
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="vehicle"
              label="Vehicle"
              placeholder="e.g. Nissan Juke"
              className={fieldClassName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              control={form.control}
              name="year"
              label="Year"
              inputMode="numeric"
              maxLength={4}
              placeholder="2024"
              className={fieldClassName}
            />
            <Select
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select role"
              options={OTHER_RACE_ROLE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              className={fieldClassName}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#EEF0F4] bg-[#F9FAFD] px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="destructive-outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Typography as="span" variant="body" color="inherit">
                {isPending
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Add race"}
              </Typography>
            </Button>
          </div>
        </FormCommon>
      </DialogContent>
    </Dialog>
  );
}
