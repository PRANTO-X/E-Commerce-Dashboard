import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./tokenStore"
import { MOCK_API_ENABLED, mockAdapter } from "./mockAdapter"

export const SESSION_EXPIRED_EVENT = "auth:session-expired"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Swap in the dev-only mock backend when the real one is unreachable. Guarded by
// import.meta.env.DEV inside the module, so this branch compiles away in production.
if (MOCK_API_ENABLED) {
  api.defaults.adapter = mockAdapter
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

// Interceptor-free instance for the refresh call itself, so a 401 from /refresh can't
// recurse into another refresh. Shares the mock adapter in dev.
const refreshClient = axios.create({ baseURL: API_BASE_URL })
if (MOCK_API_ENABLED) {
  refreshClient.defaults.adapter = mockAdapter
}

// Dedup concurrent 401s so only one refresh call is ever in flight at a time.
let refreshPromise: Promise<string> | null = null

/** Exchanges the stored refresh token for a new access token (and stores a rotated refresh token if issued). */
export async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }
  const res = await refreshClient.post("/customer/auth/refresh/", { refresh: refreshToken })
  const newAccessToken = res.data?.data?.access as string | undefined
  if (!newAccessToken) {
    throw new Error("Refresh response missing access token")
  }
  setAccessToken(newAccessToken)
  // Backends with refresh-token rotation return a new refresh token; the old one is
  // blacklisted, so keeping it would log the user out on the next refresh.
  const rotated = res.data?.data?.refresh as string | undefined
  if (rotated) {
    setRefreshToken(rotated)
  }
  return newAccessToken
}

/** Shared, de-duplicated refresh: concurrent callers await the same in-flight request. */
export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

// Auth endpoints answer 401 for bad credentials / bad tokens; refreshing on those is
// pointless and would wrongly broadcast "session expired" on a failed login.
const isAuthEndpoint = (url?: string) => !!url && /\/auth\/(login|refresh|logout)\//.test(url)

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retried = true

    try {
      const newAccessToken = await refreshAccessToken()
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`)
      return api(originalRequest)
    } catch {
      clearTokens()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
      return Promise.reject(error)
    }
  }
)

export function extractApiError(err: unknown): unknown {
  if (axios.isAxiosError(err)) {
    return err.response?.data ?? { error: err.message }
  }
  return { error: String(err) }
}

// The backend's error shape varies by failure type (DRF field errors, a plain
// detail/message string, or a generic envelope) — pull out whatever it actually
// says rather than showing a generic message for every kind of failure.
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err && typeof err === "object") {
    const data = err as Record<string, unknown>
    const detail = data.message ?? data.detail ?? data.error
    if (typeof detail === "string" && detail.trim()) return detail

    for (const key of ["non_field_errors", "email", "password"]) {
      const value = data[key]
      if (Array.isArray(value) && typeof value[0] === "string") return value[0]
    }
  }
  return fallback
}
