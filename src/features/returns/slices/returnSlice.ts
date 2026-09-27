import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory, withExtraCases } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { ApproveReturnPayload, RejectReturnPayload, ReturnRequest } from "../types"

const { reducer: baseReducer, fetchAll, fetchSingle } = createSliceFactory<ReturnRequest>({
  name: "returns",
  endpoint: "/admin/returns/",
  initialSingleData: null,
})

export { fetchAll as fetchAllReturns, fetchSingle as fetchReturn }

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

type ReturnState = ReturnType<typeof baseReducer>

const applyUpdatedReturn = (state: ReturnState, action: { payload: ReturnRequest }) => {
  state.singleData = action.payload
  state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
}

export default withExtraCases(baseReducer, (builder) => {
  builder
    .addCase(approveReturn.fulfilled, applyUpdatedReturn)
    .addCase(rejectReturn.fulfilled, applyUpdatedReturn)
    .addCase(markReturnReceived.fulfilled, applyUpdatedReturn)
    .addCase(processReturn.fulfilled, applyUpdatedReturn)
})
