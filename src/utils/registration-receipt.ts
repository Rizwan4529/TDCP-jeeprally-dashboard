import type {
  DriverRegistration,
  RegistrationEvent,
  RegistrationPerson,
  RegistrationTeam,
  RegistrationVehicle,
} from "@/api/types/registrations";
import { CATEGORY_LABELS, type Category } from "@/utils/constants";
import { formatRallyAmount } from "@/utils/rally-pricing";
import { formatRegistrationStatus } from "@/utils/registration-entries";

/**
 * Registration receipt content shared by the success page and the PDF.
 * Database ids and created/updated timestamps are intentionally left out.
 */
export type ReceiptRow = { label: string; value: string };

export type ReceiptSection = { title: string; rows: ReceiptRow[] };

export type ReceiptPerson = { role: string; name: string; rows: ReceiptRow[] };

export type ReceiptPaymentTone = "paid" | "free" | "unknown";

export type RegistrationReceipt = {
  rallyName: string;
  issuedOn: string;
  payment: {
    tone: ReceiptPaymentTone;
    statusLabel: string;
    amountLabel: string;
    rows: ReceiptRow[];
  };
  registrationStatus: string;
  sections: ReceiptSection[];
  people: ReceiptPerson[];
};

const EMPTY = "—";

function text(value: unknown): string {
  if (value === undefined || value === null) return EMPTY;
  const s = String(value).trim();
  return s === "" ? EMPTY : s;
}

function capitalize(value: unknown): string {
  const s = text(value);
  return s === EMPTY ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatReceiptDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return text(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return text(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateRange(start?: string | null, end?: string | null): string {
  const from = formatReceiptDate(start);
  const to = formatReceiptDate(end);
  if (from === EMPTY && to === EMPTY) return EMPTY;
  if (to === EMPTY || from === to) return from;
  return `${from} – ${to}`;
}

function refObject<T extends object>(value: T | string | null | undefined): T | null {
  return value && typeof value === "object" ? value : null;
}

function refName(
  value: { name?: string; title?: string; key?: string } | string | null | undefined,
): string {
  const obj = refObject(value);
  if (!obj) return EMPTY;
  return text(obj.name ?? obj.title ?? obj.key);
}

/** Profile fields shown for the driver, co-driver and roster users. */
function personRows(person: RegistrationPerson): ReceiptRow[] {
  const rows: ReceiptRow[] = [
    { label: "Email", value: text(person.email) },
    { label: "Contact no.", value: text(person.contact_number) },
    { label: "CNIC", value: text(person.cnic) },
    { label: "Date of birth", value: formatReceiptDate(person.date_of_birth) },
  ];
  if (person.gender !== undefined) {
    rows.push({ label: "Gender", value: capitalize(person.gender) });
  }
  if (person.age !== undefined) {
    rows.push({ label: "Age", value: text(person.age) });
  }
  rows.push({ label: "Occupation", value: text(person.occupation) });
  if (person.address !== undefined) {
    rows.push({ label: "Address", value: text(person.address) });
  }
  if (person.location) {
    rows.push({ label: "Location", value: text(person.location) });
  }
  if (person.license_number !== undefined) {
    rows.push({ label: "License no.", value: text(person.license_number) });
  }
  if (person.license_expiry !== undefined) {
    rows.push({
      label: "License expiry",
      value: formatReceiptDate(person.license_expiry),
    });
  }
  return rows;
}

function vehicleRows(vehicle: RegistrationVehicle | null): ReceiptRow[] {
  if (!vehicle) return [{ label: "Vehicle", value: EMPTY }];
  const rows: ReceiptRow[] = [
    { label: "Make", value: text(vehicle.model) },
    { label: "Reg no.", value: text(vehicle.engine) },
    {
      label: "Engine capacity",
      value: vehicle.power != null ? `${vehicle.power} cc` : EMPTY,
    },
    { label: "Vehicle type", value: capitalize(vehicle.engineType) },
    {
      label: "Turbo charged",
      value:
        vehicle.turboCharge === true
          ? "Yes"
          : vehicle.turboCharge === false
            ? "No"
            : EMPTY,
    },
    {
      label: "Desired rally no.",
      value: text(vehicle.desiredRallyNumber),
    },
    { label: "Type", value: refName(vehicle.typeId) },
    { label: "Category", value: refName(vehicle.category_id) },
  ];
  // Optional build details, only when recorded.
  if (vehicle.frame) rows.push({ label: "Frame / build", value: text(vehicle.frame) });
  if (vehicle.class) rows.push({ label: "Class", value: text(vehicle.class) });
  if (vehicle.weight != null) rows.push({ label: "Weight", value: `${vehicle.weight} kg` });
  if (vehicle.length != null) rows.push({ label: "Length", value: `${vehicle.length} m` });
  if (vehicle.tank_capacity != null) {
    rows.push({ label: "Tank capacity", value: `${vehicle.tank_capacity} L` });
  }
  return rows;
}

function categoryLabel(registration: DriverRegistration, team: RegistrationTeam | null) {
  const category = refObject(registration.category_id);
  if (category?.title) return category.title;
  const key = category?.key ?? team?.category;
  return key ? (CATEGORY_LABELS[key as Category] ?? key) : EMPTY;
}

const PIPELINE_LABELS: Record<string, string> = {
  registered: "Registered",
  inspection: "Inspection",
  qualification: "Qualification",
  firing_order: "Firing order",
  rally_number: "Rally number",
};

export function buildRegistrationReceipt(
  registration: DriverRegistration,
): RegistrationReceipt {
  const event = refObject<RegistrationEvent>(registration.event_id);
  const team = refObject<RegistrationTeam>(registration.team_id);
  const vehicle = refObject<RegistrationVehicle>(registration.vehicle_id);
  const payment = registration.payment ?? null;

  const entryMode = payment?.entry_mode
    ? capitalize(payment.entry_mode)
    : EMPTY;

  const paymentTone: ReceiptPaymentTone = !payment
    ? "unknown"
    : payment.status === "paid"
      ? "paid"
      : "free";

  const paymentRows: ReceiptRow[] = [
    {
      label: "Payment status",
      value:
        paymentTone === "paid"
          ? "Paid"
          : paymentTone === "free"
            ? "No fee (free entry)"
            : "Not recorded",
    },
    {
      label: "Amount",
      value: payment ? formatRallyAmount(payment.amount) : EMPTY,
    },
    { label: "Entry mode", value: entryMode },
    { label: "Order ID", value: text(payment?.order_id) },
    { label: "Transaction ID", value: text(payment?.transaction_id) },
    { label: "Paid on", value: formatDateTime(payment?.paid_at) },
  ];

  const entryRows: ReceiptRow[] = [
    { label: "Rally type", value: refName(registration.type_id) },
    { label: "Category", value: categoryLabel(registration, team) },
    { label: "Entry mode", value: entryMode },
    {
      label: "Team",
      value: team?.is_solo ? "Solo entry (driver only)" : text(team?.team_name),
    },
  ];
  if (team?.team_number) {
    entryRows.push({ label: "Team number", value: `#${team.team_number}` });
  }
  entryRows.push(
    {
      label: "Registration status",
      value: formatRegistrationStatus(registration.status),
    },
    {
      label: "Stage",
      value:
        PIPELINE_LABELS[registration.pipeline_stage ?? ""] ??
        capitalize(registration.pipeline_stage),
    },
    { label: "Registered on", value: formatDateTime(registration.registered_at) },
  );
  if (registration.firing_order != null) {
    entryRows.push({ label: "Firing order", value: String(registration.firing_order) });
  }
  if (registration.rally_number) {
    entryRows.push({ label: "Rally number", value: text(registration.rally_number) });
  }

  const sections: ReceiptSection[] = [
    {
      title: "Rally",
      rows: [
        { label: "Rally", value: text(event?.name) },
        { label: "Location", value: text(event?.location) },
        {
          label: "Rally dates",
          value: dateRange(event?.rally_start_date, event?.rally_end_date),
        },
        {
          label: "Registration window",
          value: dateRange(
            event?.registration_start_date,
            event?.registration_end_date,
          ),
        },
        { label: "Rally status", value: capitalize(event?.status) },
      ],
    },
    { title: "Entry", rows: entryRows },
    { title: "Vehicle", rows: vehicleRows(vehicle) },
    {
      title: "Other information",
      rows: [
        {
          label: "Emergency contact name",
          value: text(registration.emergency_contact_person),
        },
        {
          label: "Emergency contact no.",
          value: text(registration.emergency_contact_number),
        },
        {
          label: "Participation (1st time / no. of times)",
          value: text(registration.participation_remarks),
        },
      ],
    },
  ];

  const people: ReceiptPerson[] = [];
  const driver = refObject<RegistrationPerson>(team?.driver_id ?? null);
  if (driver) {
    people.push({ role: "Driver", name: text(driver.name), rows: personRows(driver) });
  }

  // Co-driver: embedded profile, else a legacy roster navigator.
  const legacyNavigator = refObject<RegistrationPerson>(team?.navigator_id ?? null);
  const coDriver = team?.co_drivers?.[0] ?? legacyNavigator;
  if (coDriver) {
    people.push({
      role: "Co-driver / Navigator",
      name: text(coDriver.name),
      rows: personRows(coDriver),
    });
  }

  const members = (team?.member_ids ?? []).filter(
    (m) => !legacyNavigator || m._id !== legacyNavigator._id,
  );
  members.forEach((member, index) => {
    people.push({
      role: `Team member ${index + 1}`,
      name: text(member.name),
      rows: personRows(member),
    });
  });

  return {
    rallyName: text(event?.name),
    issuedOn: formatDateTime(new Date().toISOString()),
    payment: {
      tone: paymentTone,
      statusLabel:
        paymentTone === "paid"
          ? "Paid"
          : paymentTone === "free"
            ? "Free entry"
            : "Payment not recorded",
      amountLabel: payment ? formatRallyAmount(payment.amount) : EMPTY,
      rows: paymentRows,
    },
    registrationStatus: formatRegistrationStatus(registration.status),
    sections,
    people,
  };
}

export function receiptFileName(receipt: RegistrationReceipt): string {
  const slug = receipt.rallyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `registration-receipt-${slug || "rally"}-${date}.pdf`;
}
