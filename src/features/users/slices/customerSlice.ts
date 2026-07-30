import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { AdminUser, AdminUserUpdatePayload } from "../types"

// /admin/users/ lists every account regardless of role — the Customers page filters to
// role === "customer" client-side since the backend doesn't expose a role query param.
// No pagination is documented, and there's no generic delete — only soft-delete.

interface CustomerState {
  data: AdminUser[]
  singleData: AdminUser | null
  isLoading: boolean
  error: unknown
}

const initialState: CustomerState = {
  data: [],
  singleData: null,
  isLoading: false,
  error: null,
}

export const fetchAll = createAsyncThunk(
  "customers/fetchAll",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/users/")
      return unwrapEnvelope<AdminUser[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchSingle = createAsyncThunk(
  "customers/fetchSingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/users/${id}/`)
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, payload }: { id: string; payload: AdminUserUpdatePayload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/users/${id}/`, payload)
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const activateUser = createAsyncThunk(
  "customers/activate",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/users/${id}/activate/`)
      return unwrapEnvelope<AdminUser>(res.data)
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
      return unwrapEnvelope<AdminUser>(res.data)
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
      return unwrapEnvelope<AdminUser>(res.data)
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
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const applyUpdatedUser = (state: CustomerState, action: { payload: AdminUser }) => {
  state.singleData = action.payload
  state.data = state.data.map((u) => (u.id === action.payload.id ? action.payload : u))
}

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAll.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAll.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchSingle.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchSingle.fulfilled, (state, action) => {
        state.isLoading = false
        state.singleData = action.payload
      })
      .addCase(fetchSingle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(updateCustomer.fulfilled, applyUpdatedUser)
      .addCase(activateUser.fulfilled, applyUpdatedUser)
      .addCase(deactivateUser.fulfilled, applyUpdatedUser)
      .addCase(setUserRole.fulfilled, applyUpdatedUser)
      .addCase(softDeleteUser.fulfilled, applyUpdatedUser)
  },
})

export default customerSlice.reducer
