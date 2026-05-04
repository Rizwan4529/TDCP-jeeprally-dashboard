export const AUTH_TOKEN_KEY = "auth_token"

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}
