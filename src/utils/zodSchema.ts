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

export const dirtBikeRegistrationSchema = z.object({
  categoryClass: requiredString("Select a class"),
  categoryType: requiredString(),

  driverName: requiredString(),
  driverGender: requiredString(),
  driverAge: optionalString,
  driverAddress: optionalString,
  driverCellNo: requiredString(),
  driverLicenseNo: requiredString(),
  driverExpiryDate: optionalString,
  driverCnicNo: requiredString(),
  driverEmail: z.string().trim().min(1, "This field is required").email(
    "Enter a valid email address"
  ),
  driverImage: requiredFile(),
  driverCnic: requiredFile(),
  driverLicense: requiredFile(),

  bikeRegistrationNo: optionalString,
  bikeMake: requiredString(),
  bikeEngineCapacity: requiredString(),
  desiredRallyNumber: requiredString(),

  emergencyContact: requiredString(),
  teamName: optionalString,
  bikeName: optionalString,
  participationCount: requiredString(),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "You must agree to the terms and conditions",
  }),
})

export type DirtBikeRegistrationValues = z.infer<
  typeof dirtBikeRegistrationSchema
>

export const quadBikeRegistrationSchema = z.object({
  categoryType: requiredString(),

  driverName: requiredString(),
  driverGender: requiredString(),
  driverAge: optionalString,
  driverAddress: optionalString,
  driverCellNo: requiredString(),
  driverLicenseNo: requiredString(),
  driverExpiryDate: optionalString,
  driverCnicNo: requiredString(),
  driverEmail: z.string().trim().min(1, "This field is required").email(
    "Enter a valid email address"
  ),
  driverImage: requiredFile(),
  driverCnic: requiredFile(),
  driverLicense: requiredFile(),

  bikeRegistrationNo: optionalString,
  bikeMake: requiredString(),
  bikeEngineCapacity: requiredString(),
  desiredRallyNumber: requiredString(),

  emergencyContact: requiredString(),
  teamName: optionalString,
  carName: optionalString,
  participationCount: requiredString(),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "You must agree to the terms and conditions",
  }),
})

export type QuadBikeRegistrationValues = z.infer<
  typeof quadBikeRegistrationSchema
>

export const truckRaceRegistrationSchema = z.object({
  categoryType: requiredString(),

  driverName: requiredString(),
  driverGender: requiredString(),
  driverAge: optionalString,
  driverAddress: optionalString,
  driverCellNo: requiredString(),
  driverEmail: z.string().trim().min(1, "This field is required").email(
    "Enter a valid email address"
  ),
  driverLicenseNo: requiredString(),
  driverExpiryDate: optionalString,
  driverCnicNo: requiredString(),
  driverImage: requiredFile(),
  driverCnic: requiredFile(),
  driverLicense: requiredFile(),

  coDriverParticipatingAs: requiredString("Select one option"),
  coDriverName: requiredString(),
  coDriverSex: optionalString,
  coDriverAge: optionalString,
  coDriverCnicNo: requiredString(),
  coDriverCellNo: requiredString(),
  coDriverLicenseNo: requiredString(),
  coDriverEmail: z.string().trim().min(1, "This field is required").email(
    "Enter a valid email address"
  ),
  coDriverImage: requiredFile(),
  coDriverCnic: requiredFile(),
  coDriverLicense: requiredFile(),

  mechanicName: requiredString(),
  mechanicSex: optionalString,
  mechanicAge: optionalString,
  mechanicCnicNo: requiredString(),
  mechanicCellNo: requiredString(),

  vehicleRegistrationNo: optionalString,
  vehicleMake: requiredString(),
  vehicleEngineCapacity: requiredString(),
  fuelType: requiredString("Select one fuel type"),
  turboCharged: requiredString("Select one option"),
  desiredRallyNumber: requiredString(),

  emergencyContact: requiredString(),
  teamName: optionalString,
  truckName: optionalString,
  participationCount: requiredString(),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: "You must agree to the terms and conditions",
  }),
})

export type TruckRaceRegistrationValues = z.infer<
  typeof truckRaceRegistrationSchema
>

export const sixBySixRegistrationSchema = truckRaceRegistrationSchema

export type SixBySixRegistrationValues = z.infer<
  typeof sixBySixRegistrationSchema
>

export const loginSchema = z.object({
  login: requiredString("Enter your email, phone, or username"),
  password: requiredString("Enter your password"),
})

export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    fullName: requiredString("Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: requiredString("Confirm your password"),
    contactNumber: z
      .string()
      .trim()
      .regex(/^03\d{9}$/, "Enter a valid mobile number (e.g. 03001234567)"),
    cnic: z
      .string()
      .trim()
      .regex(/^\d{13}$/, "CNIC must be exactly 13 digits"),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date")
      .refine((dateStr) => {
        const parsed = new Date(`${dateStr}T00:00:00`)
        return !Number.isNaN(parsed.getTime())
      }, "Invalid date")
      .refine((dateStr) => {
        const parsed = new Date(`${dateStr}T00:00:00`)
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        return parsed <= endOfToday
      }, "Date of birth cannot be in the future"),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignupValues = z.infer<typeof signupSchema>
