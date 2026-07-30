import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { Review } from "../types"

// Reviews has no pagination and no generic update — only list + approve/reject actions.

interface ReviewState {
  data: Review[]
  isLoading: boolean
  error: unknown
}

const initialState: ReviewState = {
  data: [],
  isLoading: false,
  error: null,
}

export const fetchAll = createAsyncThunk(
  "reviews/fetchAll",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/reviews/")
      return unwrapEnvelope<Review[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const approveReview = createAsyncThunk(
  "reviews/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/reviews/${id}/approve/`)
      return unwrapEnvelope<Review>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const rejectReview = createAsyncThunk(
  "reviews/reject",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/reviews/${id}/reject/`)
      return unwrapEnvelope<Review>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const reviewSlice = createSlice({
  name: "reviews",
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

      .addCase(approveReview.fulfilled, (state, action) => {
        state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
      })
      .addCase(rejectReview.fulfilled, (state, action) => {
        state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
      })
  },
})

export default reviewSlice.reducer
