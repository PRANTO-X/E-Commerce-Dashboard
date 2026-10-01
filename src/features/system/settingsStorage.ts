// There is no settings endpoint on the backend (or in the dev mock API), so store and auth
// settings are persisted per browser in localStorage. Swap these helpers for API calls once
// an endpoint exists; the slices' thunk contracts can stay the same.

export const STORE_SETTINGS_KEY = "nestmart:store-settings"
export const AUTH_SETTINGS_KEY = "nestmart:auth-settings"

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

/** Merges stored values over defaults one level deep, so newly added fields keep their default. */
function mergeWithDefaults<T extends object>(defaults: T, stored: unknown): T {
  if (!isPlainObject(stored)) return defaults
  const result = { ...defaults } as Record<string, unknown>
  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (!(key in stored)) continue
    const value = stored[key]
    if (isPlainObject(defaultValue)) {
      result[key] = isPlainObject(value) ? { ...defaultValue, ...value } : defaultValue
    } else if (typeof value === typeof defaultValue) {
      result[key] = value
    }
  }
  return result as T
}

export function loadStoredSettings<T extends object>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? mergeWithDefaults(defaults, JSON.parse(raw)) : defaults
  } catch {
    return defaults
  }
}

/** Throws if the browser refuses the write (storage disabled, quota exceeded). */
export function writeStoredSettings<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function clearStoredSettings(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* nothing to clear */
  }
}
