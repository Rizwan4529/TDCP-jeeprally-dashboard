import * as React from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { EditDeleteIconActions } from "@/components/common/EditDeleteIconActions";
import { PanelBlockSkeleton } from "@/components/common/LoadingStates";
import { Typography } from "@/components/common/Typography";
import { OtherRaceDialog } from "@/components/profile/OtherRaceDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OtherRace } from "@/api/types/other-races";
import {
  getOtherRaceErrorMessage,
  useDeleteOtherRaceMutation,
  useOtherRacesQuery,
} from "@/hooks/api/use-other-races";
import { fetchAuthToken } from "@/utils/helpers";
import { formatOtherRaceRole } from "@/utils/other-race-form";

const surface = "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";

export function OtherRacesSection() {
  const token = React.useMemo(() => fetchAuthToken(), []);
  const query = useOtherRacesQuery(Boolean(token));
  const deleteMutation = useDeleteOtherRaceMutation();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<OtherRace | null>(null);

  const entries = Array.isArray(query.data?.data) ? query.data.data : [];

  const openCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const openEdit = (entry: OtherRace) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className={cn(surface, "rounded-[14px]")}>
        <div className="flex flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Typography
            as="h3"
            variant="label"
            className="text-[14px] font-bold tracking-wide text-[#1F1838]"
          >
            OTHER RACES
          </Typography>
          <Button
            type="button"
            className="h-10 rounded-[10px] px-4 text-[14px] font-semibold"
            onClick={openCreate}
          >
            <PlusIcon className="size-4" />
            Add other race
          </Button>
        </div>

        <div className="px-6 pb-6 pt-4">
          {query.isLoading ? (
            <PanelBlockSkeleton lines={4} />
          ) : query.isError ? (
            <div className="rounded-[12px] border border-[#F2D6D6] bg-[#FFF5F5] px-4 py-3">
              <Typography variant="body-sm" className="text-[#8B2B2B]">
                {query.error.message ?? "Could not load other races."}
              </Typography>
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#DCDDE2] bg-[#FAFBFF] px-6 py-10 text-center">
              <Typography variant="body" className="font-medium text-[#25314D]">
                No other races yet
              </Typography>
              <Typography variant="body-sm" className="mt-1 text-[#6B7890]">
                Add past rally entries to keep your profile complete.
              </Typography>
              <Button
                type="button"
                variant="primary-outline"
                className="mt-4 rounded-[10px]"
                onClick={openCreate}
              >
                <PlusIcon className="size-4" />
                Add other race
              </Button>
            </div>
          ) : (
            <OtherRacesTable
              entries={entries}
              deletePending={deleteMutation.isPending}
              onEdit={openEdit}
              onDelete={async (id) => {
                try {
                  await deleteMutation.mutateAsync(id);
                  toast.success("Other race removed.");
                  if (editingEntry?._id === id) {
                    setDialogOpen(false);
                    setEditingEntry(null);
                  }
                } catch (err) {
                  toast.error(getOtherRaceErrorMessage(err));
                }
              }}
            />
          )}
        </div>
      </Card>

      <OtherRaceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}
        editingEntry={editingEntry}
      />
    </>
  );
}

function OtherRacesTable({
  entries,
  deletePending,
  onEdit,
  onDelete,
}: {
  entries: OtherRace[];
  deletePending: boolean;
  onEdit: (entry: OtherRace) => void;
  onDelete: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="overflow-x-auto overflow-hidden rounded-[12px] border border-[#EDEEF4]">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[1.4fr_0.75fr_1fr_0.55fr_0.65fr_5.5rem] bg-[#2F2F31] px-5 py-3 text-white">
          {["Team", "Position", "Vehicle", "Year", "Role", ""].map((h) => (
            <p
              key={h || "actions"}
              className={cn(
                "text-[12px] font-semibold uppercase tracking-wide",
                h === "" && "text-right",
              )}
            >
              {h || "Actions"}
            </p>
          ))}
        </div>
        <div className="divide-y divide-[#EEF0F7] bg-white">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="grid grid-cols-[1.4fr_0.75fr_1fr_0.55fr_0.65fr_5.5rem] items-center gap-2 px-5 py-4 text-[13px]"
            >
              <p className="font-medium text-[#1F1838]">{entry.team}</p>
              <p className="text-[#6B7890]">{entry.position}</p>
              <p className="text-[#6B7890]">{entry.vehicle}</p>
              <p className="font-semibold text-[#1F1838]">{entry.year}</p>
              <p className="text-[#6B7890]">{formatOtherRaceRole(entry.role)}</p>
              <div className="flex justify-end">
                <EditDeleteIconActions
                  editLabel="Edit other race"
                  deleteLabel="Delete other race"
                  onEdit={() => onEdit(entry)}
                  deleteDisabled={deletePending}
                  onDelete={() => onDelete(entry._id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
