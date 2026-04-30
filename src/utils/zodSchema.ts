import { z } from "zod"

const requiredString = (message = "This field is required") =>
  z.string().trim().min(1, message)

const optionalString = z.string().optional()

const requiredFile = (message = "File is required") =>
  z.custom<File | null>(
    (value) => typeof File !== "undefined" && value instanceof File,
    message
  )

export const stockPrepaidRegistrationSchema = z
  .object({
    categoryPreparedOne: z.boolean(),
    categoryStock: z.boolean(),
    categoryPreparedTwo: z.boolean(),
    categoryPreparedThree: z.boolean(),
    categoryFullName: optionalString,

    personalFullName: optionalString,
    personalGender: optionalString,
    personalAge: optionalString,
    personalAddress: optionalString,
    personalCellNo: optionalString,
    personalDrivingLicense: optionalString,
    personalExpiryDate: optionalString,
    personalCnicNo: requiredString(),
    personalEmail: optionalString,
    driverImage: requiredFile(),
    driverCnic: requiredFile(),
    driverLicense: requiredFile(),

    participatingCoDriver: z.boolean(),
    participatingNavigator: z.boolean(),
    coDriverFullName: optionalString,
    coDriverGender: optionalString,
    coDriverAge: optionalString,
    coDriverCnicNo: requiredString(),
    coDriverEmail: optionalString,
    coDriverCellNo: optionalString,
    coDriverImage: requiredFile(),
    coDriverCnic: requiredFile(),

    vehicleRegistrationNo: optionalString,
    vehicleMake: requiredString(),
    vehicleEngineCapacity: requiredString(),
    fuelDiesel: z.boolean(),
    fuelPetrol: z.boolean(),
    turboChargedYes: z.boolean(),
    turboChargedNo: z.boolean(),
    desiredRallyNumber: optionalString,

    emergencyContactName: requiredString(),
    emergencyContactPhone: requiredString(),
    teamName: optionalString,
    carName: optionalString,
    participationCount: requiredString(),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((value) => value.participatingCoDriver || value.participatingNavigator, {
    message: "Select one option",
    path: ["participatingCoDriver"],
  })
  .refine((value) => value.fuelDiesel || value.fuelPetrol, {
    message: "Select one fuel type",
    path: ["fuelDiesel"],
  })
  .refine((value) => value.turboChargedYes || value.turboChargedNo, {
    message: "Select one option",
    path: ["turboChargedYes"],
  })

export type StockPrepaidRegistrationValues = z.infer<
  typeof stockPrepaidRegistrationSchema
>
