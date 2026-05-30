import { z } from "zod";

import type { CategoryRecord } from "@/api/types/categories";
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  Vehicle,
} from "@/api/types/vehicles";
import type { Category } from "@/utils/constants";
import { toPublicFileUrl } from "@/utils/helpers";

export const vehicleFormSchema = z.object({
  model: z.string().trim().min(1, "Model is required"),
  engine: z.string().trim().min(1, "Engine is required"),
  category: z.string().trim().min(1, "Select a valid category"),
  frame: z.string().optional(),
  power: z.string().optional(),
  weight: z.string().optional(),
  length: z.string().optional(),
  tank_capacity: z.string().optional(),
  class: z.string().optional(),
  /** Picked file uploads on submit only; string = existing image URL for preview when editing. */
  vehicleImage: z.union([z.instanceof(File), z.string(), z.null()]),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const emptyVehicleFormValues: VehicleFormValues = {
  model: "",
  engine: "",
  category: "",
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

function optionalPositiveInt(s: string | undefined): number | undefined {
  const t = (s ?? "").trim();
  if (t === "") return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.trunc(n);
}

/** POST /vehicles — required model, engine, category; optional rest only if set. */
export function buildCreateVehiclePayload(
  values: VehicleFormValues,
): CreateVehiclePayload {
  const payload: CreateVehiclePayload = {
    model: values.model.trim(),
    engine: values.engine.trim(),
    category: values.category as Category,
  };
  const frame = optionalTrimmed(values.frame);
  if (frame !== undefined) payload.frame = frame;
  const power = optionalPositiveInt(values.power);
  if (power !== undefined) payload.power = power;
  const weight = optionalPositiveInt(values.weight);
  if (weight !== undefined) payload.weight = weight;
  const length = optionalPositiveInt(values.length);
  if (length !== undefined) payload.length = length;
  const tank = optionalPositiveInt(values.tank_capacity);
  if (tank !== undefined) payload.tank_capacity = tank;
  const cls = optionalTrimmed(values.class);
  if (cls !== undefined) payload.class = cls;
  return payload;
}

/** PUT /vehicles/:id — send all allowed keys present in the form (at least model, engine, category). */
export function buildUpdateVehiclePayload(
  values: VehicleFormValues,
): UpdateVehiclePayload {
  return buildCreateVehiclePayload(values) as UpdateVehiclePayload;
}

export function vehicleToFormValues(v: Vehicle): VehicleFormValues {
  return {
    model: v.model,
    engine: v.engine,
    category: v.category,
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
    value: category.key,
  }));
}

export function resolveCategoryTitle(
  categories: CategoryRecord[] | undefined,
  key: string,
): string {
  return (
    categories?.find((category) => category.key === key)?.title ??
    key.replace(/_/g, " ")
  );
}
