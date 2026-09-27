import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory, withExtraCases } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type { Review } from "../types"

// Reviews has no pagination and no generic update — only list + approve/reject actions, so the
// factory backs just fetchAll; the two action thunks and the list mutations they trigger stay
// hand-rolled below, layered on top of the factory reducer.

const { reducer, fetchAll } = createSliceFactory<Review>({
  name: "reviews",
  endpoint: "/admin/reviews/",
})

export { fetchAll }

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

export default withExtraCases(reducer, (builder) => {
  builder
    .addCase(approveReview.fulfilled, (state, action) => {
      state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
    })
    .addCase(rejectReview.fulfilled, (state, action) => {
      state.data = state.data.map((r) => (r.id === action.payload.id ? action.payload : r))
    })
})
