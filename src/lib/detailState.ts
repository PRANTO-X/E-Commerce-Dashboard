import { getApiErrorMessage } from "@/lib/api/client"

export type SingleStatus = "idle" | "loading" | "succeeded" | "failed"

/**
 * A rejected detail fetch carries the response body (see extractApiError), not the HTTP status,
 * so "not found" is recognised from the message DRF / the mock adapter send for a 404.
 */
export function isNotFoundError(err: unknown): boolean {
  return /not\s*found|no mock route|no .* matches/i.test(getApiErrorMessage(err, ""))
}

/**
 * Picks which placeholder a detail page should render, from the factory's `singleStatus`.
 * Returns null once the record for `id` is loaded and the page can render normally.
 */
export function resolveDetailState(
  status: SingleStatus,
  error: unknown,
  loaded: boolean
): "loading" | "not-found" | "error" | null {
  if (status === "failed") return isNotFoundError(error) ? "not-found" : "error"
  // Not loaded yet: "idle" (first paint, before the fetch effect dispatches), "loading", or a
  // "succeeded" left over from the previously viewed id until the new fetch's pending lands.
  if (!loaded) return "loading"
  return null
}
