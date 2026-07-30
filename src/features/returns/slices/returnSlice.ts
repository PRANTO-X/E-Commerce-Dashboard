import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { ApproveReturnPayload, RejectReturnPayload, ReturnRequest } from "../types"

interface ReturnState {
  data: ReturnRequest[]
  singleData: ReturnRequest | null
  isLoading: boolean
  error: unknown
}

const initialState: ReturnState = {
  data: [],
  singleData: null,
  isLoading: false,
  error: null,
}

export const fetchAllReturns = createAsyncThunk(
  "returns/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/returns/")
      return unwrapEnvelope<ReturnRequest[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchReturn = createAsyncThunk(
  "returns/fetchSingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/returns/${id}/`)
      return unwrapEnvelope<ReturnRequest>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const approveReturn = createAsyncThunk(
  "returns/approve",
  async ({ id, payload }: { id: string; payload: ApproveReturnPayload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/returns/${id}/approve/`, payload)
      return unwrapEnvelope<ReturnRequest>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const rejectReturn = createAsyncThunk(
  "returns/reject",
  async ({ id, payload }: { id: string; payload: RejectReturnPayload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/returns/${id}/reject/`, payload)
      return unwrapEnvelope<ReturnRequest>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const markReturnReceived = createAsyncThunk(
  "returns/markReceived",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/returns/${id}/mark-received/`)
      return unwrapEnvelope<ReturnRequest>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const processReturn = createAsyncThunk(
  "returns/process",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/returns/${id}/process/`)
      return unwrapEnvelope<ReturnRequest>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const applyUpdatedReturn = (state: ReturnState, action: { payload: ReturnRequest }) => {
  state.singleData = action.payload
  state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
}

const returnSlice = createSlice({
  name: "returns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReturns.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllReturns.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAllReturns.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchReturn.fulfilled, (state, action) => {
        state.singleData = action.payload
      })

      .addCase(approveReturn.fulfilled, applyUpdatedReturn)
      .addCase(rejectReturn.fulfilled, applyUpdatedReturn)
      .addCase(markReturnReceived.fulfilled, applyUpdatedReturn)
      .addCase(processReturn.fulfilled, applyUpdatedReturn)
  },
})

export default returnSlice.reducer
