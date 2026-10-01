import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { AnalyticsSummary, ReturnsSummary, SalesPoint, TopProduct } from "../types"

// All 4 endpoints are read-only aggregates, not list resources, so this is plain thunks
// rather than sliceFactory.

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

export interface RequestState {
  status: RequestStatus
  error: unknown
}

interface AnalyticsState {
  summary: AnalyticsSummary | null
  sales: SalesPoint[]
  topProducts: TopProduct[]
  returns: ReturnsSummary | null
  /** Per-endpoint request state, so each chart can show its own loading/error/retry. */
  requests: {
    summary: RequestState
    sales: RequestState
    topProducts: RequestState
    returns: RequestState
  }
  // Kept for existing consumers; mirror requests.summary.
  isLoading: boolean
  error: unknown
}

const idle = (): RequestState => ({ status: "idle", error: null })

const initialState: AnalyticsState = {
  summary: null,
  sales: [],
  topProducts: [],
  returns: null,
  requests: { summary: idle(), sales: idle(), topProducts: idle(), returns: idle() },
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

const loading = (): RequestState => ({ status: "loading", error: null })
const succeeded = (): RequestState => ({ status: "succeeded", error: null })
const failed = (action: { payload?: unknown; error: unknown; meta: { aborted: boolean } }): RequestState =>
  action.meta.aborted ? idle() : { status: "failed", error: action.payload ?? action.error }

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.isLoading = true
        state.requests.summary = loading()
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.summary = action.payload
        state.requests.summary = succeeded()
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.isLoading = false
        state.requests.summary = failed(action)
        state.error = state.requests.summary.error
      })

      .addCase(fetchAnalyticsSales.pending, (state) => {
        state.requests.sales = loading()
      })
      .addCase(fetchAnalyticsSales.fulfilled, (state, action) => {
        state.sales = Array.isArray(action.payload) ? action.payload : []
        state.requests.sales = succeeded()
      })
      .addCase(fetchAnalyticsSales.rejected, (state, action) => {
        state.requests.sales = failed(action)
      })

      .addCase(fetchTopProducts.pending, (state) => {
        state.requests.topProducts = loading()
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = Array.isArray(action.payload) ? action.payload : []
        state.requests.topProducts = succeeded()
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.requests.topProducts = failed(action)
      })

      .addCase(fetchReturnsSummary.pending, (state) => {
        state.requests.returns = loading()
      })
      .addCase(fetchReturnsSummary.fulfilled, (state, action) => {
        state.returns = action.payload
        state.requests.returns = succeeded()
      })
      .addCase(fetchReturnsSummary.rejected, (state, action) => {
        state.requests.returns = failed(action)
      })
  },
})

export default analyticsSlice.reducer
