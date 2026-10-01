import { useCallback, useEffect, useState } from "react"

type Status = "loading" | "succeeded" | "failed"

interface AbortablePromise<T> extends Promise<unknown> {
  abort: () => void
  unwrap: () => Promise<T>
}

/**
 * Runs a dispatched thunk and keeps ITS result in component state, rather than reading the
 * shared slice afterwards. Several screens fetch the same list (orders, payments) with
 * different page sizes/filters, and the slice only holds whichever response landed last.
 *
 * `start` must be stable (wrap it in useCallback); it re-runs whenever `start` changes.
 */
export function useLocalFetch<T>(start: () => AbortablePromise<T>) {
  const [state, setState] = useState<{ status: Status; data: T | null; error: unknown }>({
    status: "loading",
    data: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const request = start()
    request
      .unwrap()
      .then((data) => {
        if (active) setState({ status: "succeeded", data, error: null })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: "failed", data: null, error })
      })
    return () => {
      active = false
      request.abort()
    }
  }, [start, attempt])

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading", error: null }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, retry }
}
