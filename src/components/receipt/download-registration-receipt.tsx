import type { DriverRegistration } from "@/api/types/registrations";
import {
  buildRegistrationReceipt,
  receiptFileName,
} from "@/utils/registration-receipt";

/**
 * Renders the receipt PDF and saves it. The PDF renderer is loaded on demand
 * so it stays out of the main bundle.
 */
export async function downloadRegistrationReceipt(
  registration: DriverRegistration,
): Promise<void> {
  const [{ pdf }, { RegistrationReceiptDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./RegistrationReceiptDocument"),
  ]);

  const receipt = buildRegistrationReceipt(registration);
  const blob = await pdf(
    <RegistrationReceiptDocument receipt={receipt} />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = receiptFileName(receipt);
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
