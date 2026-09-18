import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CameraIcon, CarIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { CrudTableToolbar } from "@/components/common/CrudTableToolbar";
import {
  EmptyState,
  TeamsTableSkeleton,
} from "@/components/common/LoadingStates";
import { PageHeader } from "@/components/common/NavigationCommon";
import {
  TableActionMenuItem,
  TableActionsMenu,
} from "@/components/common/TableActionsMenu";
import {
  PAGE_SHELL,
  SIDEBAR_PAGE_PADDING,
  TABLE_SECTION,
} from "@/components/layout/pageLayout";
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
import {
  useDeleteVehicleMutation,
  useMyVehiclesQuery,
  useUploadVehicleImageMutation,
} from "@/hooks/api/use-vehicles";
import { cn } from "@/lib/utils";
import { ROUTES, vehicleEditPath } from "@/utils/constants";
import { fetchAuthToken, toPublicFileUrl } from "@/utils/helpers";
import { getVehicleCategoryTitle } from "@/utils/vehicle-form";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

export default function VehiclePage() {
  return <VehicleScreen />;
}

function VehicleScreen() {
  const navigate = useNavigate();
  const token = useMemo(() => fetchAuthToken(), []);
  const [search, setSearch] = useState("");

  const vehiclesQuery = useMyVehiclesQuery(Boolean(token));
  const vehicles = Array.isArray(vehiclesQuery.data?.data)
    ? vehiclesQuery.data.data
    : [];

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const haystack = [
        v.model,
        getVehicleCategoryTitle(v),
        v.class,
        v.engine,
        v.power != null ? String(v.power) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vehicles, search]);

  const deleteVehicleMutation = useDeleteVehicleMutation();
  const uploadImageMutation = useUploadVehicleImageMutation();

  const description = vehiclesQuery.isLoading
    ? undefined
    : vehicles.length === 0
      ? "No vehicles yet. Add one to get started."
      : `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} on file.`;

  return (
    <div className={cn(PAGE_SHELL, SIDEBAR_PAGE_PADDING, "gap-4")}>
      <PageHeader title="Vehicle" description={description} />

      <div className={cn(TABLE_SECTION, "min-h-0")}>
        <Card className={cn(surface, "rounded-md")}>
          <CrudTableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search vehicles..."
            addAction={
              <Button asChild variant="primary-outline" className="shrink-0">
                <Link to={ROUTES.VEHICLE_NEW}>
                  <PlusIcon className="size-4" />
                  Add vehicle
                </Link>
              </Button>
            }
          />

          <div className="space-y-6 px-6 py-6">
            {vehiclesQuery.isLoading ? (
              <TeamsTableSkeleton rows={6} />
            ) : vehiclesQuery.isError ? (
              <EmptyState
                icon={CarIcon}
                title="Could not load vehicles"
                description="Something went wrong while fetching your vehicles. Try again later."
                variant="error"
                size="compact"
              />
            ) : vehicles.length === 0 ? (
              <EmptyState
                icon={CarIcon}
                title="No vehicles yet"
                description="Add your first vehicle to use it when registering for events."
                action={
                  <Button asChild size="default">
                    <Link to={ROUTES.VEHICLE_NEW}>
                      <PlusIcon className="size-4" />
                      Add first vehicle
                    </Link>
                  </Button>
                }
              />
            ) : filteredVehicles.length === 0 ? (
              <EmptyState
                icon={CarIcon}
                title="No matching vehicles"
                description="Try a different search term."
                size="compact"
              />
            ) : (
              <TeamsDataTable tableClassName="table-fixed">
                <TeamsDataTableHeader>
                  <TeamsDataTableHeaderRow>
                    <TeamsDataTableHead className="w-[88px]">
                      Photo
                    </TeamsDataTableHead>
                    <TeamsDataTableHead>Model</TeamsDataTableHead>
                    <TeamsDataTableHead>Category</TeamsDataTableHead>
                    <TeamsDataTableHead>Class</TeamsDataTableHead>
                    <TeamsDataTableHead>Engine</TeamsDataTableHead>
                    <TeamsDataTableHead>Power</TeamsDataTableHead>
                    <TeamsDataTableHead className="min-w-[96px] text-right">
                      Actions
                    </TeamsDataTableHead>
                  </TeamsDataTableHeaderRow>
                </TeamsDataTableHeader>
                <TeamsDataTableBody>
                  {filteredVehicles.map((v) => {
                    const img = toPublicFileUrl(v.image);
                    return (
                      <TableRow key={v._id}>
                        <TableCell className="px-4 align-middle">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-[#E8E8E8] bg-[#F9FAFD]">
                            {img ? (
                              <img
                                src={img}
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
                                "absolute right-0.5 bottom-0.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-sm",
                                uploadImageMutation.isPending &&
                                  "pointer-events-none opacity-70",
                              )}
                              aria-label={`Change photo for ${v.model}`}
                            >
                              <CameraIcon className="size-3" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={
                                  !token || uploadImageMutation.isPending
                                }
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    await uploadImageMutation.mutateAsync({
                                      vehicleId: v._id,
                                      file,
                                    });
                                    toast.success("Photo updated.");
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
                        </TableCell>
                        <TableCell className="max-w-0 px-4 font-semibold text-[#1F1838]">
                          <span className="block truncate" title={v.model}>
                            {v.model}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-4 text-[#6B7890]">
                          <span className="block truncate">
                            {getVehicleCategoryTitle(v)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-4 text-[#6B7890]">
                          <span className="block truncate">
                            {v.class?.trim() ? v.class : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-4 text-[#6B7890]">
                          <span className="block truncate">
                            {v.engine?.trim() ? v.engine : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-0 px-4 text-[#6B7890]">
                          <span className="block truncate">
                            {v.power != null ? v.power : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="w-24 px-4 text-right align-middle whitespace-nowrap">
                          <div className="flex justify-end">
                            <TableActionsMenu>
                              <TableActionMenuItem
                                onClick={() => {
                                  void navigate(vehicleEditPath(v._id));
                                }}
                              >
                                Edit
                              </TableActionMenuItem>
                              <TableActionMenuItem
                                destructive
                                disabled={deleteVehicleMutation.isPending}
                                onClick={() => {
                                  void (async () => {
                                    try {
                                      await deleteVehicleMutation.mutateAsync(
                                        v._id,
                                      );
                                      toast.success("Vehicle deleted.");
                                    } catch (err) {
                                      toast.error(
                                        err instanceof Error
                                          ? err.message
                                          : "Could not delete vehicle.",
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
