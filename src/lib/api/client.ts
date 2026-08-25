import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "./tokenStore"

export const SESSION_EXPIRED_EVENT = "auth:session-expired"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

// Dedup concurrent 401s so only one refresh call is ever in flight at a time.
let refreshPromise: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }
  const res = await axios.post(
    `${API_BASE_URL}/customer/auth/refresh/`,
    { refresh: refreshToken }
  )
  const newAccessToken = res.data?.data?.access as string | undefined
  if (!newAccessToken) {
    throw new Error("Refresh response missing access token")
  }
  setAccessToken(newAccessToken)
  return newAccessToken
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retried) {
      return Promise.reject(error)
    }

    originalRequest._retried = true

    try {
      refreshPromise ??= performRefresh().finally(() => {
        refreshPromise = null
      })
      const newAccessToken = await refreshPromise
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
