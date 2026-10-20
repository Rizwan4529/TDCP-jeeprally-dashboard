import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import type { TeamMember } from "../../api/types/team-members";
import type { Team } from "../../api/types/teams";
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
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import { GENDER_OPTIONS } from "../../utils/constants";
import {
  coDriverFormSchema,
  emptyCoDriverFormValues,
  type CoDriverFormValues,
} from "../../utils/co-driver-form";
import { PROFILE_IMAGE_FIELDS } from "../../utils/profile-update";
import { teamMemberIdsFromTeam } from "../../utils/team-form";

const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

const genderSelectOptions = GENDER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

const teamBasicsSchema = z.object({
  team_name: z.string().trim().min(1, "Team name is required"),
  team_number: z.string().trim().min(1, "Team number is required"),
});

type TeamBasicsValues = z.infer<typeof teamBasicsSchema>;

export type CreateTeamRegistrationResult = {
  team_name: string;
  team_number: string;
  member_ids: string[];
  coDriver: CoDriverFormValues | null;
};

type CreateTeamRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryTitle: string;
  needsCoDriver: boolean;
  /** Cap for optional roster users (excluding the driver). */
  maxExtraMembers: number;
  existingTeams: Team[];
  rosterMembers: TeamMember[];
  isSubmitting?: boolean;
  onSubmit: (result: CreateTeamRegistrationResult) => void | Promise<void>;
};

export function CreateTeamRegistrationDialog({
  open,
  onOpenChange,
  categoryTitle,
  needsCoDriver,
  maxExtraMembers,
  existingTeams,
  rosterMembers,
  isSubmitting = false,
  onSubmit,
}: CreateTeamRegistrationDialogProps) {
  const teamForm = useForm<TeamBasicsValues>({
    resolver: zodResolver(teamBasicsSchema),
    defaultValues: { team_name: "", team_number: "" },
  });
  const coDriverForm = useForm<CoDriverFormValues>({
    resolver: zodResolver(coDriverFormSchema),
    defaultValues: emptyCoDriverFormValues,
  });

  const [sourceTeamId, setSourceTeamId] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>(
    [],
  );

  const sourceTeamOptions = React.useMemo(
    () =>
      existingTeams.map((t) => ({
        label: `${t.team_name} · #${t.team_number}`,
        value: t._id,
      })),
    [existingTeams],
  );

  React.useEffect(() => {
    if (!open) return;
    teamForm.reset({ team_name: "", team_number: "" });
    coDriverForm.reset(emptyCoDriverFormValues);
    setSourceTeamId("");
    setSelectedMemberIds([]);
  }, [open, teamForm, coDriverForm]);

  const applyMembersFromTeam = (teamId: string) => {
    setSourceTeamId(teamId);
    if (!teamId) {
      setSelectedMemberIds([]);
      return;
    }
    const team = existingTeams.find((t) => t._id === teamId);
    if (!team) return;
    const ids = teamMemberIdsFromTeam(team);
    const capped =
      maxExtraMembers > 0 ? ids.slice(0, maxExtraMembers) : ids.slice(0, 0);
    setSelectedMemberIds(capped);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (maxExtraMembers > 0 && prev.length >= maxExtraMembers) return prev;
      return [...prev, id];
    });
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleCreate = async () => {
    const teamOk = await teamForm.trigger();
    if (!teamOk) return;

    let coDriver: CoDriverFormValues | null = null;
    if (needsCoDriver) {
      const coOk = await coDriverForm.trigger();
      if (!coOk) return;
      coDriver = coDriverForm.getValues();
    }

    const basics = teamForm.getValues();
    await onSubmit({
      team_name: basics.team_name.trim(),
      team_number: basics.team_number.trim(),
      member_ids: selectedMemberIds,
      coDriver,
    });
  };

  const showRoster =
    maxExtraMembers > 0 && (rosterMembers.length > 0 || existingTeams.length > 0);

  return (
    <DialogCommon
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
        else onOpenChange(true);
      }}
      headerTitle="Add team"
      headerDescription={`Create a team for ${categoryTitle}. You (the driver) are included automatically.`}
      className="sm:max-w-[640px]"
    >
      <div className="space-y-5">
        <FormCommon
          form={teamForm}
          onSubmit={(() => undefined) as SubmitHandler<TeamBasicsValues>}
          className="space-y-4"
        >
          <Input
            control={teamForm.control}
            name="team_name"
            label="Team name"
            required
            className={fieldClassName}
          />
          <Input
            control={teamForm.control}
            name="team_number"
            label="Team number"
            required
            className={fieldClassName}
          />
        </FormCommon>

        {showRoster ? (
          <div className="space-y-3 rounded-md border border-[#E4E7EE] bg-[#F9FAFD] p-4">
            <div className="space-y-1">
              <Typography
                variant="label"
                className="text-[13px] font-bold tracking-wide text-[#1F1838]"
              >
                Users from an existing team
              </Typography>
              <Typography variant="body-sm" className="text-[#6B7890]">
                Optionally copy users from another team, or pick from your
                roster. Max {maxExtraMembers} besides you
                {needsCoDriver ? " (co-driver is separate below)" : ""}.
              </Typography>
            </div>

            {sourceTeamOptions.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#25314D]">
                  Copy from team
                </label>
                <select
                  className={cn(fieldClassName, "appearance-auto")}
                  value={sourceTeamId}
                  disabled={isSubmitting}
                  onChange={(e) => applyMembersFromTeam(e.target.value)}
                >
                  <option value="">None</option>
                  {sourceTeamOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {rosterMembers.length > 0 ? (
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {rosterMembers.map((m) => {
                  const checked = selectedMemberIds.includes(m._id);
                  const atCap =
                    !checked &&
                    maxExtraMembers > 0 &&
                    selectedMemberIds.length >= maxExtraMembers;
                  return (
                    <label
                      key={m._id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border bg-white px-3 py-2",
                        atCap ? "opacity-50" : "border-[#E4E7EE]",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={atCap || isSubmitting}
                        onCheckedChange={() => toggleMember(m._id)}
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
            ) : (
              <Typography variant="body-sm" className="text-[#8B96AD]">
                No users in your roster yet. Add users on the Teams page, or
                continue with just a co-driver.
              </Typography>
            )}
          </div>
        ) : null}

        {needsCoDriver ? (
          <div className="space-y-4 rounded-md border border-[#E4E7EE] p-4">
            <div className="space-y-1">
              <Typography
                variant="label"
                className="text-[13px] font-bold tracking-wide text-[#1F1838]"
              >
                Co-driver
              </Typography>
              <Typography variant="body-sm" className="text-[#6B7890]">
                Required for this category. Enter a new co-driver profile
                (photos optional).
              </Typography>
            </div>
            <FormCommon
              form={coDriverForm}
              onSubmit={(() => undefined) as SubmitHandler<CoDriverFormValues>}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  control={coDriverForm.control}
                  name="name"
                  label="Full name"
                  required
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="email"
                  label="Email"
                  type="email"
                  required
                  className={fieldClassName}
                />
                <Select
                  control={coDriverForm.control}
                  name="gender"
                  label="Gender"
                  required
                  placeholder="Select gender"
                  options={genderSelectOptions}
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="age"
                  label="Age"
                  required
                  inputMode="numeric"
                  maxLength={3}
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="occupation"
                  label="Occupation"
                  required
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="contact_number"
                  label="Contact number"
                  required
                  inputMode="numeric"
                  maxLength={11}
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="cnic"
                  label="CNIC"
                  required
                  inputMode="numeric"
                  maxLength={13}
                  className={fieldClassName}
                />
                <DatePicker
                  control={coDriverForm.control}
                  name="date_of_birth"
                  label="Date of birth"
                  required
                  placeholder="YYYY-MM-DD"
                  className={fieldClassName}
                />
                <Input
                  control={coDriverForm.control}
                  name="license_number"
                  label="License number"
                  required
                  className={fieldClassName}
                />
                <DatePicker
                  control={coDriverForm.control}
                  name="license_expiry"
                  label="License expiry"
                  required
                  placeholder="YYYY-MM-DD"
                  calendarYearsFuture={50}
                  className={fieldClassName}
                />
              </div>
              <Textarea
                control={coDriverForm.control}
                name="address"
                label="Address"
                required
                rows={2}
                className={fieldClassName}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {PROFILE_IMAGE_FIELDS.map(({ key, label }) => (
                  <ImagePicker
                    key={key}
                    control={coDriverForm.control}
                    name={key}
                    label={label}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    variant="profile-document"
                    helperText="Optional"
                    itemClassName="gap-2"
                  />
                ))}
              </div>
            </FormCommon>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleCreate()} disabled={isSubmitting}>
            Create team
          </Button>
        </div>
      </div>
    </DialogCommon>
  );
}
