import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory, withExtraCases } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { Payment, RefundPayload } from "../types"

const { reducer: baseReducer, fetchAll, fetchSingle } = createSliceFactory<Payment>({
  name: "payments",
  endpoint: "/admin/payments/",
  initialSingleData: null,
})

export { fetchAll as fetchAllPayments, fetchSingle as fetchPayment }

export const refundPayment = createAsyncThunk(
  "payments/refund",
  async ({ id, payload }: { id: string; payload: RefundPayload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/payments/${id}/refund/`, payload)
      return unwrapEnvelope<Payment>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export default withExtraCases(baseReducer, (builder) => {
  builder.addCase(refundPayment.fulfilled, (state, action) => {
    state.singleData = action.payload
    state.data = state.data.map((p) => (p.id === action.payload.id ? action.payload : p))
  })
})
