// Single source of truth for auth tokens, kept outside Redux so the axios client
// (client.ts) never needs to import the store/authSlice and risk a circular import.
// authSlice mirrors these values into Redux state for components to read/react to.

const REFRESH_KEY = "refreshToken"

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}

export function clearTokens(): void {
  accessToken = null
  setRefreshToken(null)
}
