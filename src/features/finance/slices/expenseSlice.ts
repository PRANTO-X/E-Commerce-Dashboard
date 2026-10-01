import type { Reducer, UnknownAction } from "@reduxjs/toolkit"
import { createSliceFactory } from "@/lib/sliceFactory"
import type { Expense } from "../types"
import { initialExpenses } from "../data/initialExpenses"

// The backend has no expenses endpoint yet, so this slice runs in the factory's in-memory
// mode. To survive reloads, records are persisted to this browser's localStorage: loaded as
// the seed on startup and written back after every successful create/update/delete.
export const EXPENSES_STORAGE_KEY = "dashboard.expenses.v1"

function loadStoredExpenses(): Expense[] {
  try {
    const raw = window.localStorage.getItem(EXPENSES_STORAGE_KEY)
    if (!raw) return initialExpenses
    const parsed: unknown = JSON.parse(raw)
    if (
      Array.isArray(parsed) &&
      parsed.every((e) => e && typeof e === "object" && typeof (e as Expense).id === "string")
    ) {
      return parsed as Expense[]
    }
  } catch {
    // Storage blocked or corrupt — fall back to the bundled seed.
  }
  return initialExpenses
}

function saveExpenses(data: Expense[]) {
  try {
    window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Quota exceeded / storage blocked: keep working in memory for this session.
  }
}

const {
  reducer: baseReducer,
  fetchAll,
  fetchSingle,
  postData,
  updateData,
  patchData,
  deleteData,
} = createSliceFactory<Expense>({
  name: "expenses",
  seed: loadStoredExpenses(),
})

const PERSISTED_ACTIONS = new Set<string>([
  postData.fulfilled.type,
  updateData.fulfilled.type,
  patchData.fulfilled.type,
  deleteData.fulfilled.type,
])

type ExpenseState = ReturnType<typeof baseReducer>

// Only mutations are persisted — never fetchAll results, which may be a search-filtered subset.
const reducer: Reducer<ExpenseState> = (state, action: UnknownAction) => {
  const next = baseReducer(state, action)
  if (PERSISTED_ACTIONS.has(action.type) && next.data !== state?.data) {
    saveExpenses(next.data)
  }
  return next
}

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }
export default reducer
