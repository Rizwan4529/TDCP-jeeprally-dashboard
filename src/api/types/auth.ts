/** Key/value pairs sent as multipart form fields to `/auth/register`. */
export type RegisterPayload = Record<string, string | File | undefined>

/** @deprecated Use RegisterPayload */
export type RegisterRequest = RegisterPayload

export type UpdateProfilePayload = {
  name: string
  gender: string
  age: string
  address: string
  contact_number: string
  license_number: string
  license_expiry: string
  cnic: string
  date_of_birth: string
  occupation: string
  profile_image?: File | null
  cnic_image?: File | null
  license_image?: File | null
}

/** Extend when the backend contract is finalized (e.g. access_token, user). */
export type RegisterResponse = unknown

export type LoginRequest = {
  email: string
  password: string
}

/**
 * User object returned on login (`data.user`) and kept in session storage.
 * Dates may be full ISO strings (e.g. `2013-05-21T00:00:00.000Z`).
 */
export type LoginUser = {
  _id: string
  name: string
  email: string
  gender: string
  /** API may send a number; forms use strings. */
  age: number | string
  address: string
  contact_number: string
  cnic: string
  license_number: string
  license_expiry: string
  date_of_birth: string
  occupation: string
  profile_image: string | null
  cnic_image: string | null
  license_image: string | null
  role: string
  is_verified: boolean
  created_at: string
  updated_at: string
  __v: number
}

export type LoginData = {
  accessToken: string
  user: LoginUser
}

export type LoginResponse = {
  success: boolean
  message: string
  data: LoginData
}
