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
import { TeamMemberPicker } from "../teams/TeamMemberPicker";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { GENDER_OPTIONS } from "../../utils/constants";
import {
  CO_DRIVER_IMAGE_FIELDS,
  coDriverFormSchema,
  emptyCoDriverFormValues,
  type CoDriverFormValues,
} from "../../utils/co-driver-form";
import { teamMemberIdsFromTeam } from "../../utils/team-form";
import {
  extraMembersError,
  SOLO_CATEGORY_MESSAGE,
  type TeamComposition,
} from "../../utils/team-roster-rules";

const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

const genderSelectOptions = GENDER_OPTIONS.map((o) => ({
  label: o.label,
  value: o.value,
}));

const teamBasicsSchema = z.object({
  team_name: z.string().trim().min(1, "Team name is required"),
  // Team number is optional; hidden for now.
  // team_number: z.string().trim().min(1, "Team number is required"),
  team_number: z.string().trim().optional(),
});

type TeamBasicsValues = z.infer<typeof teamBasicsSchema>;

export type CreateTeamRegistrationResult = {
  team_name: string;
  team_number?: string;
  member_ids: string[];
  coDriver: CoDriverFormValues | null;
};

type CreateTeamRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryTitle: string;
  /** Team size rules for the category (driver + co-driver + users). */
  composition: TeamComposition;
  existingTeams: Team[];
  rosterMembers: TeamMember[];
  isSubmitting?: boolean;
  onSubmit: (result: CreateTeamRegistrationResult) => void | Promise<void>;
};

export function CreateTeamRegistrationDialog({
  open,
  onOpenChange,
  categoryTitle,
  composition,
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
  const [membersError, setMembersError] = React.useState<string | null>(null);

  const needsCoDriver = composition.teamAllowed && composition.needsCoDriver;
  const requiredExtraMembers = composition.teamAllowed
    ? composition.extraMembers
    : 0;

  const sourceTeamOptions = React.useMemo(
    () =>
      existingTeams.map((t) => ({
        label: t.team_number ? `${t.team_name} · #${t.team_number}` : t.team_name,
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
    setMembersError(null);
  }, [open, teamForm, coDriverForm]);

  const applyMembersFromTeam = (teamId: string) => {
    setSourceTeamId(teamId);
    if (!teamId) {
      setSelectedMemberIds([]);
      return;
    }
    const team = existingTeams.find((t) => t._id === teamId);
    if (!team) return;
    // Legacy teams keep the co-driver as a navigator member; don't copy it as a user.
    const navId = team.navigator_id?._id;
    const ids = teamMemberIdsFromTeam(team).filter((id) => id !== navId);
    setSelectedMemberIds(ids.slice(0, requiredExtraMembers));
    setMembersError(null);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleCreate = async () => {
    if (!composition.teamAllowed) return;
    const teamOk = await teamForm.trigger();
    if (!teamOk) return;

    const countError = extraMembersError(composition, selectedMemberIds.length);
    if (countError) {
      setMembersError(countError);
      return;
    }

    let coDriver: CoDriverFormValues | null = null;
    if (needsCoDriver) {
      const coOk = await coDriverForm.trigger();
      if (!coOk) return;
      coDriver = coDriverForm.getValues();
    }

    const basics = teamForm.getValues();
    await onSubmit({
      team_name: basics.team_name.trim(),
      // team_number: basics.team_number.trim(),
      member_ids: selectedMemberIds,
      coDriver,
    });
  };

  const showRoster = requiredExtraMembers > 0;

  return (
    <DialogCommon
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
        else onOpenChange(true);
      }}
      headerTitle="Add Co-driver/Navigator"
      headerDescription={`Create a team for ${categoryTitle}. You (the driver) are included automatically.`}
      className="sm:max-w-[640px]"
    >
      <div className="space-y-5">
        {!composition.teamAllowed ? (
          <p className="text-sm font-medium text-destructive">
            {SOLO_CATEGORY_MESSAGE}
          </p>
        ) : null}
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
          {/* Team number is optional; hidden for now.
          <Input
            control={teamForm.control}
            name="team_number"
            label="Team number"
            required
            className={fieldClassName}
          /> */}
        </FormCommon>

        {showRoster ? (
          <div className="space-y-3">
            {sourceTeamOptions.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#25314D]">
                  Copy users from team (optional)
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
            <TeamMemberPicker
              members={rosterMembers}
              selectedIds={selectedMemberIds}
              onChange={(ids) => {
                setSelectedMemberIds(ids);
                setMembersError(null);
              }}
              required={requiredExtraMembers}
              disabled={isSubmitting}
              error={membersError}
            />
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
                {/* <Input
                  control={coDriverForm.control}
                  name="occupation"
                  label="Occupation"
                  required
                  className={fieldClassName}
                /> */}
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
                {CO_DRIVER_IMAGE_FIELDS.map(({ key, label }) => (
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
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isSubmitting || !composition.teamAllowed}
          >
            Add Co-driver/Navigator
          </Button>
        </div>
      </div>
    </DialogCommon>
  );
}
