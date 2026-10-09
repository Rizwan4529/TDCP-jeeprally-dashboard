import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  CompassIcon,
  MailIcon,
  PlusIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  BulkActionsMenu,
  CrudTableToolbar,
} from "@/components/common/CrudTableToolbar";
import { DialogCommon } from "@/components/common/DialogCommon";
import {
  EmptyState,
  TeamsTableSkeleton,
} from "@/components/common/LoadingStates";
import {
  NavigationCommon,
  PageHeader,
  type NavigationTabItem,
} from "@/components/common/NavigationCommon";
import {
  TableActionMenuItem,
  TableActionsMenu,
} from "@/components/common/TableActionsMenu";
import {
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  Select,
} from "@/components/common/FormCommon";
import { Typography } from "@/components/common/Typography";
import {
  PAGE_SHELL,
  SIDEBAR_PAGE_PADDING,
  TABLE_SECTION,
} from "@/components/layout/pageLayout";
import { AddUsersToTeamDialog } from "@/components/teams/AddUsersToTeamDialog";
import {
  TeamsDataTable,
  TeamsDataTableBody,
  TeamsDataTableHead,
  TeamsDataTableHeader,
  TeamsDataTableHeaderRow,
  TableCell,
  TableRow,
} from "@/components/teams/TeamsDataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useActiveRallyQuery } from "@/hooks/api/use-active-rally";
import { useCategoriesQuery } from "@/hooks/api/use-categories";
import {
  getTeamMemberErrorMessage,
  useCreateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useTeamMembersQuery,
  useUpdateTeamMemberMutation,
} from "@/hooks/api/use-team-members";
import {
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useInviteCoDriverMutation,
  useMyTeamsQuery,
  useUpdateTeamMutation,
} from "@/hooks/api/use-teams";
import type { TeamMember } from "@/api/types/team-members";
import type { Team } from "@/api/types/teams";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";
import { fetchAuthToken, toDateOnlyInputValue } from "@/utils/helpers";
import { getRallyEventId, getTeamCreationBlock } from "@/utils/rally-event";
import { getTeamMemberIds } from "@/utils/registration-eligibility";
import {
  findRallyCategory,
  findRallyType,
  getCategoryTypeId,
  getRallyCategoriesForType,
  getRallyTypes,
  refId,
} from "@/utils/rally-team-options";
import { buildCategoryMap, needsNavigator } from "@/utils/team-roster-rules";
import {
  buildCreateTeamWithInvitePayload,
  buildTeamDetailsUpdatePayload,
  coDriverFromTeam,
  emptyTeamFormValues,
  teamFormSchema,
  teamToFormValues,
  type TeamFormValues,
} from "@/utils/team-form";
import {
  buildCreateTeamMemberPayload,
  buildUpdateTeamMemberPayload,
  emptyTeamMemberFormValues,
  teamMemberFormSchema,
  teamMemberToFormValues,
  type TeamMemberFormValues,
} from "@/utils/team-member-form";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const fieldClassName =
  "h-11 w-full rounded-md border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

type PageTab = "roster" | "teams";

const TEAMS_NAV: NavigationTabItem<PageTab>[] = [
  { name: "Users", label: "roster" },
  { name: "My teams", label: "teams" },
];

export default function TeamsPage() {
  return <TeamsScreen />;
}

function TeamsScreen() {
  const token = React.useMemo(() => fetchAuthToken(), []);
  const location = useLocation();
  const initialTab =
    (location.state as { tab?: PageTab } | null)?.tab === "teams"
      ? "teams"
      : "roster";
  const [pageTab, setPageTab] = React.useState<PageTab>(initialTab);
  const activeTab = TEAMS_NAV.find((t) => t.label === pageTab) ?? TEAMS_NAV[0];

  React.useEffect(() => {
    const tab = (location.state as { tab?: PageTab } | null)?.tab;
    if (tab === "roster" || tab === "teams") {
      setPageTab(tab);
    }
  }, [location.state]);

  return (
    <section className={cn(PAGE_SHELL, SIDEBAR_PAGE_PADDING, "gap-4")}>
      <PageHeader
        title="Teams"
        description="Manage users and build teams for rally registration."
      />

      <NavigationCommon
        navList={TEAMS_NAV}
        activeTab={activeTab}
        handleActiveTab={(tab) => setPageTab(tab.label)}
        className="shrink-0"
      />

      <div className={cn(TABLE_SECTION, "min-h-0 overflow-y-auto")}>
        {pageTab === "roster" ? (
          <RosterSection token={Boolean(token)} />
        ) : (
          <MyTeamsSection token={Boolean(token)} />
        )}
      </div>
    </section>
  );
}

function RosterSection({ token }: { token: boolean }) {
  const membersQuery = useTeamMembersQuery(token);
  const teamsQuery = useMyTeamsQuery(token);
  const categoriesQuery = useCategoriesQuery(token);
  const members = Array.isArray(membersQuery.data?.data)
    ? membersQuery.data.data
    : [];
  const teams = Array.isArray(teamsQuery.data?.data)
    ? teamsQuery.data.data
    : [];
  const categories = React.useMemo(
    () =>
      Array.isArray(categoriesQuery.data?.data)
        ? categoriesQuery.data.data
        : [],
    [categoriesQuery.data?.data],
  );

  const rosterRoles = React.useMemo(() => buildRosterRoleMap(teams), [teams]);

  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [addToTeamOpen, setAddToTeamOpen] = React.useState(false);
  const [navigatorDialogOpen, setNavigatorDialogOpen] = React.useState(false);

  const filteredMembers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const role = rosterRoles.get(m._id);
      const teamNames = [
        ...(role?.memberTeamNames ?? []),
        ...(role?.navigatorTeamNames ?? []),
      ];
      const haystack = [
        m.name,
        m.email,
        m.contact_number,
        m.cnic,
        m.date_of_birth,
        role?.isNavigator ? "navigator" : "",
        ...teamNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [members, search, rosterRoles]);

  const selectedIdList = React.useMemo(() => [...selectedIds], [selectedIds]);
  const allSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.has(m._id));
  const someSelected = filteredMembers.some((m) => selectedIds.has(m._id));

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const createMutation = useCreateTeamMemberMutation();
  const updateMutation = useUpdateTeamMemberMutation();
  const deleteMutation = useDeleteTeamMemberMutation();

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: emptyTeamMemberFormValues,
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEdit = Boolean(editingId);

  const openNew = () => {
    setEditingId(null);
    form.reset(emptyTeamMemberFormValues);
    setDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingId(m._id);
    form.reset(teamMemberToFormValues(m));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    form.reset(emptyTeamMemberFormValues);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
      return;
    }
    setDialogOpen(true);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSelectAllChange = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds(new Set(filteredMembers.map((m) => m._id)));
    } else {
      clearSelection();
    }
  };

  const handleSelectOneChange = (
    id: string,
    checked: boolean | "indeterminate",
  ) => {
    const isChecked = checked === true;
    setSelectedIds((prev) => {
      if (isChecked) {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      }
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = selectedIdList;
    if (ids.length === 0) return;
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        failed += 1;
        toast.error(getTeamMemberErrorMessage(err));
      }
    }
    if (failed < ids.length) {
      toast.success(
        failed === 0
          ? `Removed ${ids.length} user${ids.length === 1 ? "" : "s"}.`
          : `Removed ${ids.length - failed} user(s).`,
      );
    }
    clearSelection();
    if (editingId && ids.includes(editingId)) closeDialog();
  };

  const onSubmit: SubmitHandler<TeamMemberFormValues> = async (values) => {
    try {
      if (isEdit && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: buildUpdateTeamMemberPayload(values),
        });
        toast.success("User updated.");
      } else {
        await createMutation.mutateAsync(buildCreateTeamMemberPayload(values));
        toast.success("User added.");
      }
      closeDialog();
    } catch (err) {
      toast.error(getTeamMemberErrorMessage(err));
    }
  };

  return (
    <Card className={cn(surface, "rounded-md")}>
      <CrudTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        addAction={
          <Button
            type="button"
            variant="primary-outline"
            className="shrink-0"
            onClick={openNew}
            disabled={!token}
          >
            <PlusIcon className="size-4" />
            Add user
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6">
        {membersQuery.isLoading ? (
          <TeamsTableSkeleton rows={6} />
        ) : membersQuery.isError ? (
          <EmptyState
            icon={UsersIcon}
            title="Could not load users"
            description="Something went wrong while fetching your team members."
            variant="error"
            size="compact"
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users yet"
            description="Add people you want on your teams before creating or joining a team."
            action={
              <Button type="button" onClick={openNew} disabled={!token}>
                <PlusIcon className="size-4" />
                Add first user
              </Button>
            }
          />
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No matching users"
            description="Try a different search term."
            size="compact"
          />
        ) : (
          <>
            <TeamsDataTable tableClassName="table-fixed">
              <TeamsDataTableHeader>
                <TeamsDataTableHeaderRow>
                  <TeamsDataTableHead className="w-10">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={handleSelectAllChange}
                      aria-label="Select all users"
                      className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                    />
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[12%]">
                    Name
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[16%]">
                    Email
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[11%]">
                    Contact
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[11%]">
                    CNIC
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[10%]">
                    Date of birth
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[10%]">
                    Navigator
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[14%]">
                    Teams
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-24 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Actions</span>
                      <BulkActionsMenu
                        enabled={selectedIdList.length > 0}
                        triggerClassName="text-white hover:bg-white/15 hover:text-white disabled:opacity-50 disabled:text-white/50"
                      >
                        <TableActionMenuItem
                          onClick={() => setAddToTeamOpen(true)}
                        >
                          <UserPlusIcon className="size-4" />
                          Add to team
                        </TableActionMenuItem>
                        {selectedIdList.length === 1 ? (
                          <TableActionMenuItem
                            onClick={() => setNavigatorDialogOpen(true)}
                          >
                            <CompassIcon className="size-4" />
                            Add as navigator
                          </TableActionMenuItem>
                        ) : null}
                        <TableActionMenuItem
                          destructive
                          disabled={deleteMutation.isPending}
                          onClick={() => void handleBulkDelete()}
                        >
                          <Trash2Icon className="size-4" />
                          Delete selected
                        </TableActionMenuItem>
                      </BulkActionsMenu>
                    </div>
                  </TeamsDataTableHead>
                </TeamsDataTableHeaderRow>
              </TeamsDataTableHeader>
              <TeamsDataTableBody>
                {filteredMembers.map((m) => {
                  const role = rosterRoles.get(m._id);
                  const isSelected = selectedIds.has(m._id);
                  return (
                    <TableRow
                      key={m._id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(isSelected && "bg-primary/5")}
                    >
                      <TableCell className="px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOneChange(m._id, checked)
                          }
                          aria-label={`Select ${m.name}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-0 px-3 font-semibold text-[#1F1838]">
                        <span className="block truncate" title={m.name}>
                          {m.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 px-3 text-[#6B7890]">
                        <span className="block truncate" title={m.email}>
                          {m.email}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 px-3 text-[#6B7890]">
                        <span
                          className="block truncate"
                          title={m.contact_number}
                        >
                          {m.contact_number}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 px-3 text-[#6B7890]">
                        <span className="block truncate" title={m.cnic}>
                          {m.cnic}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 px-3 text-[#6B7890]">
                        <span className="block truncate">
                          {toDateOnlyInputValue(m.date_of_birth) ||
                            m.date_of_birth ||
                            "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <NavigatorStatusCell role={role} />
                      </TableCell>
                      <TableCell className="max-w-0 px-3 align-middle">
                        <UserTeamsCell role={role} />
                      </TableCell>
                      <TableCell className="w-24 px-3 text-right align-middle whitespace-nowrap">
                        <div className="flex justify-end">
                          <TableActionsMenu>
                            <TableActionMenuItem onClick={() => openEdit(m)}>
                              Edit
                            </TableActionMenuItem>
                            <TableActionMenuItem
                              destructive
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                void (async () => {
                                  try {
                                    await deleteMutation.mutateAsync(m._id);
                                    toast.success("User removed.");
                                    if (editingId === m._id) closeDialog();
                                  } catch (err) {
                                    toast.error(getTeamMemberErrorMessage(err));
                                  }
                                })();
                              }}
                            >
                              Delete
                            </TableActionMenuItem>
                          </TableActionsMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TeamsDataTableBody>
            </TeamsDataTable>

            <AddUsersToTeamDialog
              open={addToTeamOpen}
              onOpenChange={setAddToTeamOpen}
              selectedUserIds={selectedIdList}
              members={members}
              teams={teams}
              categories={categories}
              onSuccess={clearSelection}
            />
            <AddUsersToTeamDialog
              open={navigatorDialogOpen}
              onOpenChange={setNavigatorDialogOpen}
              selectedUserIds={selectedIdList}
              members={members}
              teams={teams}
              categories={categories}
              navigatorOnly
              onSuccess={clearSelection}
            />
          </>
        )}
      </div>

      <DialogCommon
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        headerTitle={isEdit ? "Edit user" : "Add user"}
        headerDescription={
          isEdit
            ? "Update this team member’s details."
            : "Add a person you can assign to your teams."
        }
        className="sm:max-w-[640px]"
      >
        <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
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
            <Input
              control={form.control}
              name="contact_number"
              label="Contact number"
              required
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="cnic"
              label="CNIC"
              required
              className={fieldClassName}
            />
            <DatePicker
              control={form.control}
              name="date_of_birth"
              label="Date of birth"
              placeholder="YYYY-MM-DD"
              required
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="occupation"
              label="Occupation"
              className={fieldClassName}
            />
            <Input
              control={form.control}
              name="location"
              label="Location"
              className={fieldClassName}
            />
          </div>
          <ImagePicker
            control={form.control}
            name="profile_image"
            label="Profile photo"
            accept="image/*"
            variant="compact"
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="destructive-outline"
              onClick={closeDialog}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isEdit ? "Update user" : "Save user"}
            </Button>
          </div>
        </FormCommon>
      </DialogCommon>
    </Card>
  );
}

function MyTeamsSection({ token }: { token: boolean }) {
  const categoriesQuery = useCategoriesQuery(token);
  const teamsQuery = useMyTeamsQuery(token);
  const activeRallyQuery = useActiveRallyQuery(token);
  const activeRally = activeRallyQuery.data?.data ?? null;
  const activeEventId = getRallyEventId(activeRally);

  const categories = React.useMemo(
    () =>
      Array.isArray(categoriesQuery.data?.data)
        ? categoriesQuery.data.data
        : [],
    [categoriesQuery.data?.data],
  );
  const legacyCategoryByKey = React.useMemo(
    () => buildCategoryMap(categories),
    [categories],
  );
  /** Looks a team's category up by rally id/key first, then legacy key. */
  const lookupCategory = React.useCallback(
    (value: string | undefined) =>
      findRallyCategory(activeRally, value) ??
      (value ? legacyCategoryByKey.get(value) : undefined),
    [activeRally, legacyCategoryByKey],
  );

  const rallyTypes = React.useMemo(() => getRallyTypes(activeRally), [activeRally]);
  const typeOptions = React.useMemo(
    () => rallyTypes.map((t) => ({ label: t.name, value: t._id })),
    [rallyTypes],
  );

  const teams = Array.isArray(teamsQuery.data?.data)
    ? teamsQuery.data.data
    : [];

  const createMutation = useCreateTeamMutation();
  const updateMutation = useUpdateTeamMutation();
  const inviteMutation = useInviteCoDriverMutation();
  const deleteMutation = useDeleteTeamMutation();

  const isLoading = categoriesQuery.isLoading || teamsQuery.isLoading;
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: emptyTeamFormValues,
  });

  const selectedTypeId = form.watch("type") ?? "";
  const selectedCategoryValue = form.watch("category");
  const selectedCategory = lookupCategory(selectedCategoryValue);
  const showCoDriverField = needsNavigator(selectedCategory);

  const isEdit = Boolean(editingTeam);
  const editingCoDriver = editingTeam ? coDriverFromTeam(editingTeam) : null;

  /** Editing a team whose category isn't in the active rally: keep it selectable. */
  const legacyCategoryOption = React.useMemo(() => {
    if (!editingTeam || findRallyCategory(activeRally, editingTeam.category)) {
      return null;
    }
    return {
      label: lookupCategory(editingTeam.category)?.title ?? editingTeam.category,
      value: editingTeam.category,
    };
  }, [editingTeam, activeRally, lookupCategory]);

  const categoryOptions = React.useMemo(() => {
    const options = getRallyCategoriesForType(activeRally, selectedTypeId).map(
      (c) => ({ label: c.title, value: c._id }),
    );
    return legacyCategoryOption ? [...options, legacyCategoryOption] : options;
  }, [activeRally, selectedTypeId, legacyCategoryOption]);

  // Changing the type clears a category that doesn't belong to it.
  React.useEffect(() => {
    if (!dialogOpen) return;
    const current = form.getValues("category");
    if (current && !categoryOptions.some((o) => o.value === current)) {
      form.setValue("category", "");
    }
  }, [dialogOpen, categoryOptions, form]);
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    inviteMutation.isPending;

  const filteredTeams = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => {
      const catTitle =
        lookupCategory(t.category)?.title ??
        CATEGORY_LABELS[t.category as Category] ??
        t.category;
      const haystack = [
        t.team_name,
        String(t.team_number),
        t.category,
        catTitle,
        coDriverFromTeam(t)?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [teams, search, lookupCategory]);

  /** Toasts and returns false when a team can't be created right now. */
  const ensureTeamCreationAllowed = (): boolean => {
    if (activeRallyQuery.isPending) {
      toast.info("Checking the active event. Please try again in a moment.");
      return false;
    }
    if (activeRallyQuery.isError) {
      toast.error("Couldn't check the active event", {
        description:
          "Teams can only be created while an event's registration is open. Please refresh and try again.",
      });
      return false;
    }
    // Re-evaluated on every click so a window that closes mid-session is respected.
    const block = getTeamCreationBlock(activeRally);
    if (block) {
      toast.error(block.title, { description: block.description });
      return false;
    }
    if (rallyTypes.length === 0) {
      toast.error("No vehicle types available", {
        description: `${activeRally?.name ?? "The active event"} has no vehicle types or categories open for teams yet.`,
      });
      return false;
    }
    return true;
  };

  const teamCreationBlocked =
    !activeRallyQuery.isPending &&
    (activeRallyQuery.isError || Boolean(getTeamCreationBlock(activeRally)));

  const openNew = () => {
    if (!ensureTeamCreationAllowed()) return;
    setEditingTeam(null);
    form.reset({
      ...emptyTeamFormValues,
      type: rallyTypes.length === 1 ? rallyTypes[0]._id : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (team: Team) => {
    const rallyCategory = findRallyCategory(activeRally, team.category);
    setEditingTeam(team);
    form.reset({
      ...teamToFormValues(team),
      type:
        findRallyType(activeRally, refId(team.type))?._id ||
        (rallyCategory ? getCategoryTypeId(rallyCategory) : ""),
      category: rallyCategory?._id ?? team.category,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTeam(null);
    form.reset(emptyTeamFormValues);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
      return;
    }
    setDialogOpen(true);
  };

  const onSubmitTeam: SubmitHandler<TeamFormValues> = async (values) => {
    if (!isEdit && !values.type?.trim()) {
      form.setError("type", { message: "Select a vehicle type." });
      return;
    }
    const cat = lookupCategory(values.category);
    const requiresCoDriver = needsNavigator(cat);
    const coDriverEmail = requiresCoDriver
      ? values.co_driver_email?.trim() || ""
      : "";
    const valuesToSave = { ...values, co_driver_email: coDriverEmail };

    if (!isEdit && !ensureTeamCreationAllowed()) return;

    if (!isEdit && requiresCoDriver && !coDriverEmail) {
      form.setError("co_driver_email", {
        message: "Enter your co-driver's email to invite them.",
      });
      return;
    }

    try {
      if (isEdit && editingTeam) {
        await updateMutation.mutateAsync({
          id: editingTeam._id,
          payload: buildTeamDetailsUpdatePayload(valuesToSave),
        });
        if (coDriverEmail && !editingCoDriver) {
          try {
            await inviteMutation.mutateAsync({
              teamId: editingTeam._id,
              payload: { co_driver_email: coDriverEmail },
            });
          } catch (err) {
            // Details saved; keep the dialog open so the email can be fixed.
            toast.success("Team updated.");
            form.setError("co_driver_email", {
              message:
                err instanceof Error ? err.message : "Could not send invite.",
            });
            return;
          }
          toast.success(
            `Team updated. Invite sent to ${coDriverEmail}. They become co-driver once they accept.`,
          );
        } else {
          toast.success("Team updated.");
        }
      } else {
        await createMutation.mutateAsync(
          buildCreateTeamWithInvitePayload(valuesToSave, activeEventId),
        );
        toast.success(
          coDriverEmail
            ? `Team created. Invite sent to ${coDriverEmail}. They become co-driver once they accept.`
            : "Team created.",
        );
      }
      closeDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save team.");
    }
  };

  return (
    <Card className={cn(surface, "rounded-md")}>
      <CrudTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teams..."
        addAction={
          <Button
            type="button"
            variant="primary-outline"
            className={cn("shrink-0", teamCreationBlocked && "opacity-60")}
            onClick={openNew}
            disabled={!token}
            aria-disabled={teamCreationBlocked || undefined}
          >
            <PlusIcon className="size-4" />
            Add team
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6">
        {isLoading ? (
          <TeamsTableSkeleton rows={5} />
        ) : teamsQuery.isError ? (
          <EmptyState
            icon={UsersRoundIcon}
            title="Could not load teams"
            description="Something went wrong while fetching your teams."
            variant="error"
            size="compact"
          />
        ) : teams.length === 0 ? (
          <EmptyState
            icon={UsersRoundIcon}
            title="No teams yet"
            description="Create a team to register for events with your crew."
            action={
              <Button
                type="button"
                className={cn(teamCreationBlocked && "opacity-60")}
                onClick={openNew}
                disabled={!token}
                aria-disabled={teamCreationBlocked || undefined}
              >
                <PlusIcon className="size-4" />
                Create first team
              </Button>
            }
          />
        ) : filteredTeams.length === 0 ? (
          <EmptyState
            icon={UsersRoundIcon}
            title="No matching teams"
            description="Try a different search term."
            size="compact"
          />
        ) : (
          <TeamsDataTable>
            <TeamsDataTableHeader>
              <TeamsDataTableHeaderRow>
                <TeamsDataTableHead>Team name</TeamsDataTableHead>
                <TeamsDataTableHead>Number</TeamsDataTableHead>
                <TeamsDataTableHead>Category</TeamsDataTableHead>
                <TeamsDataTableHead>Members</TeamsDataTableHead>
                <TeamsDataTableHead>Co-driver</TeamsDataTableHead>
                <TeamsDataTableHead className="min-w-[96px] text-right">
                  Actions
                </TeamsDataTableHead>
              </TeamsDataTableHeaderRow>
            </TeamsDataTableHeader>
            <TeamsDataTableBody>
              {filteredTeams.map((t) => {
                const catTitle =
                  lookupCategory(t.category)?.title ??
                  CATEGORY_LABELS[t.category as Category] ??
                  t.category;
                const memberCount = getTeamMemberIds(t).length;
                const coDriver = coDriverFromTeam(t);
                const awaitingCoDriver =
                  !coDriver && needsNavigator(lookupCategory(t.category));
                return (
                  <TableRow key={t._id}>
                    <TableCell className="px-4 font-semibold text-[#1F1838]">
                      {t.team_name}
                    </TableCell>
                    <TableCell className="px-4 font-medium text-[#1F1838]">
                      #{t.team_number}
                    </TableCell>
                    <TableCell className="px-4 text-[#6B7890]">
                      {catTitle}
                    </TableCell>
                    <TableCell className="px-4 text-[#1F1838]">
                      {memberCount > 0 ? (
                        <span>
                          {memberCount}{" "}
                          {memberCount === 1 ? "member" : "members"}
                        </span>
                      ) : (
                        <span className="text-[#9AA6C8]">0</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      {coDriver?.name ? (
                        <span className="font-medium text-[#1F1838]">
                          {coDriver.name}
                        </span>
                      ) : awaitingCoDriver ? (
                        <span className="rounded-full border border-[#F0DFA8] bg-[#FFF8E8] px-2.5 py-1 text-xs font-medium text-[#9A6B00]">
                          Not joined yet
                        </span>
                      ) : (
                        <span className="text-[#9AA6C8]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[96px] px-4 text-right align-middle whitespace-nowrap">
                      <div className="flex justify-end">
                        <TableActionsMenu>
                          <TableActionMenuItem onClick={() => openEdit(t)}>
                            Edit
                          </TableActionMenuItem>
                          <TableActionMenuItem
                            destructive
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              void (async () => {
                                await deleteMutation.mutateAsync(t._id);
                                toast.success("Team deleted.");
                              })();
                            }}
                          >
                            Delete
                          </TableActionMenuItem>
                        </TableActionsMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TeamsDataTableBody>
          </TeamsDataTable>
        )}
      </div>

      <DialogCommon
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        headerTitle={isEdit ? "Edit team" : "Add team"}
        headerDescription={
          isEdit
            ? "Update this team’s details, or invite a co-driver if it doesn’t have one yet."
            : "Create a team. Categories that need a navigator ask you to invite a co-driver: a registered driver who joins once they accept."
        }
        className="sm:max-w-[520px]"
      >
        <FormCommon form={form} onSubmit={onSubmitTeam} className="space-y-5">
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
          <Select
            control={form.control}
            name="type"
            label="Type"
            placeholder="Select vehicle type"
            required={!isEdit}
            options={typeOptions}
            className={fieldClassName}
          />
          <Select
            control={form.control}
            name="category"
            label="Category"
            placeholder={
              selectedTypeId || legacyCategoryOption
                ? "Select category"
                : "Select a type first"
            }
            required
            disabled={categoryOptions.length === 0}
            options={categoryOptions}
            className={fieldClassName}
          />
          {selectedTypeId && categoryOptions.length === 0 ? (
            <p className="-mt-3 text-sm text-[#9A6B00]">
              No categories are open for this type in the active event.
            </p>
          ) : null}

          {showCoDriverField ? (
            isEdit && editingCoDriver ? (
              <div className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-3">
                <Typography
                  variant="body-sm"
                  className="font-medium text-[#1F1838]"
                >
                  Co-driver: {editingCoDriver.name}
                </Typography>
                <Typography variant="body-sm" className="text-[#6B7890]">
                  {editingCoDriver.email}
                </Typography>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Input
                  control={form.control}
                  name="co_driver_email"
                  label={isEdit ? "Invite co-driver" : "Co-driver email"}
                  type="email"
                  placeholder="co-driver@example.com"
                  required={!isEdit}
                  className={fieldClassName}
                />
                <Typography
                  variant="body-sm"
                  className="flex items-start gap-1.5 text-[#6B7890]"
                >
                  <MailIcon className="mt-0.5 size-3.5 shrink-0" />
                  {isEdit
                    ? "Only needed to send a new invite, e.g. if your last invite was declined."
                    : "They must already have a driver account."}
                </Typography>
              </div>
            )
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isEdit
                ? "Update team"
                : showCoDriverField
                  ? "Save & send invite"
                  : "Save team"}
            </Button>
          </div>
        </FormCommon>
      </DialogCommon>
    </Card>
  );
}

type RosterRoleInfo = {
  isNavigator: boolean;
  navigatorTeamNames: string[];
  memberTeamNames: string[];
};

function buildRosterRoleMap(teams: Team[]): Map<string, RosterRoleInfo> {
  const map = new Map<string, RosterRoleInfo>();

  for (const team of teams) {
    const navId = team.navigator_id?._id;
    if (navId) {
      const prev = map.get(navId) ?? {
        isNavigator: false,
        navigatorTeamNames: [],
        memberTeamNames: [],
      };
      prev.isNavigator = true;
      if (!prev.navigatorTeamNames.includes(team.team_name)) {
        prev.navigatorTeamNames.push(team.team_name);
      }
      map.set(navId, prev);
    }
    for (const m of team.member_ids ?? []) {
      const prev = map.get(m._id) ?? {
        isNavigator: false,
        navigatorTeamNames: [],
        memberTeamNames: [],
      };
      if (m._id !== navId && !prev.memberTeamNames.includes(team.team_name)) {
        prev.memberTeamNames.push(team.team_name);
      }
      map.set(m._id, prev);
    }
  }

  return map;
}

function NavigatorBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 font-semibold uppercase tracking-wide text-primary",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
    >
      <CompassIcon className={compact ? "size-3" : "size-3.5"} aria-hidden />
      Navigator
    </span>
  );
}

function getUserTeamNames(role: RosterRoleInfo | undefined): string[] {
  if (!role) return [];
  return [...new Set([...role.navigatorTeamNames, ...role.memberTeamNames])];
}

function NavigatorStatusCell({ role }: { role: RosterRoleInfo | undefined }) {
  if (!role?.isNavigator) {
    return <span className="text-[#9AA6C8]">No</span>;
  }
  return <NavigatorBadge compact />;
}

function UserTeamsCell({ role }: { role: RosterRoleInfo | undefined }) {
  const teams = getUserTeamNames(role);
  if (teams.length === 0) {
    return <span className="text-[#9AA6C8]">—</span>;
  }

  const label = teams.join(", ");
  return (
    <span className="block truncate text-[13px] text-[#1F1838]" title={label}>
      {label}
    </span>
  );
}
