import { z } from "zod";

import type { CategoryRecord } from "@/api/types/categories";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Vehicle,
} from "@/api/types/vehicles";
import { toPublicFileUrl } from "@/utils/helpers";

/** Suggested ranges — used for validation and form hints. */
export const VEHICLE_FIELD_LIMITS = {
  power: { min: 20, max: 2000, unit: "HP", integer: true },
  weight: { min: 100, max: 15000, unit: "kg", integer: true },
  length: { min: 0.5, max: 20, unit: "m", integer: false },
  tank_capacity: { min: 1, max: 500, unit: "L", integer: true },
} as const;

type VehicleFieldHint = {
  label: string;
  required: boolean;
  placeholder?: string;
  description?: string;
};

export const VEHICLE_FIELD_HINTS = {
  model: {
    label: "Model",
    required: true,
    placeholder: "e.g. Jeep Wrangler Rubicon",
  },
  engine: {
    label: "Engine",
    required: true,
    placeholder: "e.g. 3.6L Pentastar V6",
    description: "Engine type or displacement — not horsepower.",
  },
  category: {
    label: "Category",
    required: true,
    placeholder: "Select TDCP category",
  },
  frame: {
    label: "Frame / build",
    required: false,
    placeholder: "e.g. Steel tube roll cage, ARB bumpers",
    description: "Chassis, roll cage, and major build or safety details.",
  },
  power: {
    label: "Power (HP)",
    required: false,
    placeholder: "e.g. 285",
    description: "Engine output in horsepower — not cc or kW.",
  },
  weight: {
    label: "Weight (kg)",
    required: false,
    placeholder: "e.g. 2800",
    description:
      "Ready-to-race weight in kg (vehicle, fuel, spare tyre, safety gear).",
  },
  length: {
    label: "Length (m)",
    required: false,
    placeholder: "e.g. 4.6",
    description: "Overall length in meters (4.6 — not 400 or centimeters).",
  },
  tank_capacity: {
    label: "Tank capacity (L)",
    required: false,
    placeholder: "e.g. 75",
    description: "Fuel tank size in liters.",
  },
  class: {
    label: "Class",
    required: false,
    placeholder: "e.g. Modified or Open 6x6",
    description:
      "Competition division for grouping/results (Stock, Modified, Open) — separate from category above.",
  },
} as const satisfies Record<string, VehicleFieldHint>;

/** Shared label / placeholder / description / required for vehicle form fields. */
export function vehicleFormFieldProps<
  K extends keyof typeof VEHICLE_FIELD_HINTS,
>(key: K) {
  const hint = VEHICLE_FIELD_HINTS[key] as VehicleFieldHint;
  return {
    label: hint.label,
    required: hint.required,
    ...(hint.placeholder ? { placeholder: hint.placeholder } : {}),
    // ...(hint.description ? { description: hint.description } : {}),
  };
}

function optionalNumericField(
  fieldLabel: string,
  config: {
    min: number;
    max: number;
    unit: string;
    integer?: boolean;
  },
) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = (value ?? "").trim();
      if (trimmed === "") return;

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a valid number (${config.unit}).`,
        });
        return;
      }

      if (config.integer && !Number.isInteger(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be a whole number (${config.unit}).`,
        });
        return;
      }

      if (parsed < config.min || parsed > config.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldLabel} must be between ${config.min} and ${config.max} ${config.unit}.`,
        });
      }
    });
}

export const vehicleFormSchema = z.object({
  model: z.string().trim().min(1, "Model is required"),
  engine: z.string().trim().min(1, "Engine is required"),
  category_id: z.string().trim().min(1, "Select a valid category"),
  frame: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = (value ?? "").trim();
      if (trimmed.length > 200) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Frame / build details must be 200 characters or fewer.",
        });
      }
    }),
  power: optionalNumericField("Power", VEHICLE_FIELD_LIMITS.power),
  weight: optionalNumericField("Weight", VEHICLE_FIELD_LIMITS.weight),
  length: optionalNumericField("Length", VEHICLE_FIELD_LIMITS.length),
  tank_capacity: optionalNumericField(
    "Tank capacity",
    VEHICLE_FIELD_LIMITS.tank_capacity,
  ),
  class: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = (value ?? "").trim();
      if (trimmed === "") return;
      if (trimmed.length > 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class must be 60 characters or fewer.",
        });
      }
    }),
  /** Picked file uploads on submit only; string = existing image URL for preview when editing. */
  vehicleImage: z.union([z.instanceof(File), z.string(), z.null()]),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const emptyVehicleFormValues: VehicleFormValues = {
  model: "",
  engine: "",
  category_id: "",
  frame: "",
  power: "",
  weight: "",
  length: "",
  tank_capacity: "",
  class: "",
  vehicleImage: null,
};

function optionalTrimmed(s: string | undefined): string | undefined {
  const t = (s ?? "").trim();
  return t === "" ? undefined : t;
}

function parseOptionalNumber(
  value: string | undefined,
  config: { min: number; max: number; unit: string; integer?: boolean },
  fieldLabel: string,
): number | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return undefined;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number (${config.unit}).`);
  }
  if (config.integer && !Number.isInteger(parsed)) {
    throw new Error(`${fieldLabel} must be a whole number (${config.unit}).`);
  }
  if (parsed < config.min || parsed > config.max) {
    throw new Error(
      `${fieldLabel} must be between ${config.min} and ${config.max} ${config.unit}.`,
    );
  }

  return config.integer ? Math.trunc(parsed) : parsed;
}

export function getVehicleCategoryId(vehicle: Vehicle): string {
  return vehicle.category_id?._id ?? "";
}

export function getVehicleCategoryKey(vehicle: Vehicle): string {
  return vehicle.category_id?.key ?? "";
}

export function getVehicleCategoryTitle(vehicle: Vehicle): string {
  return (
    vehicle.category_id?.title ??
    vehicle.category_id?.key?.replace(/_/g, " ") ??
    ""
  );
}

/** POST /vehicles — required category_id, model, engine; optional rest only if set. */
export function buildCreateVehiclePayload(
  values: VehicleFormValues,
): CreateVehiclePayload {
  const payload: CreateVehiclePayload = {
    category_id: values.category_id.trim(),
    model: values.model.trim(),
    engine: values.engine.trim(),
  };

  const frame = optionalTrimmed(values.frame);
  if (frame !== undefined) payload.frame = frame;

  const power = parseOptionalNumber(
    values.power,
    VEHICLE_FIELD_LIMITS.power,
    "Power",
  );
  if (power !== undefined) payload.power = power;

  const weight = parseOptionalNumber(
    values.weight,
    VEHICLE_FIELD_LIMITS.weight,
    "Weight",
  );
  if (weight !== undefined) payload.weight = weight;

  const length = parseOptionalNumber(
    values.length,
    VEHICLE_FIELD_LIMITS.length,
    "Length",
  );
  if (length !== undefined) payload.length = length;

  const tank = parseOptionalNumber(
    values.tank_capacity,
    VEHICLE_FIELD_LIMITS.tank_capacity,
    "Tank capacity",
  );
  if (tank !== undefined) payload.tank_capacity = tank;

  const cls = optionalTrimmed(values.class);
  if (cls !== undefined) payload.class = cls;

  return payload;
}

/** PUT /vehicles/:id — send all allowed keys present in the form. */
export function buildUpdateVehiclePayload(
  values: VehicleFormValues,
): UpdateVehiclePayload {
  return buildCreateVehiclePayload(values) as UpdateVehiclePayload;
}

export function vehicleToFormValues(v: Vehicle): VehicleFormValues {
  return {
    model: v.model,
    engine: v.engine,
    category_id: getVehicleCategoryId(v),
    frame: v.frame ?? "",
    power: v.power != null ? String(v.power) : "",
    weight: v.weight != null ? String(v.weight) : "",
    length: v.length != null ? String(v.length) : "",
    tank_capacity: v.tank_capacity != null ? String(v.tank_capacity) : "",
    class: v.class ?? "",
    vehicleImage: toPublicFileUrl(v.image),
  };
}

export function buildCategorySelectOptions(
  categories: CategoryRecord[] | undefined,
) {
  if (!categories?.length) return [];
  return categories.map((category) => ({
    label: category.title,
    value: category._id,
  }));
}

export function resolveCategoryTitleById(
  categories: CategoryRecord[] | undefined,
  categoryId: string,
): string {
  return (
    categories?.find((category) => category._id === categoryId)?.title ??
    categoryId
  );
}
