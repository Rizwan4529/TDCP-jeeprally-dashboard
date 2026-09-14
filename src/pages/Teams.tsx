import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  CompassIcon,
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
  useMyTeamsQuery,
  useUpdateTeamMutation,
} from "@/hooks/api/use-teams";
import type { TeamMember } from "@/api/types/team-members";
import type { Team } from "@/api/types/teams";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type Category,
} from "@/utils/constants";
import { fetchAuthToken, toDateOnlyInputValue } from "@/utils/helpers";
import { buildCategoryMap, needsNavigator } from "@/utils/team-roster-rules";
import {
  buildCreateTeamPayload,
  buildUpdateTeamPayload,
  emptyTeamFormValues,
  selectedMembersForTeamForm,
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
  const activeTab =
    TEAMS_NAV.find((t) => t.label === pageTab) ?? TEAMS_NAV[0];

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
                      className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-[#3FA565]"
                    />
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[12%]">Name</TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[16%]">Email</TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[11%]">Contact</TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[11%]">CNIC</TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[10%]">
                    Date of birth
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[10%]">
                    Navigator
                  </TeamsDataTableHead>
                  <TeamsDataTableHead className="w-[14%]">Teams</TeamsDataTableHead>
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
                      className={cn(isSelected && "bg-[#EAF6EF]/50")}
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
                                    toast.error(
                                      getTeamMemberErrorMessage(err),
                                    );
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
  const membersQuery = useTeamMembersQuery(token);

  const categories = React.useMemo(
    () =>
      Array.isArray(categoriesQuery.data?.data)
        ? categoriesQuery.data.data
        : [],
    [categoriesQuery.data?.data],
  );
  const categoryByKey = React.useMemo(
    () => buildCategoryMap(categories),
    [categories],
  );
  const categoryOptions = React.useMemo(
    () =>
      categories.map((c) => ({
        label: c.title,
        value: c.key,
      })),
    [categories],
  );

  const teams = Array.isArray(teamsQuery.data?.data)
    ? teamsQuery.data.data
    : [];
  const members = Array.isArray(membersQuery.data?.data)
    ? membersQuery.data.data
    : [];
  const navigatorOptions = React.useMemo(
    () =>
      members.map((m) => ({
        label: m.name?.trim() || m.email || "User",
        value: m._id,
      })),
    [members],
  );

  const createMutation = useCreateTeamMutation();
  const updateMutation = useUpdateTeamMutation();
  const deleteMutation = useDeleteTeamMutation();

  const isLoading = categoriesQuery.isLoading || teamsQuery.isLoading;
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: emptyTeamFormValues,
  });

  const selectedCategoryKey = form.watch("category");
  const selectedCategory = categoryByKey.get(selectedCategoryKey);
  const showNavigatorField = needsNavigator(selectedCategory);
  const watchedNavigatorId = form.watch("navigator_id") ?? "";

  const isEdit = Boolean(editingTeam);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filteredTeams = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => {
      const catTitle =
        categoryByKey.get(t.category)?.title ??
        CATEGORY_LABELS[t.category as Category] ??
        t.category;
      const haystack = [
        t.team_name,
        String(t.team_number),
        t.category,
        catTitle,
        t.navigator_id?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [teams, search, categoryByKey]);

  React.useEffect(() => {
    if (!dialogOpen) return;
    if (!showNavigatorField) {
      form.setValue("navigator_id", "");
      return;
    }
    const current = form.getValues("navigator_id") ?? "";
    if (current && navigatorOptions.some((o) => o.value === current)) return;
    form.setValue("navigator_id", navigatorOptions[0]?.value ?? "");
  }, [dialogOpen, showNavigatorField, navigatorOptions, form]);

  const openNew = () => {
    setEditingTeam(null);
    form.reset({
      ...emptyTeamFormValues,
      category: categories[0]?.key ?? "",
      navigator_id: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    form.reset(teamToFormValues(team));
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
    const cat = categoryByKey.get(values.category);
    const requiresNavigator = needsNavigator(cat);
    const navigatorId = values.navigator_id?.trim() || "";

    if (requiresNavigator) {
      if (!navigatorId) {
        toast.error(
          members.length === 0
            ? "Add a user on the Users tab first, then select them as navigator."
            : "Select a navigator for this category.",
        );
        return;
      }
      if (!members.some((m) => m._id === navigatorId)) {
        toast.error("Selected navigator is invalid.");
        return;
      }
    }

    try {
      if (isEdit && editingTeam) {
        const { memberIds } = selectedMembersForTeamForm(editingTeam);
        const maxMembers = cat?.max_members ?? 0;
        let nextMembers = [...memberIds];
        let nextNavigator: string | null = null;

        if (requiresNavigator) {
          nextNavigator = navigatorId;
          if (!nextMembers.includes(navigatorId)) {
            if (nextMembers.length >= maxMembers) {
              toast.error(
                `This team already has the maximum of ${maxMembers} member${maxMembers === 1 ? "" : "s"}. Remove a member before assigning a different navigator.`,
              );
              return;
            }
            nextMembers = [...nextMembers, navigatorId];
          }
        }

        await updateMutation.mutateAsync({
          id: editingTeam._id,
          payload: buildUpdateTeamPayload(values, nextMembers, nextNavigator),
        });
        toast.success("Team updated.");
      } else {
        const memberIds = requiresNavigator ? [navigatorId] : [];
        await createMutation.mutateAsync(
          buildCreateTeamPayload(
            values,
            memberIds,
            requiresNavigator ? navigatorId : undefined,
          ),
        );
        toast.success(
          requiresNavigator
            ? "Team created with navigator. Add more members from the Users tab if needed."
            : "Team created. Add members from the Users tab.",
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
            className="shrink-0"
            onClick={openNew}
            disabled={!token || categories.length === 0}
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
                onClick={openNew}
                disabled={!token || categories.length === 0}
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
                <TeamsDataTableHead>Navigator</TeamsDataTableHead>
                <TeamsDataTableHead className="min-w-[96px] text-right">
                  Actions
                </TeamsDataTableHead>
              </TeamsDataTableHeaderRow>
            </TeamsDataTableHeader>
            <TeamsDataTableBody>
              {filteredTeams.map((t) => {
                const catTitle =
                  categoryByKey.get(t.category)?.title ??
                  CATEGORY_LABELS[t.category as Category] ??
                  t.category;
                const memberCount = t.member_ids?.length ?? 0;
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
                      {t.navigator_id?.name ? (
                        <span className="font-medium text-[#1F1838]">
                          {t.navigator_id.name}
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
            ? "Update this team’s name, number, category, and navigator when required."
            : "Create a team. Categories that require a navigator will ask you to pick one from your users."
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
          {categoryOptions.length > 0 ? (
            <Select
              control={form.control}
              name="category"
              label="Category"
              placeholder="Select category"
              required
              options={categoryOptions}
              className={fieldClassName}
            />
          ) : (
            <p className="text-sm text-[#6B7890]">No categories available.</p>
          )}

          {showNavigatorField ? (
            navigatorOptions.length > 0 ? (
              <div className="space-y-1.5">
                <Select
                  control={form.control}
                  name="navigator_id"
                  label="Navigator"
                  placeholder="Select navigator"
                  required
                  options={navigatorOptions}
                  className={fieldClassName}
                />
                <Typography variant="body-sm" className="text-[#6B7890]">
                  Required for this category. The navigator is also added as a
                  team member.
                </Typography>
              </div>
            ) : (
              <div className="rounded-md border border-[#F0DFA8] bg-[#FFF8E8] p-3">
                <Typography variant="body-sm" className="text-[#9A6B00]">
                  This category requires a navigator. Add a user on the Users
                  tab first, then create the team.
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
              disabled={
                isSaving ||
                categoryOptions.length === 0 ||
                (showNavigatorField &&
                  (navigatorOptions.length === 0 || !watchedNavigatorId))
              }
            >
              {isEdit ? "Update team" : "Save team"}
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
        "inline-flex items-center gap-1 rounded-full border border-[#B8E0C8] bg-[#EAF6EF] font-semibold uppercase tracking-wide text-[#1F6B43]",
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
