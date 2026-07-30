import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory } from "@/utils/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapItem } from "@/lib/api/envelope"
import type { OrderDetail, UpdatableOrderStatus } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<OrderDetail>({
    name: "orders",
    endpoint: "/admin/orders/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

// Action-only endpoints — not generic CRUD, so they live outside the factory. Callers
// should re-dispatch fetchSingle(id) afterward to refresh the detail page's state.singleData
// (these thunks intentionally don't touch Redux state themselves).

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/orders/${id}/cancel/`, { reason: reason ?? "" })
      return unwrapItem<OrderDetail>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const collectCod = createAsyncThunk(
  "orders/collectCod",
  async ({ id, amount }: { id: string; amount: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/orders/${id}/cod/collect/`, { amount })
      return unwrapItem<OrderDetail>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    { id, status, reason }: { id: string; status: UpdatableOrderStatus; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/admin/orders/${id}/status/`, { status, reason: reason ?? "" })
      return unwrapItem<OrderDetail>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export default reducer
