import type { LoginUser } from "@/api/types/auth"
import { ENUMS } from "@/utils/constants"

function getSecureStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Reads the auth token from browser storage (localStorage). */
export function fetchAuthToken(): string | null {
  const storage = getSecureStorage()
  if (!storage) {
    return null
  }
  try {
    return storage.getItem(ENUMS.AUTH_TOKEN)
  } catch {
    return null
  }
}

/** Persists the auth token. */
export function updateAuthToken(token: string): void {
  const storage = getSecureStorage()
  if (!storage) {
    return
  }
  try {
    storage.setItem(ENUMS.AUTH_TOKEN, token)
  } catch {
    /* ignore quota / private mode */
  }
}

/** Removes the auth token from storage. */
export function removeAuthToken(): void {
  const storage = getSecureStorage()
  if (!storage) {
    return
  }
  try {
    storage.removeItem(ENUMS.AUTH_TOKEN)
    storage.removeItem(ENUMS.AUTH_USER)
  } catch {
    /* ignore */
  }
}

/** Normalizes API date strings (`2013-05-21T00:00:00.000Z`) to `YYYY-MM-DD` for date inputs. */
export function toDateOnlyInputValue(iso: string | null | undefined): string {
  if (!iso || typeof iso !== "string") {
    return ""
  }
  const trimmed = iso.trim()
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed)
  return match?.[1] ?? ""
}

export function updateAuthUser(user: LoginUser): void {
  const storage = getSecureStorage()
  if (!storage) {
    return
  }
  try {
    storage.setItem(ENUMS.AUTH_USER, JSON.stringify(user))
  } catch {
    /* ignore quota / private mode */
  }
}

export function fetchAuthUser(): LoginUser | null {
  const storage = getSecureStorage()
  if (!storage) {
    return null
  }
  try {
    const raw = storage.getItem(ENUMS.AUTH_USER)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "_id" in parsed &&
      typeof (parsed as { _id: unknown })._id === "string"
    ) {
      return parsed as LoginUser
    }
  } catch {
    /* ignore invalid JSON */
  }
  return null
}

function getApiOrigin(): string | null {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl || typeof baseUrl !== "string") {
    return null
  }
  try {
    return new URL(baseUrl).origin
  } catch {
    return null
  }
}

export function toPublicFileUrl(path: string | null | undefined): string | null {
  if (!path) return null

  const origin = getApiOrigin()
  if (!origin) return null

  const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "")
  return `${origin}/${normalized}`
}
