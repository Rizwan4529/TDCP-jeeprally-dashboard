import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormCommon,
  Input,
  Select as FormSelect,
} from "@/components/common/FormCommon";
import type { CategoryRecord } from "@/api/types/categories";
import type { TeamMember } from "@/api/types/team-members";
import type { Team } from "@/api/types/teams";
import {
  useCreateTeamMutation,
  useUpdateTeamMutation,
} from "@/hooks/api/use-teams";
import {
  buildCategoryMap,
  mergeTeamMemberIds,
  needsNavigator,
  needsRosterMembers,
  validateTeamRoster,
} from "@/utils/team-roster-rules";
import {
  buildCreateTeamPayload,
  buildUpdateTeamPayload,
  emptyTeamFormValues,
  teamFormSchema,
  teamMemberIdsFromTeam,
  type TeamFormValues,
} from "@/utils/team-form";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";

const fieldClassName =
  "h-11 w-full rounded-[10px] border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

type TeamTargetMode = "existing" | "new";

export type AddUsersToTeamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserIds: string[];
  members: TeamMember[];
  teams: Team[];
  categories: CategoryRecord[];
  navigatorOnly?: boolean;
  onSuccess?: () => void;
};

export function AddUsersToTeamDialog({
  open,
  onOpenChange,
  selectedUserIds,
  members,
  teams,
  categories,
  navigatorOnly = false,
  onSuccess,
}: AddUsersToTeamDialogProps) {
  const categoryByKey = React.useMemo(
    () => buildCategoryMap(categories),
    [categories],
  );
  const selectedMembers = React.useMemo(
    () => members.filter((m) => selectedUserIds.includes(m._id)),
    [members, selectedUserIds],
  );
  const singleUser = selectedUserIds.length === 1;
  const singleUserId = singleUser ? selectedUserIds[0] : undefined;

  const [targetMode, setTargetMode] =
    React.useState<TeamTargetMode>("existing");
  const [existingTeamId, setExistingTeamId] = React.useState("");
  const [navigatorId, setNavigatorId] = React.useState("");

  const createMutation = useCreateTeamMutation();
  const updateMutation = useUpdateTeamMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const navigatorCapableTeams = React.useMemo(
    () => teams.filter((t) => needsNavigator(categoryByKey.get(t.category))),
    [teams, categoryByKey],
  );

  const teamOptions = navigatorOnly ? navigatorCapableTeams : teams;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      ...emptyTeamFormValues,
      category: categories[0]?.key ?? "",
    },
  });

  const existingTeam = teams.find((t) => t._id === existingTeamId) ?? null;
  const existingCategory = existingTeam
    ? categoryByKey.get(existingTeam.category)
    : undefined;

  const newCategoryKey = form.watch("category");
  const newCategory = categoryByKey.get(newCategoryKey);
  const isExistingMode = targetMode === "existing" || navigatorOnly;
  const activeCategory = isExistingMode ? existingCategory : newCategory;
  const showNavigatorPicker = needsNavigator(activeCategory);

  const navigatorOptions = React.useMemo(() => {
    if (!showNavigatorPicker) return [];
    if (isExistingMode && existingTeam) {
      const cat = categoryByKey.get(existingTeam.category);
      const currentIds = teamMemberIdsFromTeam(existingTeam);
      const merge = mergeTeamMemberIds(
        currentIds,
        selectedUserIds,
        cat?.max_members ?? 0,
      );
      const ids = merge.ok ? merge.ids : selectedUserIds;
      return members.filter((m) => ids.includes(m._id));
    }
    return selectedMembers;
  }, [
    showNavigatorPicker,
    isExistingMode,
    existingTeam,
    categoryByKey,
    selectedUserIds,
    selectedMembers,
    members,
  ]);

  const wasOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;

    setTargetMode("existing");
    setExistingTeamId(teamOptions[0]?._id ?? "");
    setNavigatorId(
      navigatorOnly && singleUserId ? singleUserId : "",
    );
    form.reset({
      ...emptyTeamFormValues,
      category: categories[0]?.key ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog opens
  }, [open, navigatorOnly, singleUserId, teamOptions, categories]);

  React.useEffect(() => {
    if (!open) return;
    if (!showNavigatorPicker) {
      setNavigatorId("");
      return;
    }
    setNavigatorId((prev) => {
      if (prev && navigatorOptions.some((m) => m._id === prev)) return prev;
      return navigatorOptions[0]?._id ?? "";
    });
  }, [open, showNavigatorPicker, navigatorOptions]);

  const onSubmitNew: SubmitHandler<TeamFormValues> = async (values) => {
    const cat = categoryByKey.get(values.category);
    const navId = needsNavigator(cat)
      ? navigatorId || undefined
      : undefined;
    const memberIds = needsRosterMembers(cat) ? selectedUserIds : [];

    const validation = validateTeamRoster(cat, memberIds, navId);
    if (validation.ok === false) {
      toast.error(validation.message);
      return;
    }

    try {
      await createMutation.mutateAsync(
        buildCreateTeamPayload(values, memberIds, navId),
      );
      toast.success("Team created and users added.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create team.",
      );
    }
  };

  const handleAddToExisting = async () => {
    if (!existingTeam) {
      toast.error("Select a team.");
      return;
    }

    const cat = categoryByKey.get(existingTeam.category);
    const currentIds = teamMemberIdsFromTeam(existingTeam);
    const merge = mergeTeamMemberIds(
      currentIds,
      selectedUserIds,
      cat?.max_members ?? 0,
    );
    if (merge.ok === false) {
      toast.error(merge.message);
      return;
    }

    let resolvedNavigatorId: string | null | undefined =
      existingTeam.navigator_id?._id ?? null;
    if (needsNavigator(cat)) {
      resolvedNavigatorId = navigatorId || resolvedNavigatorId;
    }

    const validation = validateTeamRoster(
      cat,
      merge.ids,
      needsNavigator(cat) ? (resolvedNavigatorId ?? undefined) : undefined,
    );
    if (validation.ok === false) {
      toast.error(validation.message);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: existingTeam._id,
        payload: buildUpdateTeamPayload(
          {
            team_name: existingTeam.team_name,
            team_number: existingTeam.team_number,
            category: existingTeam.category,
          },
          merge.ids,
          needsNavigator(cat) ? resolvedNavigatorId : null,
        ),
      });
      toast.success("User(s) added to team.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update team.",
      );
    }
  };

  const title = navigatorOnly ? "Add as navigator to team" : "Add to team";

  const navigatorSelect = showNavigatorPicker && navigatorOptions.length > 0 && (
    <div className="grid gap-2">
      <Label htmlFor="add-to-team-navigator">Navigator</Label>
      <Select
        value={navigatorId || undefined}
        onValueChange={setNavigatorId}
      >
        <SelectTrigger id="add-to-team-navigator" className="w-full">
          <SelectValue placeholder="Select navigator" />
        </SelectTrigger>
        <SelectContent>
          {navigatorOptions.map((m) => (
            <SelectItem key={m._id} value={m._id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Typography variant="body-sm" className="text-muted-foreground">
        Choose who will navigate for this team from the selected member
        {navigatorOptions.length === 1 ? "" : "s"}.
      </Typography>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedMembers.length === 1
              ? `Selected: ${selectedMembers[0]?.name}`
              : `${selectedMembers.length} users selected: ${selectedMembers.map((m) => m.name).join(", ")}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {!navigatorOnly ? (
            <RadioGroup
              value={targetMode}
              onValueChange={(v) => setTargetMode(v as TeamTargetMode)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="team-target-existing" />
                <Label htmlFor="team-target-existing">Existing team</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="team-target-new" />
                <Label htmlFor="team-target-new">Create new team</Label>
              </div>
            </RadioGroup>
          ) : null}

          {isExistingMode ? (
            <div className="space-y-4">
              {navigatorOnly && navigatorCapableTeams.length === 0 ? (
                <Typography variant="body-sm" className="text-muted-foreground">
                  No teams in a category that allows a navigator. Create a team
                  first (e.g. Jeep), then assign this user as navigator.
                </Typography>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="add-to-team-select">Team</Label>
                <Select
                  value={existingTeamId || undefined}
                  onValueChange={setExistingTeamId}
                  disabled={teamOptions.length === 0}
                >
                  <SelectTrigger id="add-to-team-select" className="w-full">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        No teams yet
                      </SelectItem>
                    ) : (
                      teamOptions.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.team_name} · #{t.team_number} ·{" "}
                          {categoryByKey.get(t.category)?.title ??
                            CATEGORY_LABELS[t.category as Category] ??
                            t.category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {existingTeam && needsRosterMembers(existingCategory) ? (
                <Typography variant="body-sm" className="text-muted-foreground">
                  Max {existingCategory?.max_members ?? 0} member
                  {(existingCategory?.max_members ?? 0) === 1 ? "" : "s"} for
                  this category.
                </Typography>
              ) : null}

              {navigatorSelect}
            </div>
          ) : (
            <FormCommon
              form={form}
              onSubmit={onSubmitNew}
              className="space-y-4"
            >
              <Input
                control={form.control}
                name="team_name"
                label="Team name"
                required
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="team_number"
                label="Team number"
                required
                className={fieldClassName}
              />
              <FormSelect
                control={form.control}
                name="category"
                label="Category"
                placeholder="Select category"
                required
                options={categories.map((c) => ({
                  label: c.title,
                  value: c.key,
                }))}
                className={fieldClassName}
              />

              {navigatorSelect}
            </FormCommon>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="destructive-outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {isExistingMode ? (
            <Button
              type="button"
              className="bg-[#3FA565] hover:bg-[#369A5D]"
              disabled={
                isSaving ||
                !existingTeamId ||
                (navigatorOnly && navigatorCapableTeams.length === 0)
              }
              onClick={() => void handleAddToExisting()}
            >
              {navigatorOnly ? "Set as navigator" : "Add to team"}
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-[#3FA565] hover:bg-[#369A5D]"
              disabled={isSaving}
              onClick={() => void form.handleSubmit(onSubmitNew)()}
            >
              Create team & add users
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
