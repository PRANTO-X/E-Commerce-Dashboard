import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "./tokenStore"

export const SESSION_EXPIRED_EVENT = "auth:session-expired"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    `${import.meta.env.VITE_API_BASE_URL}/customer/auth/refresh/`,
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
