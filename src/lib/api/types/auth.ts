export type RegisterRequest = {
  name: string
  email: string
  password: string
  contact_number: string
  cnic: string
  date_of_birth: string
}

/** Extend when the backend contract is finalized (e.g. access_token, user). */
export type RegisterResponse = unknown
