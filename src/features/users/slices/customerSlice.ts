import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapItem } from "@/lib/api/envelope"
import type { AdminUser } from "../types"

// /admin/users/ lists every account regardless of role — the Customers page filters to
// role === "customer" client-side since the backend doesn't expose a role query param.
// No pagination is documented, and there's no generic delete — only soft-delete.

const { reducer, fetchAll, fetchSingle, patchData: updateCustomer } = createSliceFactory<AdminUser>({
  name: "customers",
  endpoint: "/admin/users/",
  initialSingleData: null,
})

export { fetchAll, fetchSingle, updateCustomer }

// Action-only endpoints — not generic CRUD, so they live outside the factory. Callers
// should re-dispatch fetchSingle(id) afterward to refresh the detail page's state.singleData
// (these thunks intentionally don't touch Redux state themselves).

export const activateUser = createAsyncThunk(
  "customers/activate",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/users/${id}/activate/`)
      return unwrapItem<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const deactivateUser = createAsyncThunk(
  "customers/deactivate",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/users/${id}/deactivate/`)
      return unwrapItem<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const resetUserPassword = createAsyncThunk(
  "customers/resetPassword",
  async ({ id, new_password }: { id: string; new_password: string }, { rejectWithValue }) => {
    try {
      await api.post(`/admin/users/${id}/reset-password/`, { new_password })
      return id
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const setUserRole = createAsyncThunk(
  "customers/setRole",
  async ({ id, role }: { id: string; role: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/users/${id}/set-role/`, { role })
      return unwrapItem<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const softDeleteUser = createAsyncThunk(
  "customers/softDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/users/${id}/soft-delete/`)
      return unwrapItem<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export default reducer
