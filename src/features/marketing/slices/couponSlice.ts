import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapItem, unwrapEnvelope } from "@/lib/api/envelope"
import type { Coupon } from "../types"

// Coupons list is a bare, unpaginated array, and has no PUT (full update) — only
// list/create/retrieve/PATCH/delete — so this is bespoke rather than sliceFactory-based.

interface CouponState {
  data: Coupon[]
  singleData: Coupon | null
  isLoading: boolean
  error: unknown
  totalItems: number
}

const initialState: CouponState = {
  data: [],
  singleData: null,
  isLoading: false,
  error: null,
  totalItems: 0,
}

export const fetchAll = createAsyncThunk(
  "coupons/fetchAll",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/coupons/")
      return unwrapEnvelope<Coupon[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchSingle = createAsyncThunk(
  "coupons/fetchSingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/coupons/${id}/`)
      return unwrapItem<Coupon>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const postData = createAsyncThunk(
  "coupons/postData",
  async ({ payload, onSuccess }: { payload: Partial<Coupon>; onSuccess?: () => void }, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/coupons/", payload)
      const item = unwrapItem<Coupon>(res.data)
      onSuccess?.()
      return item
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const patchData = createAsyncThunk(
  "coupons/patchData",
  async ({ id, payload }: { id: string; payload: Partial<Coupon> }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/coupons/${id}/`, payload)
      return unwrapItem<Coupon>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const deleteData = createAsyncThunk(
  "coupons/deleteData",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/coupons/${id}/`)
      return id
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const couponSlice = createSlice({
  name: "coupons",
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
        state.totalItems = action.payload.length
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
        state.totalItems = state.data.length
      })

      .addCase(patchData.fulfilled, (state, action) => {
        state.data = state.data.map((c) => (c.id === action.payload.id ? action.payload : c))
        state.singleData = action.payload
      })

      .addCase(deleteData.fulfilled, (state, action) => {
        state.data = state.data.filter((c) => c.id !== action.payload)
        state.totalItems = state.data.length
      })
  },
})

export default couponSlice.reducer
