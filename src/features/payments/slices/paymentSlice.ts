import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { Payment, RefundPayload } from "../types"

interface PaymentState {
  data: Payment[]
  singleData: Payment | null
  isLoading: boolean
  error: unknown
}

const initialState: PaymentState = {
  data: [],
  singleData: null,
  isLoading: false,
  error: null,
}

export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/payments/")
      return unwrapEnvelope<Payment[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchPayment = createAsyncThunk(
  "payments/fetchSingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/payments/${id}/`)
      return unwrapEnvelope<Payment>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

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

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchPayment.fulfilled, (state, action) => {
        state.singleData = action.payload
      })

      .addCase(refundPayment.fulfilled, (state, action) => {
        state.singleData = action.payload
        state.data = state.data.map((p) => (p.id === action.payload.id ? action.payload : p))
      })
  },
})

export default paymentSlice.reducer
