import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { AdminUser, StaffCreatePayload, StaffUpdatePayload, PermissionCode } from "../types"

interface StaffState {
  data: AdminUser[]
  singleData: AdminUser | null
  isLoading: boolean
  error: unknown
}

const initialState: StaffState = {
  data: [],
  singleData: null,
  isLoading: false,
  error: null,
}

export const fetchAll = createAsyncThunk(
  "staffs/fetchAll",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/staff/")
      return unwrapEnvelope<AdminUser[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchSingle = createAsyncThunk(
  "staffs/fetchSingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/staff/${id}/`)
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const postData = createAsyncThunk(
  "staffs/postData",
  async ({ payload, onSuccess }: { payload: StaffCreatePayload; onSuccess?: () => void }, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/staff/", payload)
      const item = unwrapEnvelope<AdminUser>(res.data)
      onSuccess?.()
      return item
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const patchData = createAsyncThunk(
  "staffs/patchData",
  async ({ id, payload }: { id: string; payload: StaffUpdatePayload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/staff/${id}/`, payload)
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const updateStaffPermissions = createAsyncThunk(
  "staffs/updatePermissions",
  async (
    { id, changes }: { id: string; changes: { code: PermissionCode; enabled: boolean }[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/admin/staff/${id}/permissions/`, { permissions: changes })
      return unwrapEnvelope<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const staffSlice = createSlice({
  name: "staffs",
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

      .addCase(postData.fulfilled, (state, action) => {
        state.data = [action.payload, ...state.data]
      })

      .addCase(patchData.fulfilled, (state, action) => {
        state.data = state.data.map((s) => (s.id === action.payload.id ? action.payload : s))
        state.singleData = action.payload
      })

      .addCase(updateStaffPermissions.fulfilled, (state, action) => {
        state.data = state.data.map((s) => (s.id === action.payload.id ? action.payload : s))
        state.singleData = action.payload
      })
  },
})

export default staffSlice.reducer
