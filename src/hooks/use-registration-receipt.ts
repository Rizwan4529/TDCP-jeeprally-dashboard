import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/api/query-keys";
import { getRegistrationById } from "@/api/services/registrations";
import type { DriverRegistration } from "@/api/types/registrations";
import { downloadRegistrationReceipt } from "@/components/receipt/download-registration-receipt";

/**
 * Download a registration receipt PDF. Fetches the full registration
 * (driver, co-driver, members, vehicle) by id unless one is passed in.
 */
export function useRegistrationReceiptDownload() {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const download = async (
    registrationId: string,
    loaded?: DriverRegistration | null,
  ) => {
    if (pendingId) return;
    setPendingId(registrationId);
    try {
      const registration =
        loaded ??
        (
          await queryClient.fetchQuery({
            queryKey: queryKeys.rally.registration(registrationId),
            queryFn: () => getRegistrationById(registrationId),
            staleTime: 15_000,
          })
        ).data;
      await downloadRegistrationReceipt(registration);
    } catch (err) {
      toast.error("Could not download the receipt", {
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setPendingId(null);
    }
  };

  return { download, pendingId };
}
