// Single source of truth for auth tokens, kept outside Redux so the axios client
// (client.ts) never needs to import the store/authSlice and risk a circular import.
// authSlice mirrors these values into Redux state for components to read/react to.
//
// The access token lives only in memory. The refresh token is persisted in localStorage
// so sessions survive reloads; moving it to an httpOnly cookie (immune to XSS theft)
// needs the backend to set/read that cookie on /auth/login and /auth/refresh.

export const REFRESH_TOKEN_KEY = "refreshToken"
const REFRESH_KEY = REFRESH_TOKEN_KEY

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
