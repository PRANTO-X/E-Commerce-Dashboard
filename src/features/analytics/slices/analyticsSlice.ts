import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { AnalyticsSummary, ReturnsSummary, SalesPoint, TopProduct } from "../types"

// All 4 endpoints are read-only aggregates, not list resources, so this is plain thunks
// rather than sliceFactory.

interface AnalyticsState {
  summary: AnalyticsSummary | null
  sales: SalesPoint[]
  topProducts: TopProduct[]
  returns: ReturnsSummary | null
  isLoading: boolean
  error: unknown
}

const initialState: AnalyticsState = {
  summary: null,
  sales: [],
  topProducts: [],
  returns: null,
  isLoading: false,
  error: null,
}

export const fetchAnalyticsSummary = createAsyncThunk(
  "analytics/fetchSummary",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/analytics/summary/")
      return unwrapEnvelope<AnalyticsSummary>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchAnalyticsSales = createAsyncThunk(
  "analytics/fetchSales",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/analytics/sales/")
      return unwrapEnvelope<SalesPoint[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchTopProducts = createAsyncThunk(
  "analytics/fetchTopProducts",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/analytics/products/top/")
      return unwrapEnvelope<TopProduct[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchReturnsSummary = createAsyncThunk(
  "analytics/fetchReturns",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/analytics/returns/")
      return unwrapEnvelope<ReturnsSummary>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.summary = action.payload
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchAnalyticsSales.fulfilled, (state, action) => {
        state.sales = action.payload
      })

      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload
      })

      .addCase(fetchReturnsSummary.fulfilled, (state, action) => {
        state.returns = action.payload
      })
  },
})

export default analyticsSlice.reducer
