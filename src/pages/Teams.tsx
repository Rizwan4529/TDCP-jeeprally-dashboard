import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  CompassIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { AddUsersToTeamDialog } from "@/components/teams/AddUsersToTeamDialog";
import { toast } from "sonner";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TeamsDataTable,
  TeamsDataTableBody,
  TeamsDataTableHead,
  TeamsDataTableHeader,
  TeamsDataTableHeaderRow,
  TableCell,
  TableRow,
} from "@/components/teams/TeamsDataTable";
import { cn } from "@/lib/utils";
import {
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  Select,
} from "@/components/common/FormCommon";
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
import { fetchAuthToken, toDateOnlyInputValue } from "@/utils/helpers";
import {
  buildCategoryMap,
  needsNavigator,
  needsRosterMembers,
  validateTeamRoster,
} from "@/utils/team-roster-rules";
import {
  buildCreateTeamMemberPayload,
  buildUpdateTeamMemberPayload,
  emptyTeamMemberFormValues,
  teamMemberFormSchema,
  teamMemberToFormValues,
  type TeamMemberFormValues,
} from "@/utils/team-member-form";
import {
  buildCreateTeamPayload,
  buildUpdateTeamPayload,
  emptyTeamFormValues,
  selectedMembersForTeamForm,
  teamFormSchema,
  teamToFormValues,
  type TeamFormValues,
} from "@/utils/team-form";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const fieldClassName =
  "h-11 w-full rounded-[10px] border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1F1838]";

type PageTab = "roster" | "teams";

export default function TeamsPage() {
  return <TeamsScreen />;
}

function TeamsScreen() {
  const token = React.useMemo(() => fetchAuthToken(), []);
  const [pageTab, setPageTab] = React.useState<PageTab>("roster");

  return (
    <div className="space-y-6">
      <Card className={cn(surface, "rounded-[14px] px-6 py-6")}>
        <Typography
          as="h2"
          variant="h4"
          className="text-[28px] font-semibold leading-none text-[#1F1838]"
        >
          Teams
        </Typography>
        <Typography variant="body-sm" className="mt-2 text-[#6B7890]">
          Manage users and build teams for rally registration.
        </Typography>
        <div className="mt-4 flex w-full overflow-hidden rounded-[12px] border border-[#E8E8E8] md:inline-flex md:w-auto">
          <TabButton
            active={pageTab === "roster"}
            onClick={() => setPageTab("roster")}
          >
            Users
          </TabButton>
          <TabButton
            active={pageTab === "teams"}
            onClick={() => setPageTab("teams")}
          >
            My teams
          </TabButton>
        </div>
      </Card>

      {pageTab === "roster" ? (
        <RosterSection token={Boolean(token)} />
      ) : (
        <MyTeamsSection
          token={Boolean(token)}
          onGoToRoster={() => setPageTab("roster")}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 px-6 py-3 text-[14px] font-semibold transition-colors md:flex-none",
        active
          ? "bg-[#3FA565] text-white"
          : "bg-white text-[#6B7890] hover:bg-[#F9FAFD]",
      )}
    >
      {children}
    </button>
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

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [addToTeamOpen, setAddToTeamOpen] = React.useState(false);
  const [navigatorDialogOpen, setNavigatorDialogOpen] = React.useState(false);

  const selectedIdList = React.useMemo(() => [...selectedIds], [selectedIds]);
  const allSelected =
    members.length > 0 && members.every((m) => selectedIds.has(m._id));
  const someSelected = members.some((m) => selectedIds.has(m._id));

  const [panel, setPanel] = React.useState<"none" | "new" | "edit">("none");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const createMutation = useCreateTeamMemberMutation();
  const updateMutation = useUpdateTeamMemberMutation();
  const deleteMutation = useDeleteTeamMemberMutation();

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: emptyTeamMemberFormValues,
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openNew = () => {
    setPanel("new");
    setEditingId(null);
    form.reset(emptyTeamMemberFormValues);
  };

  const openEdit = (m: TeamMember) => {
    setPanel("edit");
    setEditingId(m._id);
    form.reset(teamMemberToFormValues(m));
  };

  const closePanel = () => {
    setPanel("none");
    setEditingId(null);
    form.reset(emptyTeamMemberFormValues);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelectAll = () => {
    if (allSelected) clearSelection();
    else setSelectedIds(new Set(members.map((m) => m._id)));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    if (editingId && ids.includes(editingId)) closePanel();
  };

  const onSubmit: SubmitHandler<TeamMemberFormValues> = async (values) => {
    try {
      if (panel === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: buildUpdateTeamMemberPayload(values),
        });
        toast.success("User updated.");
      } else {
        await createMutation.mutateAsync(buildCreateTeamMemberPayload(values));
        toast.success("User added.");
      }
      closePanel();
    } catch (err) {
      toast.error(getTeamMemberErrorMessage(err));
    }
  };

  return (
    <Card className={cn(surface, "rounded-[14px]")}>
      <div className="flex items-center justify-between gap-4 border-b border-[#E8E8E8] px-6 pb-2">
        <Typography
          as="h3"
          variant="label"
          className="text-[14px] font-bold tracking-wide text-[#1F1838]"
        >
          USERS
        </Typography>
        <Button
          type="button"
          variant="primary-outline"
          className="h-9 shrink-0 rounded-[10px] px-3"
          onClick={openNew}
          disabled={!token || panel !== "none"}
        >
          <PlusIcon className="size-4" />
          Add user
        </Button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {membersQuery.isLoading ? (
          <Typography variant="body" className="text-[#6B7890]">
            Loading users…
          </Typography>
        ) : membersQuery.isError ? (
          <Typography variant="body" className="text-destructive">
            Could not load users.
          </Typography>
        ) : panel === "none" && members.length === 0 ? (
          <div className="rounded-[12px] border border-[#E8E8E8] bg-[#F9FAFD] p-6 text-center">
            <Typography variant="body" className="text-[#6B7890]">
              No users yet. Add people you want on your teams.
            </Typography>
            <Button
              type="button"
              className="mt-4 bg-[#3FA565] hover:bg-[#369A5D]"
              onClick={openNew}
              disabled={!token}
            >
              <PlusIcon className="size-4" />
              Add first user
            </Button>
          </div>
        ) : panel === "none" ? (
          <>
            {selectedIdList.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-[#C8E6D4] bg-[#EAF6EF] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <Typography
                  variant="body-sm"
                  className="font-medium text-[#1F6B43]"
                >
                  {selectedIdList.length} user
                  {selectedIdList.length === 1 ? "" : "s"} selected
                </Typography>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary-outline"
                    size="sm"
                    className="rounded-[10px] border-[#3FA565] bg-white text-[#1F6B43]"
                    onClick={() => setAddToTeamOpen(true)}
                  >
                    <UserPlusIcon className="size-4" />
                    Add to team
                  </Button>
                  {selectedIdList.length === 1 ? (
                    <Button
                      type="button"
                      variant="primary-outline"
                      size="sm"
                      className="rounded-[10px] border-[#3FA565] bg-white text-[#1F6B43]"
                      onClick={() => setNavigatorDialogOpen(true)}
                    >
                      <CompassIcon className="size-4" />
                      Add as navigator
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="destructive-outline"
                    size="sm"
                    className="rounded-[10px]"
                    disabled={deleteMutation.isPending}
                    onClick={() => void handleBulkDelete()}
                  >
                    <Trash2Icon className="size-4" />
                    Delete selected
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-[10px] text-[#6B7890]"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            ) : null}

            <TeamsDataTable>
              <TeamsDataTableHeader>
                <TeamsDataTableHeaderRow>
                  <TeamsDataTableHead className="w-12">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all users"
                      className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-[#3FA565]"
                    />
                  </TeamsDataTableHead>
                  <TeamsDataTableHead>Name</TeamsDataTableHead>
                  <TeamsDataTableHead>Email</TeamsDataTableHead>
                  <TeamsDataTableHead>Contact</TeamsDataTableHead>
                  <TeamsDataTableHead>CNIC</TeamsDataTableHead>
                  <TeamsDataTableHead>Date of birth</TeamsDataTableHead>
                  <TeamsDataTableHead>Navigator</TeamsDataTableHead>
                  <TeamsDataTableHead>Teams</TeamsDataTableHead>
                  <TeamsDataTableHead className="text-right">
                    Actions
                  </TeamsDataTableHead>
                </TeamsDataTableHeaderRow>
              </TeamsDataTableHeader>
              <TeamsDataTableBody>
                {members.map((m) => {
                  const role = rosterRoles.get(m._id);
                  const isSelected = selectedIds.has(m._id);
                  return (
                    <TableRow
                      key={m._id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(isSelected && "bg-[#EAF6EF]/50")}
                    >
                      <TableCell className="px-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(m._id)}
                          aria-label={`Select ${m.name}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 font-semibold text-[#1F1838]">
                        {m.name}
                      </TableCell>
                      <TableCell className="px-4 text-[#6B7890]">
                        {m.email}
                      </TableCell>
                      <TableCell className="px-4 text-[#6B7890]">
                        {m.contact_number}
                      </TableCell>
                      <TableCell className="px-4 text-[#6B7890]">
                        {m.cnic}
                      </TableCell>
                      <TableCell className="px-4 text-[#6B7890]">
                        {toDateOnlyInputValue(m.date_of_birth) ||
                          m.date_of_birth ||
                          "—"}
                      </TableCell>
                      <TableCell className="px-4">
                        <NavigatorStatusCell role={role} />
                      </TableCell>
                      <TableCell className="px-4">
                        <UserTeamsCell role={role} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="primary-outline"
                            size="sm"
                            className="rounded-[10px]"
                            onClick={() => openEdit(m)}
                          >
                            <PencilIcon className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive-outline"
                            size="sm"
                            className="rounded-[10px]"
                            disabled={deleteMutation.isPending}
                            onClick={async () => {
                              try {
                                await deleteMutation.mutateAsync(m._id);
                                toast.success("User removed.");
                                if (editingId === m._id) closePanel();
                              } catch (err) {
                                toast.error(getTeamMemberErrorMessage(err));
                              }
                            }}
                          >
                            <Trash2Icon className="size-3.5" />
                            Delete
                          </Button>
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
        ) : null}

        {panel !== "none" ? (
          <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                control={form.control}
                name="name"
                label="Full name"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="email"
                label="Email"
                type="email"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="contact_number"
                label="Contact number"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="cnic"
                label="CNIC"
                className={fieldClassName}
              />
              <DatePicker
                control={form.control}
                name="date_of_birth"
                label="Date of birth"
                placeholder="YYYY-MM-DD"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="occupation"
                label="Occupation (optional)"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="location"
                label="Location (optional)"
                className={fieldClassName}
              />
            </div>
            <ImagePicker
              control={form.control}
              name="profile_image"
              label="Profile photo (optional)"
              accept="image/*"
              variant="compact"
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="primary-outline"
                onClick={closePanel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3FA565] hover:bg-[#369A5D]"
                disabled={isSaving}
              >
                {panel === "edit" ? "Update user" : "Save user"}
              </Button>
            </div>
          </FormCommon>
        ) : null}
      </div>
    </Card>
  );
}

function MyTeamsSection({
  token,
  onGoToRoster,
}: {
  token: boolean;
  onGoToRoster: () => void;
}) {
  const categoriesQuery = useCategoriesQuery(token);
  const membersQuery = useTeamMembersQuery(token);
  const teamsQuery = useMyTeamsQuery(token);

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

  const members = Array.isArray(membersQuery.data?.data)
    ? membersQuery.data.data
    : [];
  const teams = Array.isArray(teamsQuery.data?.data)
    ? teamsQuery.data.data
    : [];

  const [panel, setPanel] = React.useState<"none" | "new" | "edit">("none");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>(
    [],
  );
  const [navigatorId, setNavigatorId] = React.useState("");

  const createMutation = useCreateTeamMutation();
  const updateMutation = useUpdateTeamMutation();
  const deleteMutation = useDeleteTeamMutation();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: emptyTeamFormValues,
  });

  const watchedCategory = form.watch("category");
  const selectedCategory = categoryByKey.get(watchedCategory);
  const showRosterPicker = needsRosterMembers(selectedCategory);
  const showNavigatorPicker = needsNavigator(selectedCategory);

  const prevCategoryRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (panel === "none") {
      prevCategoryRef.current = undefined;
      return;
    }
    const prev = prevCategoryRef.current;
    prevCategoryRef.current = watchedCategory;
    if (prev === undefined || prev === watchedCategory) return;
    if (!showRosterPicker) {
      setSelectedMemberIds([]);
      setNavigatorId("");
    }
  }, [panel, watchedCategory, showRosterPicker]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openNew = () => {
    setPanel("new");
    setEditingId(null);
    setSelectedMemberIds([]);
    setNavigatorId("");
    form.reset({
      ...emptyTeamFormValues,
      category: categories[0]?.key ?? "",
    });
  };

  const openEdit = (t: Team) => {
    const { memberIds, navigatorId: navId } = selectedMembersForTeamForm(t);
    setPanel("edit");
    setEditingId(t._id);
    form.reset(teamToFormValues(t));
    setSelectedMemberIds(memberIds);
    setNavigatorId(navId);
  };

  const closePanel = () => {
    setPanel("none");
    setEditingId(null);
    setSelectedMemberIds([]);
    setNavigatorId("");
    form.reset(emptyTeamFormValues);
  };

  const toggleMember = (id: string) => {
    const max = selectedCategory?.max_members ?? 0;
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((x) => x !== id));
      if (navigatorId === id) setNavigatorId("");
      return;
    }
    if (max === 1) {
      setSelectedMemberIds([id]);
      if (showNavigatorPicker) setNavigatorId(id);
      return;
    }
    if (selectedMemberIds.length >= max) return;
    setSelectedMemberIds([...selectedMemberIds, id]);
  };

  const onSubmit: SubmitHandler<TeamFormValues> = async (values) => {
    const cat = categoryByKey.get(values.category);
    const validation = validateTeamRoster(
      cat,
      selectedMemberIds,
      showNavigatorPicker ? navigatorId : undefined,
    );
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    try {
      if (panel === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: buildUpdateTeamPayload(
            values,
            selectedMemberIds,
            showNavigatorPicker ? navigatorId : null,
          ),
        });
        toast.success("Team updated.");
      } else {
        await createMutation.mutateAsync(
          buildCreateTeamPayload(
            values,
            selectedMemberIds,
            showNavigatorPicker ? navigatorId : undefined,
          ),
        );
        toast.success("Team created.");
      }
      closePanel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save team.");
    }
  };

  const isLoading =
    categoriesQuery.isLoading || membersQuery.isLoading || teamsQuery.isLoading;

  return (
    <Card className={cn(surface, "rounded-[14px]")}>
      <div className="flex items-center justify-between gap-4 border-b border-[#E8E8E8] px-6 pb-2">
        <Typography
          as="h3"
          variant="label"
          className="text-[14px] font-bold tracking-wide text-[#1F1838]"
        >
          MY TEAMS
        </Typography>
        <Button
          type="button"
          variant="primary-outline"
          className="h-9 shrink-0 rounded-[10px] px-3"
          onClick={openNew}
          disabled={!token || panel !== "none" || categories.length === 0}
        >
          <PlusIcon className="size-4" />
          Add team
        </Button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {isLoading ? (
          <Typography variant="body" className="text-[#6B7890]">
            Loading teams…
          </Typography>
        ) : teamsQuery.isError ? (
          <Typography variant="body" className="text-destructive">
            Could not load teams.
          </Typography>
        ) : panel === "none" && teams.length === 0 ? (
          <div className="rounded-[12px] border border-[#E8E8E8] bg-[#F9FAFD] p-6 text-center">
            <Typography variant="body" className="text-[#6B7890]">
              No teams yet. Create a team to register for events.
            </Typography>
          </div>
        ) : panel === "none" ? (
          <TeamsDataTable>
            <TeamsDataTableHeader>
              <TeamsDataTableHeaderRow>
                <TeamsDataTableHead>Team name</TeamsDataTableHead>
                <TeamsDataTableHead>Number</TeamsDataTableHead>
                <TeamsDataTableHead>Category</TeamsDataTableHead>
                <TeamsDataTableHead>Members</TeamsDataTableHead>
                <TeamsDataTableHead>Navigator</TeamsDataTableHead>
                <TeamsDataTableHead className="text-right">
                  Actions
                </TeamsDataTableHead>
              </TeamsDataTableHeaderRow>
            </TeamsDataTableHeader>
            <TeamsDataTableBody>
              {teams.map((t) => {
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
                    <TableCell className="px-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="primary-outline"
                          size="sm"
                          className="rounded-[10px]"
                          onClick={() => openEdit(t)}
                        >
                          <PencilIcon className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive-outline"
                          size="sm"
                          className="rounded-[10px]"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            await deleteMutation.mutateAsync(t._id);
                            toast.success("Team deleted.");
                            if (editingId === t._id) closePanel();
                          }}
                        >
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TeamsDataTableBody>
          </TeamsDataTable>
        ) : null}

        {panel !== "none" ? (
          <FormCommon form={form} onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                control={form.control}
                name="team_name"
                label="Team name"
                className={fieldClassName}
              />
              <Input
                control={form.control}
                name="team_number"
                label="Team number"
                className={fieldClassName}
              />
              {categoryOptions.length > 0 ? (
                <Select
                  control={form.control}
                  name="category"
                  label="Category"
                  placeholder="Select category"
                  options={categoryOptions}
                  className={fieldClassName}
                />
              ) : (
                <Typography variant="body-sm" className="text-[#6B7890]">
                  Loading categories…
                </Typography>
              )}
            </div>

            {showRosterPicker ? (
              <div className="space-y-3">
                <Typography variant="body-sm" className="text-[#6B7890]">
                  Team members
                  {selectedCategory
                    ? ` (select up to ${selectedCategory.max_members})`
                    : ""}
                </Typography>
                {members.length === 0 ? (
                  <div className="rounded-[12px] border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                    <Typography variant="body-sm" className="text-[#6B7890]">
                      Add users first.
                    </Typography>
                    <Button
                      type="button"
                      variant="primary-outline"
                      className="mt-3"
                      onClick={onGoToRoster}
                    >
                      Go to Users
                    </Button>
                  </div>
                ) : (
                  <TeamsDataTable>
                    <TeamsDataTableHeader>
                      <TeamsDataTableHeaderRow>
                        <TeamsDataTableHead>Select</TeamsDataTableHead>
                        <TeamsDataTableHead>Name</TeamsDataTableHead>
                        <TeamsDataTableHead>Email</TeamsDataTableHead>
                        <TeamsDataTableHead>Navigator</TeamsDataTableHead>
                      </TeamsDataTableHeaderRow>
                    </TeamsDataTableHeader>
                    <TeamsDataTableBody>
                      {members.map((m) => {
                        const selected = selectedMemberIds.includes(m._id);
                        const isNav = navigatorId === m._id;
                        return (
                          <TableRow
                            key={m._id}
                            data-state={selected ? "selected" : undefined}
                            className={cn(
                              "cursor-pointer",
                              selected && "bg-[#EAF6EF]/60",
                            )}
                            onClick={() => toggleMember(m._id)}
                          >
                            <TableCell className="px-4">
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => toggleMember(m._id)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select ${m.name}`}
                              />
                            </TableCell>
                            <TableCell className="px-4 font-medium text-[#1F1838]">
                              {m.name}
                            </TableCell>
                            <TableCell className="px-4 text-[#6B7890]">
                              {m.email}
                            </TableCell>
                            <TableCell className="px-4">
                              {isNav ? (
                                <NavigatorBadge />
                              ) : selected && showNavigatorPicker ? (
                                <button
                                  type="button"
                                  className="text-[12px] font-medium text-[#3FA565] underline-offset-2 hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNavigatorId(m._id);
                                  }}
                                >
                                  Set as navigator
                                </button>
                              ) : (
                                <span className="text-[#9AA6C8]">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TeamsDataTableBody>
                  </TeamsDataTable>
                )}
              </div>
            ) : null}

            {showNavigatorPicker && navigatorId ? (
              <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#C8E6D4] bg-[#EAF6EF] px-4 py-3">
                <Typography variant="body-sm" className="text-[#1F6B43]">
                  Navigator for this team:
                </Typography>
                <NavigatorBadge />
                <span className="font-semibold text-[#1F6B43]">
                  {members.find((m) => m._id === navigatorId)?.name ?? "—"}
                </span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="primary-outline"
                onClick={closePanel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3FA565] hover:bg-[#369A5D]"
                disabled={isSaving}
              >
                {panel === "edit" ? "Update team" : "Save team"}
              </Button>
            </div>
          </FormCommon>
        ) : null}
      </div>
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

const MAX_VISIBLE_TEAMS = 2;

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

  const visible = teams.slice(0, MAX_VISIBLE_TEAMS);
  const hasMore = teams.length > MAX_VISIBLE_TEAMS;

  return (
    <span className="text-[#1F1838]" title={teams.join(", ")}>
      {visible.join(", ")}
      {hasMore ? ", …" : ""}
    </span>
  );
}
