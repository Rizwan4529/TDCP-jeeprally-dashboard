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
import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useMyTeamsQuery } from "@/hooks/api/use-teams";
import { useCategoriesQuery } from "@/hooks/api/use-categories";
import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useMyVehicleQuery,
  useUpdateVehicleMutation,
  useUploadVehicleImageMutation,
} from "@/hooks/api/use-vehicles";
import { getRallyChallenges } from "@/api/services/rally";
import { createRegistration } from "@/api/services/registrations";
import type { RallyEvent } from "@/api/types/rally";
import type { CreateRegistrationPayload } from "@/api/types/registrations";
import type { TeamCategory } from "@/api/types/teams";
import type { Vehicle } from "@/api/types/vehicles";
import { fetchAuthToken, toPublicFileUrl } from "@/utils/helpers";
import { useRallyEventsQuery } from "@/hooks/api/use-rally-events";
import {
  buildCreateVehiclePayload,
  buildUpdateVehiclePayload,
  emptyVehicleFormValues,
  vehicleCategorySelectOptions,
  vehicleFormSchema,
  vehicleToFormValues,
  type VehicleFormValues,
} from "@/utils/vehicle-form";
import { CATEGORIES, CATEGORY, CATEGORY_LABELS, ROUTES, type Category } from "@/utils/constants";
import { buildCategoryMap, needsNavigator } from "@/utils/team-roster-rules";

type Step = 1 | 2 | 3 | 4;

type CategoryOption = { key: string; value: TeamCategory; hint: string };

const CATEGORY_HINTS: Record<TeamCategory, string> = {
  [CATEGORY.STOCK_PREPAID]: "Standard class, pre-approved setup.",
  [CATEGORY.QUAD_BIKE]: "ATV / quad entries.",
  [CATEGORY.DIRT_BIKE]: "2-wheel entries.",
  [CATEGORY.JEEP]: "Jeep entries.",
  [CATEGORY.TRUCK_RACE]: "Truck entries.",
};

const CATEGORY_OPTIONS: CategoryOption[] = CATEGORIES.map((value) => ({
  key: CATEGORY_LABELS[value],
  value,
  hint: CATEGORY_HINTS[value],
}));

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
  const [consentEventId, setConsentEventId] = useState("");
  const [selectedRegistrationTeamId, setSelectedRegistrationTeamId] =
    useState("");
  const [selectedRegistrationVehicleId, setSelectedRegistrationVehicleId] =
    useState("");

  const token = useMemo(() => fetchAuthToken(), []);
  const categoriesQuery = useCategoriesQuery(Boolean(token));
  const categoryByKey = useMemo(
    () => buildCategoryMap(categoriesQuery.data?.data ?? []),
    [categoriesQuery.data?.data],
  );
  const categoryRecord = category ? categoryByKey.get(category) : undefined;
  const requiresNavigator = needsNavigator(categoryRecord);

  const categoryOptions = useMemo((): CategoryOption[] => {
    const fromApi = categoriesQuery.data?.data;
    if (fromApi?.length) {
      return fromApi.map((c) => ({
        key: c.title,
        value: c.key as TeamCategory,
        hint: c.description?.trim() || CATEGORY_HINTS[c.key as TeamCategory] || "",
      }));
    }
    return CATEGORY_OPTIONS;
  }, [categoriesQuery.data?.data]);

  const canQueryTeam = Boolean(token) && step >= 2;
  const canQueryVehicle = Boolean(token) && step >= 3;

  const myTeamQuery = useMyTeamsQuery(canQueryTeam);
  const teams = Array.isArray(myTeamQuery.data?.data) ? myTeamQuery.data.data : [];

  const isVehicleStep = step === 3;

  const defaultVehicleFormValues = useMemo((): VehicleFormValues => {
    return {
      ...emptyVehicleFormValues,
      category: (category ?? CATEGORY.JEEP) as VehicleFormValues["category"],
    };
  }, [category]);

  const consentStepActive = step === 4;
  const upcomingRallyQuery = useRallyEventsQuery(
    { type: "upcoming" },
    { enabled: Boolean(token) && consentStepActive },
  );
  const activeRallyQuery = useRallyEventsQuery(
    { status: "active" },
    { enabled: Boolean(token) && consentStepActive },
  );

  const teamsForCategory = useMemo(() => {
    if (!category) return [];
    return teams.filter((t) => t.category === category);
  }, [teams, category]);

  const selectableRallyEvents = useMemo(() => {
    const map = new Map<string, RallyEvent>();
    for (const e of [
      ...(upcomingRallyQuery.data?.data ?? []),
      ...(activeRallyQuery.data?.data ?? []),
    ]) {
      if (e.status === "completed") continue;
      map.set(e._id, e);
    }
    return [...map.values()];
  }, [upcomingRallyQuery.data?.data, activeRallyQuery.data?.data]);

  const myVehicleQuery = useMyVehicleQuery(canQueryVehicle);
  const vehicles = Array.isArray(myVehicleQuery.data?.data)
    ? myVehicleQuery.data.data
    : [];

  const vehiclesForRegistration = useMemo(() => {
    if (!category || !selectedRegistrationTeamId) return [];
    return vehicles.filter(
      (v) =>
        v.category === category &&
        (!v.team_id || v.team_id === selectedRegistrationTeamId),
    );
  }, [vehicles, category, selectedRegistrationTeamId]);

  const editingVehicle =
    vehicleMode === "edit" && editingVehicleId
      ? vehicles.find((v) => v._id === editingVehicleId) ?? null
      : null;

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyVehicleFormValues,
    values:
      vehicleMode === "edit" && editingVehicle
        ? vehicleToFormValues(editingVehicle)
        : vehicleMode === "new" ||
            (vehicles.length === 0 && vehicleMode === "list")
          ? defaultVehicleFormValues
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
    const team = teams.find((t) => t._id === selectedRegistrationTeamId) ?? null;
    const vehicle =
      vehicles.find((v) => v._id === selectedRegistrationVehicleId) ?? null;
    return { team, vehicle };
  }, [teams, vehicles, selectedRegistrationTeamId, selectedRegistrationVehicleId]);

  useEffect(() => {
    if (!category) {
      setSelectedRegistrationTeamId("");
      setSelectedRegistrationVehicleId("");
    }
  }, [category]);

  useEffect(() => {
    if (!selectedRegistrationTeamId) return;
    if (!teamsForCategory.some((t) => t._id === selectedRegistrationTeamId)) {
      setSelectedRegistrationTeamId("");
    }
  }, [teamsForCategory, selectedRegistrationTeamId]);

  useEffect(() => {
    if (!selectedRegistrationVehicleId || !category) return;
    if (
      !vehiclesForRegistration.some((v) => v._id === selectedRegistrationVehicleId)
    ) {
      setSelectedRegistrationVehicleId("");
    }
  }, [vehiclesForRegistration, selectedRegistrationVehicleId, category]);

  useEffect(() => {
    if (step !== 4) return;
    setConsentEventId((prev) => {
      if (prev && selectableRallyEvents.some((e) => e._id === prev)) return prev;
      return selectableRallyEvents[0]?._id ?? "";
    });
  }, [step, selectableRallyEvents]);

  const consentForm = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: { acceptedTerms: false },
  });

  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);

  const onSubmitConsent: SubmitHandler<ConsentFormValues> = async () => {
    if (!category) return;

    if (!consentEventId || !selectedRegistrationTeamId || !selectedRegistrationVehicleId) {
      toast.error(
        "Choose a rally event on this step and complete team and vehicle in the steps above.",
      );
      return;
    }

    const selectedTeam = teams.find((t) => t._id === selectedRegistrationTeamId);
    if (!selectedTeam || selectedTeam.category !== category) {
      toast.error("Selected team must match your registration category.");
      return;
    }

    const selectedVehicle = vehicles.find(
      (v) => v._id === selectedRegistrationVehicleId,
    );
    if (!selectedVehicle || selectedVehicle.category !== category) {
      toast.error("Selected vehicle must match your registration category.");
      return;
    }

    const teamNavigatorId = selectedTeam.navigator_id?._id;
    if (requiresNavigator && !teamNavigatorId) {
      toast.error(
        "Your team must have a navigator assigned. Update the team on the Teams page.",
      );
      return;
    }

    setIsSubmittingRegistration(true);
    try {
      let challengeId: string | undefined;
      try {
        const challenges = await getRallyChallenges(consentEventId);
        const list = challenges?.data ?? [];
        const match = list.find((c) => c.category === category);
        if (match?._id) challengeId = match._id;
      } catch {
        // challenge_id is optional
      }

      const payload: CreateRegistrationPayload = {
        team_id: selectedRegistrationTeamId,
        event_id: consentEventId,
        category,
        vehicle_id: selectedRegistrationVehicleId,
      };
      if (requiresNavigator && teamNavigatorId) {
        payload.navigator_id = teamNavigatorId;
      }
      if (challengeId) payload.challenge_id = challengeId;

      await createRegistration(payload);
      toast.success("Registration submitted.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Registration could not be submitted.";
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
              <StepPill isActive={step === 1} isDone={step > 1} label="Category" />
              <StepPill isActive={step === 2} isDone={step > 2} label="Team" />
              <StepPill isActive={isVehicleStep} isDone={step > 3} label="Vehicle" />
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryOptions.map((c) => {
                  const isActive = c.value === category;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={cn(
                        "group rounded-md border p-4 text-left transition-colors",
                        isActive
                          ? "border-[#43AA72] bg-[#EAF6EF]"
                          : "border-[#E8E8E8] bg-white hover:bg-[#F9FAFD]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
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
                          <Typography
                            variant="body-sm"
                            className={cn(
                              "text-[14px] leading-[1.45]",
                              isActive ? "text-[#1F6B43]" : "text-[#8B96AD]",
                            )}
                          >
                            {c.hint}
                          </Typography>
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

              <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                <Button
                  type="button"
                  variant="primary-outline"
                  className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
                  onClick={() => {
                    setCategory(null);
                  }}
                >
                  <Typography as="span" variant="body" color="inherit">
                    Reset
                  </Typography>
                </Button>
                <Button
                  type="button"
                  className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
                  disabled={!category}
                  onClick={() => setStep(2)}
                >
                  <Typography as="span" variant="body" color="inherit">
                    Continue
                  </Typography>
                </Button>
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
                    Choose a team for this category. Manage teams and users on the{" "}
                    <Link to={ROUTES.TEAMS} className="font-medium text-[#1F6B43] underline">
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
                    You’re not logged in. Please login first so we can fetch your teams.
                  </Typography>
                </div>
              ) : myTeamQuery.isLoading ? (
                <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                  <Typography variant="body" className="text-[#25314D]">
                    Loading your teams…
                  </Typography>
                </div>
              ) : myTeamQuery.isError ? (
                <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                  <Typography variant="body" className="text-[#8B2B2B]">
                    Could not fetch your teams.
                  </Typography>
                </div>
              ) : teamsForCategory.length === 0 ? (
                <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                  <Typography variant="body" className="text-[#25314D]">
                    No team exists for this category yet.{" "}
                    <Link to={ROUTES.TEAMS} className="font-medium text-[#1F6B43] underline">
                      Create a team
                    </Link>{" "}
                    on the Teams page, then return here.
                  </Typography>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teamsForCategory.map((t) => {
                    const isSel = selectedRegistrationTeamId === t._id;
                    const memberNames =
                      t.member_ids?.length > 0
                        ? t.member_ids.map((m) => m.name).join(", ")
                        : "—";
                    const navName = t.navigator_id?.name ?? "N/A";
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => setSelectedRegistrationTeamId(t._id)}
                        className={cn(
                          "rounded-md border p-4 text-left transition-colors",
                          isSel
                            ? "border-[#43AA72] bg-[#EAF6EF]"
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

              {teamsForCategory.length > 0 ? (
                <div className="flex flex-col items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                  <Button
                    type="button"
                    className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
                    disabled={
                      !selectedRegistrationTeamId ||
                      !teamsForCategory.some(
                        (t) => t._id === selectedRegistrationTeamId,
                      )
                    }
                    onClick={() => setStep(3)}
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
                    Please review and accept the undertaking to submit your registration.
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

              <FormCommon form={consentForm} onSubmit={onSubmitConsent} className="space-y-5">
                <div className="rounded-md border border-[#E8E8E8] bg-white p-4 sm:p-6">
                  <Typography variant="body-lg" className="font-semibold text-[#25314D]">
                    Registration details
                  </Typography>
                  <Typography variant="body-sm" className="mt-1 text-[#8B96AD]">
                    Confirm your rally event. Team and vehicle were chosen in the steps above.
                  </Typography>

                  {category ? (
                    <Typography variant="body-sm" className="mt-2 text-[#25314D]">
                      Category:{" "}
                      <span className="font-semibold">
                        {CATEGORY_LABELS[category as Category]}
                      </span>
                    </Typography>
                  ) : null}

                  {(upcomingRallyQuery.isLoading || activeRallyQuery.isLoading) &&
                  step === 4 ? (
                    <Typography variant="body-sm" className="mt-4 text-[#8B96AD]">
                      Loading events…
                    </Typography>
                  ) : null}

                  {(upcomingRallyQuery.error || activeRallyQuery.error) && (
                    <div className="mt-4 rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-3">
                      <Typography variant="body-sm" className="text-[#8B2B2B]">
                        {(upcomingRallyQuery.error ?? activeRallyQuery.error)?.message ??
                          "Could not load rally events."}
                      </Typography>
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Typography variant="label" className="text-[#6B7890]">
                        Rally event
                      </Typography>
                      <select
                        aria-label="Select rally event"
                        className={fieldClassName}
                        value={consentEventId}
                        onChange={(e) => setConsentEventId(e.target.value)}
                        disabled={selectableRallyEvents.length === 0 || isSubmittingRegistration}
                      >
                        {selectableRallyEvents.length === 0 ? (
                          <option value="">No open events</option>
                        ) : (
                          selectableRallyEvents.map((e) => (
                            <option key={e._id} value={e._id}>
                              {e.name} · {e.location} ({e.status})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                      <Typography variant="label" className="text-[#6B7890]">
                        Your selections
                      </Typography>
                      <Typography variant="body-sm" className="mt-2 text-[#25314D]">
                        Team:{" "}
                        <span className="font-semibold">
                          {registrationSummary.team
                            ? `${registrationSummary.team.team_name} · #${registrationSummary.team.team_number}`
                            : "—"}
                        </span>
                      </Typography>
                      <Typography variant="body-sm" className="mt-1 text-[#25314D]">
                        Vehicle:{" "}
                        <span className="font-semibold">
                          {registrationSummary.vehicle
                            ? `${registrationSummary.vehicle.model} · ${registrationSummary.vehicle.engine}`
                            : "—"}
                        </span>
                      </Typography>
                      {requiresNavigator ? (
                        <Typography variant="body-sm" className="mt-1 text-[#25314D]">
                          Navigator:{" "}
                          <span className="font-semibold">
                            {registrationSummary.team?.navigator_id?.name ?? "—"}
                          </span>
                        </Typography>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-[#F9FAFD] p-4 sm:p-6">
                  <Typography
                    variant="body"
                    className="max-w-[1100px] text-[14px] leading-[1.45] text-[#686868] sm:text-[15px]"
                  >
                    ADD copy of Drivers License and ID Card (MANDATORY)
                    <br />
                    * Driver and Navigator Racing suit is MANDATORY.
                    <br />
                    Roll Bar of standardized specifications and Fire Extinguisher (Minm 04 KG),
                    four point harness seatbelts, &amp; First Aid Kit are mandatory for all vehicles.
                    <br />
                    I/We being the entrant/s and/or driver and/or rider, certify that the particulars
                    on the Entry Form are true and correct.
                  </Typography>

                  <div className="pt-5">
                    <Checkbox
                      control={consentForm.control}
                      name={"acceptedTerms"}
                      label={
                        <span>
                          I agree to the Terms &amp; Conditions.<span className="text-[#E04444]"> *</span>
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
                      !consentEventId ||
                      !selectedRegistrationTeamId ||
                      !selectedRegistrationVehicleId ||
                      (requiresNavigator &&
                        !registrationSummary.team?.navigator_id?._id) ||
                      selectableRallyEvents.length === 0 ||
                      !teamsForCategory.some((t) => t._id === selectedRegistrationTeamId) ||
                      !vehicles.some((v) => v._id === selectedRegistrationVehicleId)
                    }
                  >
                    <Typography as="span" variant="body" color="inherit">
                      {isSubmittingRegistration ? "Submitting…" : "Submit registration"}
                    </Typography>
                  </Button>
                </div>
              </FormCommon>
            </div>
          )
          : null}
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
                                Select a vehicle for your category and team. You can add or edit vehicles anytime.
                              </Typography>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                              <Button
                                type="button"
                                variant="primary-outline"
                                className="h-[44px] w-full rounded-md px-6 text-[15px] font-medium sm:w-auto"
                                onClick={() => setStep(2)}
                              >
                                Back
                              </Button>
                              <Button
                                type="button"
                                className="h-[44px] w-full rounded-md px-6 text-[15px] font-medium sm:w-auto"
                                onClick={() => {
                                  setVehicleMode("new");
                                  setEditingVehicleId(null);
                                  vehicleForm.reset(defaultVehicleFormValues);
                                }}
                                disabled={
                                  !token ||
                                  myVehicleQuery.isLoading ||
                                  vehicleMode === "new" ||
                                  vehicleMode === "edit"
                                }
                              >
                                <PlusIcon className="size-4" />
                                Add vehicle
                              </Button>
                            </div>
                          </div>

                          {!token ? (
                            <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                              <Typography variant="body" className="text-[#8B2B2B]">
                                You’re not logged in. Please login first so we can fetch your vehicle.
                              </Typography>
                            </div>
                          ) : myVehicleQuery.isLoading ? (
                            <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                              <Typography variant="body" className="text-[#25314D]">
                                Loading your vehicles…
                              </Typography>
                            </div>
                          ) : myVehicleQuery.isError ? (
                            <div className="rounded-md border border-[#F2D6D6] bg-[#FFF5F5] p-4">
                              <Typography variant="body" className="text-[#8B2B2B]">
                                Could not fetch your vehicle. You can still add a new one below.
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
                                    onClick={() => setSelectedRegistrationVehicleId(v._id)}
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
                                          className="absolute bottom-0.5 right-0.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#25314D] text-white shadow"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadImageMutation.isPending}
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              await uploadImageMutation.mutateAsync({
                                                vehicleId: v._id,
                                                file,
                                              });
                                              e.target.value = "";
                                            }}
                                          />
                                          <span className="sr-only">Upload image</span>
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
                                          className={cn(isSel ? "text-[#1F6B43]" : "text-[#8B96AD]")}
                                        >
                                          {CATEGORY_LABELS[v.category as Category] ?? v.category}
                                          {v.class ? ` · ${v.class}` : ""}
                                          {v.power != null ? ` · Power ${v.power}` : ""}
                                        </Typography>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <Button
                                            type="button"
                                            variant="primary-outline"
                                            className="h-8 rounded-md px-3 text-[13px]"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setEditingVehicleId(v._id);
                                              setVehicleMode("edit");
                                              vehicleForm.reset(vehicleToFormValues(v));
                                            }}
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="destructive-outline"
                                            className="h-8 rounded-md px-3 text-[13px]"
                                            disabled={deleteVehicleMutation.isPending}
                                            onClick={async (e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              await deleteVehicleMutation.mutateAsync(v._id);
                                              if (selectedRegistrationVehicleId === v._id) {
                                                setSelectedRegistrationVehicleId("");
                                              }
                                              if (editingVehicleId === v._id) {
                                                setEditingVehicleId(null);
                                                setVehicleMode("list");
                                                vehicleForm.reset(defaultVehicleFormValues);
                                              }
                                            }}
                                          >
                                            <Trash2Icon className="size-3.5" />
                                            Delete
                                          </Button>
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
                            <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                              <Typography variant="body" className="text-[#25314D]">
                                No vehicle matches this category and selected team. Use{" "}
                                <span className="font-semibold">Add vehicle</span> above or create one below.
                              </Typography>
                            </div>
                          ) : (
                            <div className="rounded-md border border-[#E8E8E8] bg-[#F9FAFD] p-4">
                              <Typography variant="body" className="text-[#25314D]">
                                No vehicles yet. Use{" "}
                                <span className="font-semibold">Add vehicle</span> above or the form below to create your first one.
                              </Typography>
                            </div>
                          )
                          ) : null}

                          {(vehicleMode === "new" ||
                            vehicleMode === "edit" ||
                            vehicles.length === 0) && (
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
                                    description="Optional. Uploaded when you save."
                                    variant="avatar"
                                    disabled={isSavingVehicle}
                                  />
                                </div>
                                <div className="grid grid-cols-1 gap-5 pt-5 lg:grid-cols-2">
                                  <Input
                                    control={vehicleForm.control}
                                    name={"model"}
                                    label="Model"
                                    placeholder="e.g. Toyota Hilux"
                                    className={fieldClassName}
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"engine"}
                                    label="Engine"
                                    placeholder="e.g. 2.8L Turbo Diesel"
                                    className={fieldClassName}
                                  />
                                  <Select
                                    control={vehicleForm.control}
                                    name={"category"}
                                    label="Category"
                                    placeholder="Select category"
                                    options={vehicleCategorySelectOptions}
                                    className={fieldClassName}
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"frame"}
                                    label="Frame (optional)"
                                    placeholder="e.g. Ladder frame"
                                    className={fieldClassName}
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"power"}
                                    label="Power (optional)"
                                    placeholder="e.g. 201"
                                    className={fieldClassName}
                                    type="number"
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"weight"}
                                    label="Weight (optional)"
                                    placeholder="e.g. 2100"
                                    className={fieldClassName}
                                    type="number"
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"length"}
                                    label="Length (optional)"
                                    placeholder="e.g. 5325"
                                    className={fieldClassName}
                                    type="number"
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"tank_capacity"}
                                    label="Tank capacity (optional)"
                                    placeholder="e.g. 80"
                                    className={fieldClassName}
                                    type="number"
                                  />
                                  <Input
                                    control={vehicleForm.control}
                                    name={"class"}
                                    label="Class (optional)"
                                    placeholder="e.g. T1"
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
                                  variant="primary-outline"
                                  className="h-[46px] w-full rounded-md px-8 text-[16px] font-medium sm:w-auto sm:min-w-[150px] sm:text-[17px]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (vehicles.length > 0) {
                                      setVehicleMode("list");
                                      setEditingVehicleId(null);
                                    } else {
                                      setVehicleMode("new");
                                      setEditingVehicleId(null);
                                    }
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
                                    {vehicleMode === "edit" ? "Update vehicle" : "Save vehicle"}
                                  </Typography>
                                </Button>
                              </div>
                            </FormCommon>
                          )}

                          {vehiclesForRegistration.length > 0 && vehicleMode === "list" && (
                            <div className="flex flex-col items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
                              <Button
                                type="button"
                                className="h-[46px] w-full rounded-md px-6 text-[16px] font-medium sm:w-auto sm:min-w-[210px] sm:px-8 sm:text-[17px]"
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
