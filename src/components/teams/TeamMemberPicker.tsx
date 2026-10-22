import * as React from "react";
import { Link } from "react-router-dom";

import type { TeamMember } from "../../api/types/team-members";
import { DialogCommon } from "../common/DialogCommon";
import { Typography } from "../common/Typography";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import { ROUTES } from "../../utils/constants";

type TeamMemberPickerProps = {
  members: TeamMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Exact number of users the category needs. */
  required: number;
  disabled?: boolean;
  /** Shown under the list, e.g. the wrong-count message after a submit attempt. */
  error?: string | null;
};

/** Checkbox list of the driver's users, capped at the required count. */
export function TeamMemberPicker({
  members,
  selectedIds,
  onChange,
  required,
  disabled = false,
  error,
}: TeamMemberPickerProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < required) {
      onChange([...selectedIds, id]);
    }
  };

  const notEnoughUsers = members.length < required;

  return (
    <div className="space-y-3 rounded-md border border-[#E4E7EE] bg-[#F9FAFD] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography
            variant="label"
            className="text-[13px] font-bold tracking-wide text-[#1F1838]"
          >
            Team users
          </Typography>
          <Typography variant="body-sm" className="text-[#6B7890]">
            Select exactly {required} user{required === 1 ? "" : "s"} from your
            Users list.
          </Typography>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            selectedIds.length === required
              ? "bg-primary/10 text-primary"
              : "bg-[#FFF8E8] text-[#9A6B00]",
          )}
        >
          {selectedIds.length}/{required}
        </span>
      </div>

      {members.length > 0 ? (
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {members.map((m) => {
            const checked = selectedIds.includes(m._id);
            const atCap = !checked && selectedIds.length >= required;
            return (
              <label
                key={m._id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border border-[#E4E7EE] bg-white px-3 py-2",
                  (atCap || disabled) && "cursor-not-allowed opacity-50",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={atCap || disabled}
                  onCheckedChange={() => toggle(m._id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#25314D]">
                    {m.name}
                  </span>
                  <span className="block truncate text-xs text-[#8B96AD]">
                    {m.email}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      {notEnoughUsers ? (
        <p className="text-sm text-destructive">
          You have {members.length} user{members.length === 1 ? "" : "s"} but
          this category needs {required}. Add more on the{" "}
          <Link
            to={ROUTES.TEAMS}
            state={{ tab: "roster" }}
            className="font-medium underline"
          >
            Users tab
          </Link>{" "}
          first.
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

type SelectTeamMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName?: string;
  members: TeamMember[];
  required: number;
  isSubmitting?: boolean;
  /** Return to the previous step (co-driver or team details). */
  onBack: () => void;
  onSubmit: (memberIds: string[]) => void | Promise<void>;
};

/** Final create step: pick the remaining team users, then create the team. */
export function SelectTeamMembersDialog({
  open,
  onOpenChange,
  teamName,
  members,
  required,
  isSubmitting = false,
  onBack,
  onSubmit,
}: SelectTeamMembersDialogProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  // Start each opening with an empty selection.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSelectedIds([]);
  }

  const complete = selectedIds.length === required;

  return (
    <DialogCommon
      open={open}
      onOpenChange={(next) => {
        if (!next && isSubmitting) return;
        onOpenChange(next);
      }}
      headerTitle="Select team users"
      headerDescription={
        teamName
          ? `Choose the remaining users for ${teamName}.`
          : "Choose the remaining users for this team."
      }
      className="sm:max-w-[560px]"
    >
      <div className="space-y-5">
        <TeamMemberPicker
          members={members}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          required={required}
          disabled={isSubmitting}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => void onSubmit(selectedIds)}
            disabled={!complete || isSubmitting}
          >
            Create team
          </Button>
        </div>
      </div>
    </DialogCommon>
  );
}
