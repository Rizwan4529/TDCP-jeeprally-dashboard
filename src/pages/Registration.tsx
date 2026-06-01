import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Checkbox,
  FormCommon,
  ImagePicker,
  Input,
  Select,
} from "@/components/common/FormCommon";
import {
  DashboardPanelEmptyState,
  EmptyState,
  PanelBlockSkeleton,
  RegistrationCategoryGridSkeleton,
} from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  CameraIcon,
  CarIcon,
  LayoutGridIcon,
  UserIcon,
  UsersRoundIcon,
} from "lucide-react";
import { EditDeleteIconActions } from "@/components/common/EditDeleteIconActions";
import { ActiveRallySummary } from "@/components/registration/ActiveRallySummary";
import { CategoryConsentContent } from "@/components/registration/CategoryConsentContent";
import { useMyTeamsQuery } from "@/hooks/api/use-teams";
import { useCategoriesQuery } from "@/hooks/api/use-categories";
import { useSessionUser } from "@/hooks/api/use-session-user";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useMyVehicleQuery,
  useUpdateVehicleMutation,
  useUploadVehicleImageMutation,
} from "@/hooks/api/use-vehicles";
import { getRallyChallenges } from "@/api/services/rally";
import { createRegistration } from "@/api/services/registrations";
import type { CreateRegistrationPayload } from "@/api/types/registrations";
import type { TeamCategory } from "@/api/types/teams";
import type { Vehicle } from "@/api/types/vehicles";
import { fetchAuthToken, toPublicFileUrl } from "@/utils/helpers";
import { resolveActiveEventId } from "@/utils/rally-event";
import { useActiveRallyQuery } from "@/hooks/api/use-active-rally";
import {
  buildCategorySelectOptions,
  buildCreateVehiclePayload,
  buildUpdateVehiclePayload,
  emptyVehicleFormValues,
  getVehicleCategoryKey,
  getVehicleCategoryTitle,
  vehicleFormFieldProps,
  VEHICLE_FIELD_LIMITS,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormValues,
} from "@/utils/vehicle-form";
import {
  CATEGORY,
  CATEGORY_LABELS,
  ROUTES,
  type Category,
} from "@/utils/constants";
import {
  categoryRegistrationHint,
  getCompetitorProfileGaps,
  getTeamMemberIds,
  isCompetitorProfileComplete,
  validateTeamForRegistration,
} from "@/utils/registration-eligibility";
import { buildCategoryMap, needsNavigator } from "@/utils/team-roster-rules";

type Step = 1 | 2 | 3 | 4;

type CategoryOption = {
  key: string;
  value: TeamCategory;
  hint: string;
  imageUrl?: string | null;
  rosterHint?: string;
};

const CATEGORY_HINTS: Record<TeamCategory, string> = {
  [CATEGORY.STOCK_PREPAID]: "Standard class, pre-approved setup.",
  [CATEGORY.QUAD_BIKE]: "ATV / quad entries.",
  [CATEGORY.DIRT_BIKE]: "2-wheel entries.",
  [CATEGORY.JEEP]: "Jeep entries.",
  [CATEGORY.TRUCK_RACE]: "Truck entries.",
};

const fieldClassName =
  "h-11 w-full rounded-md border-[#D7DAE1] bg-white px-4 text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-[#8B96AD]";

const consentSchema = z.object({
  acceptedTerms: z
    .boolean()
    .refine((v) => v === true, "You must accept the Terms & Conditions."),
});

type ConsentFormValues = z.infer<typeof consentSchema>;

function StepPill({
  isActive,
  isDone,
  label,
}: {
  isActive: boolean;
  isDone: boolean;
  label: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
        isActive
          ? "border-[#43AA72] bg-[#EAF6EF] text-[#1F6B43]"
          : isDone
            ? "border-[#D7DAE1] bg-white text-[#25314D]"
            : "border-[#E8E8E8] bg-[#F9FAFD] text-[#8B96AD]",
      )}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full text-[12px] font-semibold",
          isActive
            ? "bg-[#43AA72] text-white"
            : isDone
              ? "bg-[#25314D] text-white"
              : "bg-[#D7DAE1] text-white",
        )}
      >
        {isDone ? "✓" : "•"}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export default function RegistrationPage() {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<TeamCategory | null>(null);
  const [vehicleMode, setVehicleMode] = useState<"list" | "edit" | "new">(
    "list",
  );
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedRegistrationTeamId, setSelectedRegistrationTeamId] =
    useState("");
  const [selectedRegistrationVehicleId, setSelectedRegistrationVehicleId] =
    useState("");
  const [profileGateVisible, setProfileGateVisible] = useState(false);

  const token = useMemo(() => fetchAuthToken(), []);
  const { data: sessionUser } = useSessionUser();
  const profileGaps = useMemo(
    () => (sessionUser ? getCompetitorProfileGaps(sessionUser) : []),
    [sessionUser],
  );
  const profileComplete = isCompetitorProfileComplete(sessionUser ?? null);
  const categoriesQuery = useCategoriesQuery(Boolean(token));
  const categoryByKey = useMemo(
    () => buildCategoryMap(categoriesQuery.data?.data ?? []),
    [categoriesQuery.data?.data],
  );
  const categoryRecord = category ? categoryByKey.get(category) : undefined;
  const requiresNavigator = needsNavigator(categoryRecord);
  const categoryConsentHtml = categoryRecord?.consent?.trim() ?? "";

  const categoryOptions = useMemo((): CategoryOption[] => {
    const fromApi = categoriesQuery.data?.data;
    if (!fromApi?.length) return [];
    return fromApi.map((c) => ({
      key: c.title,
      value: c.key as TeamCategory,
      hint:
        c.description?.trim() || CATEGORY_HINTS[c.key as TeamCategory] || "",
      imageUrl: toPublicFileUrl(c.image ?? null),
      rosterHint: categoryRegistrationHint(c),
    }));
  }, [categoriesQuery.data?.data]);

  const vehicleCategoryOptions = useMemo(
    () => buildCategorySelectOptions(categoriesQuery.data?.data),
    [categoriesQuery.data?.data],
  );

  const categoriesLoading = categoriesQuery.isLoading;
  const categoriesReady =
    !categoriesLoading &&
    !categoriesQuery.isError &&
    categoryOptions.length > 0;

  const canQueryTeam = Boolean(token) && step >= 2;
  const canQueryVehicle = Boolean(token) && step >= 3;

  const myTeamQuery = useMyTeamsQuery(canQueryTeam);
  const teams = Array.isArray(myTeamQuery.data?.data)
    ? myTeamQuery.data.data
    : [];

  const isVehicleStep = step === 3;

  const defaultVehicleFormValues = useMemo((): VehicleFormValues => {
    return {
      ...emptyVehicleFormValues,
      category_id: categoryRecord?._id ?? "",
    };
  }, [categoryRecord?._id]);

  const activeRallyQuery = useActiveRallyQuery(Boolean(token));
  const activeRally = activeRallyQuery.data?.data ?? null;
  const activeRallyEventId = resolveActiveEventId(activeRally);

  const teamsForCategory = useMemo(() => {
    if (!category) return [];
    return teams.filter((t) => t.category === category);
  }, [teams, category]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t._id === selectedRegistrationTeamId) ?? null,
    [teams, selectedRegistrationTeamId],
  );

  const selectedTeamValidation = useMemo(() => {
    if (!selectedTeam || !categoryRecord) return null;
    return validateTeamForRegistration(
      categoryRecord,
      getTeamMemberIds(selectedTeam),
      selectedTeam.navigator_id?._id,
    );
  }, [selectedTeam, categoryRecord]);

  const canContinueStep2 = Boolean(
    selectedRegistrationTeamId && selectedTeamValidation?.ok === true,
  );

  const handleSelectRegistrationTeam = (teamId: string) => {
    setSelectedRegistrationTeamId(teamId);
  };

  const myVehicleQuery = useMyVehicleQuery(canQueryVehicle);
  const vehicles = Array.isArray(myVehicleQuery.data?.data)
    ? myVehicleQuery.data.data
    : [];

  const vehiclesForRegistration = useMemo(() => {
    if (!category || !selectedRegistrationTeamId) return [];
    return vehicles.filter(
      (v) =>
        getVehicleCategoryKey(v) === category &&
        (!v.team_id || v.team_id === selectedRegistrationTeamId),
    );
  }, [vehicles, category, selectedRegistrationTeamId]);

  const editingVehicle =
    vehicleMode === "edit" && editingVehicleId
      ? (vehicles.find((v) => v._id === editingVehicleId) ?? null)
      : null;

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyVehicleFormValues,
    values:
      vehicleMode === "edit" && editingVehicle
        ? vehicleToFormValues(editingVehicle)
        : undefined,
  });

  const createVehicleMutation = useCreateVehicleMutation();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const deleteVehicleMutation = useDeleteVehicleMutation();
  const uploadImageMutation = useUploadVehicleImageMutation();

  const isSavingVehicle =
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    uploadImageMutation.isPending;
  const vehicleError =
    createVehicleMutation.error ??
    updateVehicleMutation.error ??
    deleteVehicleMutation.error ??
    uploadImageMutation.error ??
    null;

  const onSubmitVehicle: SubmitHandler<VehicleFormValues> = async (values) => {
    const imageFile =
      values.vehicleImage instanceof File ? values.vehicleImage : null;

    if (vehicleMode === "edit" && editingVehicleId) {
      await updateVehicleMutation.mutateAsync({
        id: editingVehicleId,
        payload: buildUpdateVehiclePayload(values),
      });
      if (imageFile) {
        await uploadImageMutation.mutateAsync({
          vehicleId: editingVehicleId,
          file: imageFile,
        });
      }
      setVehicleMode("list");
      setEditingVehicleId(null);
      return;
    }
    const created = await createVehicleMutation.mutateAsync(
      buildCreateVehiclePayload(values),
    );
    const newId = created.data?._id;
    if (newId) setSelectedRegistrationVehicleId(newId);
    if (imageFile && newId) {
      await uploadImageMutation.mutateAsync({
        vehicleId: newId,
        file: imageFile,
      });
    }
    setVehicleMode("list");
    setEditingVehicleId(null);
  };

  const registrationSummary = useMemo(() => {
    const team =
      teams.find((t) => t._id === selectedRegistrationTeamId) ?? null;
    const vehicle =
      vehicles.find((v) => v._id === selectedRegistrationVehicleId) ?? null;
    const navigatorName = team?.navigator_id?.name ?? null;
    return { team, vehicle, navigatorName };
  }, [
    teams,
    vehicles,
    selectedRegistrationTeamId,
    selectedRegistrationVehicleId,
  ]);

  useEffect(() => {
    if (!category) {
      setSelectedRegistrationTeamId("");
      setSelectedRegistrationVehicleId("");
    }
  }, [category]);

  useEffect(() => {
    if (step === 1) {
      setProfileGateVisible(false);
    }
  }, [step, category]);

  useEffect(() => {
    if (!selectedRegistrationTeamId) return;
    if (!teamsForCategory.some((t) => t._id === selectedRegistrationTeamId)) {
      setSelectedRegistrationTeamId("");
    }
  }, [teamsForCategory, selectedRegistrationTeamId]);

  useEffect(() => {
    if (!selectedRegistrationVehicleId || !category) return;
    if (
      !vehiclesForRegistration.some(
        (v) => v._id === selectedRegistrationVehicleId,
      )
    ) {
      setSelectedRegistrationVehicleId("");
    }
  }, [vehiclesForRegistration, selectedRegistrationVehicleId, category]);

  const consentForm = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: { acceptedTerms: false },
  });

  useEffect(() => {
    consentForm.setValue("acceptedTerms", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset acceptance when category changes
  }, [category]);

  const [isSubmittingRegistration, setIsSubmittingRegistration] =
    useState(false);

  const onSubmitConsent: SubmitHandler<ConsentFormValues> = async () => {
    if (!category || !categoryRecord?._id) {
      toast.error("Select a category to continue.");
      return;
    }

    if (
      !activeRallyEventId ||
      !selectedRegistrationTeamId ||
      !selectedRegistrationVehicleId
    ) {
      toast.error(
        activeRallyQuery.isError
          ? "Active rally could not be loaded."
          : "Complete team and vehicle in the steps above.",
      );
      return;
    }

    const selectedTeam = teams.find(
      (t) => t._id === selectedRegistrationTeamId,
    );
    if (!selectedTeam || selectedTeam.category !== category) {
      toast.error("Selected team must match your registration category.");
      return;
    }

    const selectedVehicle = vehicles.find(
      (v) => v._id === selectedRegistrationVehicleId,
    );
    if (
      !selectedVehicle ||
      getVehicleCategoryKey(selectedVehicle) !== category
    ) {
      toast.error("Selected vehicle must match your registration category.");
      return;
    }

    const memberIds = getTeamMemberIds(selectedTeam);
    const rosterValidation = validateTeamForRegistration(
      categoryRecord,
      memberIds,
      selectedTeam.navigator_id?._id,
    );
    if (!rosterValidation.ok) {
      toast.error(rosterValidation.message);
      return;
    }

    setIsSubmittingRegistration(true);
    try {
      let challengeId: string | undefined;
      try {
        const challenges = await getRallyChallenges(activeRallyEventId);
        const list = challenges?.data ?? [];
        const match =
          list.find((c) => c.category === categoryRecord._id) ??
          list.find((c) => c.category === category);
        if (match?._id) challengeId = match._id;
      } catch {
        // challenge_id is optional
      }

      const payload: CreateRegistrationPayload = {
        team_id: selectedRegistrationTeamId,
        event_id: activeRallyEventId,
        category_id: categoryRecord._id,
        vehicle_id: selectedRegistrationVehicleId,
      };
      if (challengeId) payload.challenge_id = challengeId;

      await createRegistration(payload);
      toast.success("Registration submitted.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration could not be submitted.";
      toast.error(msg);
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="rounded-md border border-[#E8E8E8] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Typography
              as="h2"
              variant="h5"
              className="text-[18px] font-semibold uppercase leading-none text-[#4A4A4A] sm:text-[20px]"
            >
              Registration
            </Typography>

            <div className="flex flex-wrap items-center gap-2">
              <StepPill
                isActive={step === 1}
                isDone={step > 1}
                label="Category"
              />
              <StepPill isActive={step === 2} isDone={step > 2} label="Team" />
              <StepPill
                isActive={isVehicleStep}
                isDone={step > 3}
                label="Vehicle"
              />
              <StepPill isActive={step === 4} isDone={false} label="Consent" />
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          {step === 1 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <Typography
                  as="h3"
                  variant="body-lg"
                  className="text-[18px] leading-none text-[#4A4A4A] sm:text-[20px]"
                >
                  Choose a category
                </Typography>
                <Typography variant="body-sm" className="text-[#8B96AD]">
                  This helps us load the right registration flow for you.
                </Typography>
              </div>

              <ActiveRallySummary
                event={activeRally}
                isLoading={activeRallyQuery.isLoading}
                isError={activeRallyQuery.isError}
                errorMessage={activeRallyQuery.error?.message}
                variant="card"
              />

              {categoriesLoading ? (
                <RegistrationCategoryGridSkeleton count={6} />
              ) : categoriesQuery.isError ? (
                <DashboardPanelEmptyState
                  icon={AlertCircleIcon}
                  title="Could not load categories"
                  description={
                    categoriesQuery.error?.message ??
                    "Registration categories could not be loaded. Refresh the page or try again later."
                  }
                  variant="error"
                />
              ) : categoryOptions.length === 0 ? (
                <DashboardPanelEmptyState
                  icon={LayoutGridIcon}
                  title="No categories available"
                  description="There are no registration categories to choose from right now. Please check back later or contact support."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryOptions.map((c) => {
                    const isActive = c.value === category;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCategory(c.value);
                          setProfileGateVisible(false);
                        }}
                        className={cn(
                          "group overflow-hidden rounded-md border text-left transition-colors",
                          isActive
                            ? "border-[#43AA72] bg-[#EAF6EF]"
                            : "border-[#E8E8E8] bg-white hover:bg-[#F9FAFD]",
                        )}
                      >
                        {c.imageUrl ? (
                          <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E8E8E8] bg-[#F3F4F8]">
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="flex items-start justify-between gap-3 p-4">
                          <div className="min-w-0 space-y-1">
                            <Typography
                              as="div"
                              variant="body-lg"
                              className={cn(
                                "text-[16px] font-semibold leading-none",
                                isActive ? "text-[#1F6B43]" : "text-[#25314D]",
                              )}
                            >
                              {c.key}
                            </Typography>
                            {c.rosterHint ? (
                              <Typography
                                variant="body-sm"
                                className={cn(
                                  "text-[12px] font-medium leading-[1.45]",
                                  isActive
                                    ? "text-[#1F6B43]/90"
                                    : "text-[#6B7890]",
                                )}
                              >
                                {c.rosterHint}
                              </Typography>
                            ) : null}
                            {c.hint ? (
                              <Typography
                                variant="body-sm"
                                className={cn(
                                  "text-[14px] leading-[1.45]",
                                  isActive
                                    ? "text-[#1F6B43]"
                                    : "text-[#8B96AD]",
                                )}
                              >
                                {c.hint}
                              </Typography>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[12px] font-semibold",
                              isActive
                                ? "border-[#43AA72] bg-[#43AA72] text-white"
                                : "border-[#D7DAE1] bg-white text-transparent group-hover:text-[#D7DAE1]",
                            )}
                          >
                            ✓
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {profileGateVisible && !profileComplete ? (
                <div className="space-y-3">
                  <DashboardPanelEmptyState
                    icon={UserIcon}
                    title="Complete your profile first"
                    description="Update your profile with all required personal info and documents before you can register for a rally."
                    variant="error"
                  />
                  {profileGaps.length > 0 ? (
                    <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] px-4 py-3">
                      <Typography
                        variant="body-sm"
                        className="font-medium text-[#8B2B2B]"
                      >
                        Missing: {profileGaps.join(", ")}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="mt-2 text-[#B45353]"
                      >
                        <Link
                          to={ROUTES.PROFILE}
                          className="font-semibold text-[#1F6B43] underline"
                        >
                          Go to Profile
                        </Link>{" "}
                        to complete these fields.
                      </Typography>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    type="button"
                    variant="destructive-outline"
                    className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:text-[17px]"
                    onClick={() => {
                      setCategory(null);
                      setProfileGateVisible(false);
                    }}
                  >
                    <Typography as="span" variant="body" color="inherit">
                      Reset
                    </Typography>
                  </Button>
                  <Button
                    type="button"
                    className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto  sm:px-8 sm:text-[17px]"
                    disabled={!category || !categoriesReady}
                    onClick={() => {
                      if (!categoriesReady) {
                        toast.error(
                          categoriesQuery.isError
                            ? "Categories could not be loaded."
                            : "Select a category to continue.",
                        );
                        return;
                      }
                      if (!profileComplete) {
                        setProfileGateVisible(true);
                        toast.error(
                          "Complete your profile before continuing registration.",
                        );
                        return;
                      }
                      setProfileGateVisible(false);
                      setStep(2);
                    }}
                  >
                    <Typography as="span" variant="body" color="inherit">
                      Continue
                    </Typography>
                  </Button>
                </div>

                {profileComplete ? (
                  <Typography variant="body-sm" className="text-[#6B7890]">
                    Profile complete.{" "}
                    <Link
                      to={ROUTES.PROFILE}
                      className="font-medium text-[#1F6B43] underline"
                    >
                      View profile
                    </Link>
                  </Typography>
                ) : (
                  <Typography variant="body-sm" className="text-[#6B7890]">
                    <Link
                      to={ROUTES.PROFILE}
                      className="font-medium text-[#1F6B43] underline"
                    >
                      Update profile
                    </Link>{" "}
                    to complete required personal info and documents.
                  </Typography>
                )}
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <Typography
                    as="h3"
                    variant="body-lg"
                    className="text-[18px] leading-none text-[#4A4A4A] sm:text-[20px]"
                  >
                    Select team
                  </Typography>
                  <Typography variant="body-sm" className="text-[#8B96AD]">
                    Choose a team for this category. Manage teams and users on
                    the{" "}
                    <Link
                      to={ROUTES.TEAMS}
                      className="font-medium text-[#1F6B43] underline"
                    >
                      Teams
                    </Link>{" "}
                    page.
                  </Typography>
                </div>

                <Button
                  type="button"
                  variant="primary-outline"
                  className="h-[44px] w-full rounded-md px-6 text-[15px] font-medium sm:w-auto"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </div>

              {!token ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <Typography variant="body" className="text-[#8B2B2B]">
                    You’re not logged in. Please login first so we can fetch
                    your teams.
                  </Typography>
                </div>
              ) : myTeamQuery.isLoading ? (
                <PanelBlockSkeleton lines={3} />
              ) : myTeamQuery.isError ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <Typography variant="body" className="text-[#8B2B2B]">
                    Could not fetch your teams.
                  </Typography>
                </div>
              ) : teamsForCategory.length === 0 ? (
                <EmptyState
                  icon={UsersRoundIcon}
                  title="No team for this category"
                  description={
                    <>
                      Create a team on the Teams page, then return here to
                      continue registration.{" "}
                      <Link
                        to={ROUTES.TEAMS}
                        className="font-medium text-[#1F6B43] underline"
                      >
                        Go to Teams
                      </Link>
                    </>
                  }
                  size="compact"
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teamsForCategory.map((t) => {
                    const isSel = selectedRegistrationTeamId === t._id;
                    const memberNames =
                      t.member_ids?.length > 0
                        ? t.member_ids.map((m) => m.name).join(", ")
                        : "—";
                    const navName = t.navigator_id?.name ?? "—";
                    const teamValidation = categoryRecord
                      ? validateTeamForRegistration(
                          categoryRecord,
                          getTeamMemberIds(t),
                          t.navigator_id?._id,
                        )
                      : null;
                    const isInvalid =
                      teamValidation != null && !teamValidation.ok;
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => handleSelectRegistrationTeam(t._id)}
                        className={cn(
                          "rounded-md border p-4 text-left transition-colors",
                          isSel
                            ? isInvalid
                              ? "border-[#E04444] bg-[#FFF5F5]"
                              : "border-[#43AA72] bg-[#EAF6EF]"
                            : isInvalid
                              ? "border-[#F2D6D6] bg-[#FFFBFB] hover:bg-[#FFF5F5]"
                              : "border-[#E8E8E8] bg-white hover:bg-[#F9FAFD]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 space-y-1">
                            <Typography
                              as="div"
                              variant="body-lg"
                              className={cn(
                                "text-[16px] font-semibold leading-none",
                                isSel ? "text-[#1F6B43]" : "text-[#25314D]",
                              )}
                            >
                              {t.team_name}
                            </Typography>
                            <Typography
                              variant="body-sm"
                              className={cn(
                                "leading-[1.45]",
                                isSel ? "text-[#1F6B43]" : "text-[#8B96AD]",
                              )}
                            >
                              {categoryRecord?.title ??
                                CATEGORY_LABELS[t.category as Category] ??
                                t.category}{" "}
                              · #{t.team_number}
                            </Typography>
                            <Typography
                              variant="body-sm"
                              className={cn(
                                "text-[13px]",
                                isSel ? "text-[#1F6B43]/80" : "text-[#8B96AD]",
                              )}
                            >
                              Members: {memberNames}
                            </Typography>
                            <Typography
                              variant="body-sm"
                              className={cn(
                                "text-[13px]",
                                isSel ? "text-[#1F6B43]/80" : "text-[#8B96AD]",
                              )}
                            >
                              Navigator: {navName}
                            </Typography>
                            {isInvalid && teamValidation ? (
                              <Typography
                                variant="body-sm"
                                className="mt-2 text-[13px] text-[#B91C1C]"
                              >
                                {teamValidation.message}
                              </Typography>
                            ) : null}
                          </div>
                          <span
                            className={cn(
                              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[12px] font-semibold",
                              isSel
                                ? "border-[#43AA72] bg-[#43AA72] text-white"
                                : "border-[#D7DAE1] bg-white text-transparent",
                            )}
                            aria-hidden
                          >
                            ✓
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedTeam &&
              selectedTeamValidation &&
              !selectedTeamValidation.ok ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <div className="flex gap-3">
                    <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-[#B91C1C]" />
                    <div>
                      <Typography
                        variant="body"
                        className="font-medium text-[#8B2B2B]"
                      >
                        Team not ready for registration
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="mt-1 text-[#B45353]"
                      >
                        {selectedTeamValidation.message}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="mt-2 text-[#B45353]"
                      >
                        <Link
                          to={ROUTES.TEAMS}
                          className="font-semibold text-[#1F6B43] underline"
                        >
                          Go to Teams
                        </Link>{" "}
                        to add members or assign a navigator. Team members are
                        included automatically when you register.
                      </Typography>
                    </div>
                  </div>
                </div>
              ) : null}

              {teamsForCategory.length > 0 ? (
                <div className="flex flex-col items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    type="button"
                    className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:px-8 sm:text-[17px]"
                    disabled={!canContinueStep2}
                    onClick={() => {
                      if (!canContinueStep2) {
                        if (
                          selectedTeamValidation &&
                          !selectedTeamValidation.ok
                        ) {
                          toast.error(selectedTeamValidation.message);
                        }
                        return;
                      }
                      setStep(3);
                    }}
                  >
                    <Typography as="span" variant="body" color="inherit">
                      Continue
                    </Typography>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : step === 4 ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <Typography
                    as="h3"
                    variant="body-lg"
                    className="text-[18px] leading-none text-[#4A4A4A] sm:text-[20px]"
                  >
                    Consent
                  </Typography>
                  <Typography variant="body-sm" className="text-[#8B96AD]">
                    Please review and accept the undertaking to submit your
                    registration.
                  </Typography>
                </div>

                <Button
                  type="button"
                  variant="primary-outline"
                  className="h-[44px] w-full rounded-md px-6 text-[15px] font-medium sm:w-auto"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
              </div>

              <FormCommon
                form={consentForm}
                onSubmit={onSubmitConsent}
                className="space-y-5"
              >
                <div className="rounded-md border border-[#E8E8E8] bg-white p-4 sm:p-6">
                  <Typography
                    variant="body-lg"
                    className="font-semibold text-[#25314D]"
                  >
                    Registration details
                  </Typography>
                  <Typography variant="body-sm" className="mt-1 text-[#8B96AD]">
                    Review the active rally and your selections, then accept the
                    category undertaking below.
                  </Typography>

                  {category ? (
                    <Typography
                      variant="body-sm"
                      className="mt-2 text-[#25314D]"
                    >
                      Category:{" "}
                      <span className="font-semibold">
                        {categoryRecord?.title ??
                          CATEGORY_LABELS[category as Category] ??
                          category}
                      </span>
                    </Typography>
                  ) : null}

                  <div className="mt-4 space-y-4">
                    <ActiveRallySummary
                      event={activeRally}
                      isLoading={activeRallyQuery.isLoading}
                      isError={activeRallyQuery.isError}
                      errorMessage={activeRallyQuery.error?.message}
                      variant="inline"
                    />

                    <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                      <Typography variant="label" className="text-[#6B7890]">
                        Your selections
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="mt-2 text-[#25314D]"
                      >
                        Team:{" "}
                        <span className="font-semibold">
                          {registrationSummary.team
                            ? `${registrationSummary.team.team_name} · #${registrationSummary.team.team_number}`
                            : "—"}
                        </span>
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="mt-1 text-[#25314D]"
                      >
                        Vehicle:{" "}
                        <span className="font-semibold">
                          {registrationSummary.vehicle
                            ? `${registrationSummary.vehicle.model} · ${registrationSummary.vehicle.engine}`
                            : "—"}
                        </span>
                      </Typography>
                      {requiresNavigator ? (
                        <Typography
                          variant="body-sm"
                          className="mt-1 text-[#25314D]"
                        >
                          Navigator:{" "}
                          <span className="font-semibold">
                            {registrationSummary.navigatorName ?? "—"}
                          </span>
                        </Typography>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-[#F9FAFD] p-4 sm:p-6">
                  <Typography
                    variant="body-lg"
                    className="mb-3 font-semibold text-[#25314D]"
                  >
                    Category undertaking
                  </Typography>
                  <CategoryConsentContent html={categoryConsentHtml} />

                  <div className="pt-5">
                    <Checkbox
                      control={consentForm.control}
                      name={"acceptedTerms"}
                      disabled={!categoryConsentHtml}
                      label={
                        <span>
                          I have read and agree to the undertaking above for
                          this category.
                          <span className="text-[#E04444]"> *</span>
                        </span>
                      }
                      checkboxClassName="size-6 border-[#CED4DF] bg-white"
                      itemClassName="items-center"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    type="submit"
                    className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
                    disabled={
                      isSubmittingRegistration ||
                      !activeRallyEventId ||
                      !categoryConsentHtml ||
                      !selectedRegistrationTeamId ||
                      !selectedRegistrationVehicleId ||
                      !selectedTeamValidation?.ok ||
                      !teamsForCategory.some(
                        (t) => t._id === selectedRegistrationTeamId,
                      ) ||
                      !vehicles.some(
                        (v) => v._id === selectedRegistrationVehicleId,
                      )
                    }
                  >
                    <Typography as="span" variant="body" color="inherit">
                      {isSubmittingRegistration
                        ? "Submitting…"
                        : "Submit registration"}
                    </Typography>
                  </Button>
                </div>
              </FormCommon>
            </div>
          ) : null}
          {isVehicleStep ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <Typography
                    as="h3"
                    variant="body-lg"
                    className="text-[18px] leading-none text-[#4A4A4A] sm:text-[20px]"
                  >
                    Vehicle details
                  </Typography>
                  <Typography variant="body-sm" className="text-[#8B96AD]">
                    Select a vehicle for your category and team. Manage vehicles
                    on the{" "}
                    <Link
                      to={ROUTES.VEHICLE}
                      className="font-medium text-[#1F6B43] underline"
                    >
                      Vehicle
                    </Link>{" "}
                    page.
                  </Typography>
                </div>

                <Button
                  type="button"
                  variant="primary-outline"
                  className="h-[44px] w-full rounded-md px-6 text-[15px] font-medium sm:w-auto"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
              </div>

              {!token ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <Typography variant="body" className="text-[#8B2B2B]">
                    You’re not logged in. Please login first so we can fetch
                    your vehicle.
                  </Typography>
                </div>
              ) : myVehicleQuery.isLoading ? (
                <PanelBlockSkeleton lines={3} />
              ) : myVehicleQuery.isError ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <Typography variant="body" className="text-[#8B2B2B]">
                    Could not fetch your vehicles. You can still{" "}
                    <Link
                      to={ROUTES.VEHICLE}
                      className="font-medium text-[#1F6B43] underline"
                    >
                      add a vehicle
                    </Link>{" "}
                    on the Vehicle page.
                  </Typography>
                </div>
              ) : vehicleMode === "list" ? (
                vehiclesForRegistration.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vehiclesForRegistration.map((v: Vehicle) => {
                      const imgUrl = toPublicFileUrl(v.image);
                      const isSel = selectedRegistrationVehicleId === v._id;
                      return (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() =>
                            setSelectedRegistrationVehicleId(v._id)
                          }
                          className={cn(
                            "rounded-md border p-4 text-left transition-colors",
                            isSel
                              ? "border-[#43AA72] bg-[#EAF6EF]"
                              : "border-[#E8E8E8] bg-white hover:bg-[#F9FAFD]",
                          )}
                        >
                          <div className="flex gap-3">
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[#E8E8E8] bg-[#F9FAFD]">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-[10px] text-[#9AA6C8]">
                                  No photo
                                </div>
                              )}
                              <label
                                className={cn(
                                  "absolute bottom-0.5 right-0.5 flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#3FA565] text-white shadow-md",
                                  uploadImageMutation.isPending &&
                                    "pointer-events-none opacity-70",
                                )}
                                aria-label="Upload vehicle photo"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <CameraIcon className="size-3.5" aria-hidden />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadImageMutation.isPending}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      await uploadImageMutation.mutateAsync({
                                        vehicleId: v._id,
                                        file,
                                      });
                                      toast.success("Vehicle photo updated.");
                                    } catch (err) {
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Could not upload photo.",
                                      );
                                    }
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            </div>
                            <div className="min-w-0 flex-1">
                              <Typography
                                as="div"
                                variant="body-lg"
                                className={cn(
                                  "truncate text-[15px] font-semibold",
                                  isSel ? "text-[#1F6B43]" : "text-[#25314D]",
                                )}
                              >
                                {v.model}
                              </Typography>
                              <Typography
                                variant="body-sm"
                                className={cn(
                                  isSel ? "text-[#1F6B43]" : "text-[#8B96AD]",
                                )}
                              >
                                {getVehicleCategoryTitle(v)}
                                {v.class ? ` · ${v.class}` : ""}
                                {v.power != null ? ` · Power ${v.power}` : ""}
                              </Typography>
                              <div
                                className="mt-2"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                <EditDeleteIconActions
                                  editLabel="Edit vehicle"
                                  deleteLabel="Delete vehicle"
                                  onEdit={() => {
                                    setEditingVehicleId(v._id);
                                    setVehicleMode("edit");
                                    vehicleForm.reset(vehicleToFormValues(v));
                                  }}
                                  deleteDisabled={
                                    deleteVehicleMutation.isPending
                                  }
                                  onDelete={async () => {
                                    await deleteVehicleMutation.mutateAsync(
                                      v._id,
                                    );
                                    if (
                                      selectedRegistrationVehicleId === v._id
                                    ) {
                                      setSelectedRegistrationVehicleId("");
                                    }
                                    if (editingVehicleId === v._id) {
                                      setEditingVehicleId(null);
                                      setVehicleMode("list");
                                      vehicleForm.reset(
                                        defaultVehicleFormValues,
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <span
                              className={cn(
                                "mt-1 grid size-5 shrink-0 place-items-center self-start rounded-full border text-[12px] font-semibold",
                                isSel
                                  ? "border-[#43AA72] bg-[#43AA72] text-white"
                                  : "border-[#D7DAE1] bg-white text-transparent",
                              )}
                              aria-hidden
                            >
                              ✓
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : vehicles.length > 0 ? (
                  <EmptyState
                    icon={CarIcon}
                    title="No matching vehicle"
                    description={
                      <>
                        Add a vehicle that matches this category and team on the
                        Vehicle page, then return here.{" "}
                        <Link
                          to={ROUTES.VEHICLE}
                          className="font-medium text-[#1F6B43] underline"
                        >
                          Go to Vehicle
                        </Link>
                      </>
                    }
                    size="compact"
                  />
                ) : (
                  <EmptyState
                    icon={CarIcon}
                    title="No vehicles yet"
                    description={
                      <>
                        Add a vehicle on the Vehicle page, then return here to
                        continue registration.{" "}
                        <Link
                          to={ROUTES.VEHICLE}
                          className="font-medium text-[#1F6B43] underline"
                        >
                          Go to Vehicle
                        </Link>
                      </>
                    }
                    size="compact"
                  />
                )
              ) : null}

              {vehicleMode === "edit" && (
                <FormCommon
                  form={vehicleForm}
                  onSubmit={onSubmitVehicle}
                  className="space-y-5"
                >
                  <div className="rounded-md bg-[#F9FAFD] p-4 sm:p-6">
                    <div className="flex flex-col gap-4 border-b border-[#E8E8E8] pb-5 sm:flex-row sm:items-start sm:gap-8">
                      <ImagePicker
                        control={vehicleForm.control}
                        name="vehicleImage"
                        label="Vehicle photo"
                        description="Uploaded when you save."
                        variant="avatar"
                        disabled={isSavingVehicle}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-5 pt-5 lg:grid-cols-2">
                      <Input
                        control={vehicleForm.control}
                        name={"model"}
                        {...vehicleFormFieldProps("model")}
                        className={fieldClassName}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"engine"}
                        {...vehicleFormFieldProps("engine")}
                        className={fieldClassName}
                      />
                      <Select
                        control={vehicleForm.control}
                        name={"category_id"}
                        {...vehicleFormFieldProps("category")}
                        options={vehicleCategoryOptions}
                        className={fieldClassName}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"frame"}
                        {...vehicleFormFieldProps("frame")}
                        className={fieldClassName}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"power"}
                        {...vehicleFormFieldProps("power")}
                        className={fieldClassName}
                        type="number"
                        min={VEHICLE_FIELD_LIMITS.power.min}
                        max={VEHICLE_FIELD_LIMITS.power.max}
                        step={1}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"weight"}
                        {...vehicleFormFieldProps("weight")}
                        className={fieldClassName}
                        type="number"
                        min={VEHICLE_FIELD_LIMITS.weight.min}
                        max={VEHICLE_FIELD_LIMITS.weight.max}
                        step={1}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"length"}
                        {...vehicleFormFieldProps("length")}
                        className={fieldClassName}
                        type="number"
                        min={VEHICLE_FIELD_LIMITS.length.min}
                        max={VEHICLE_FIELD_LIMITS.length.max}
                        step={0.1}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"tank_capacity"}
                        {...vehicleFormFieldProps("tank_capacity")}
                        className={fieldClassName}
                        type="number"
                        min={VEHICLE_FIELD_LIMITS.tank_capacity.min}
                        max={VEHICLE_FIELD_LIMITS.tank_capacity.max}
                        step={1}
                      />
                      <Input
                        control={vehicleForm.control}
                        name={"class"}
                        {...vehicleFormFieldProps("class")}
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  {vehicleError && (
                    <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                      <Typography variant="body" className="text-[#8B2B2B]">
                        Could not save vehicle. Please try again.
                      </Typography>
                    </div>
                  )}

                  <div className="flex flex-col-reverse items-stretch justify-end gap-3 pb-2 sm:flex-row sm:items-center sm:gap-4">
                    <Button
                      type="button"
                      variant="destructive-outline"
                      className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
                      onClick={(e) => {
                        e.preventDefault();
                        setVehicleMode("list");
                        setEditingVehicleId(null);
                        vehicleForm.reset(defaultVehicleFormValues);
                      }}
                      disabled={isSavingVehicle}
                    >
                      <Typography as="span" variant="body" color="inherit">
                        Cancel
                      </Typography>
                    </Button>
                    <Button
                      type="submit"
                      className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
                      disabled={isSavingVehicle}
                    >
                      <Typography as="span" variant="body" color="inherit">
                        Update vehicle
                      </Typography>
                    </Button>
                  </div>
                </FormCommon>
              )}

              {vehiclesForRegistration.length > 0 && vehicleMode === "list" && (
                <div className="flex flex-col items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    type="button"
                    className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:px-8 sm:text-[17px]"
                    disabled={
                      !selectedRegistrationVehicleId ||
                      !vehiclesForRegistration.some(
                        (v) => v._id === selectedRegistrationVehicleId,
                      )
                    }
                    onClick={() => setStep(4)}
                  >
                    <Typography as="span" variant="body" color="inherit">
                      Continue
                    </Typography>
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/*
        ===========================
        OLD REGISTRATION PAGE CODE
        ===========================

        Per request: kept in-file (not deleted). Commented out.

        NOTE: This block is intentionally large.
      */}
      {/*
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Control,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
} from "react-hookform";

// (old code continues…)
      */}
    </div>
  );
}
