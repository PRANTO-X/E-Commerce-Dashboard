import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapItem } from "@/lib/api/envelope"
import type { RootState } from "@/app/store"
import type { OrderDetail, OrderListItem, UpdatableOrderStatus } from "../types"

// The factory has a single row type for both list and detail. List rows are typed as the
// (smaller) OrderListItem the list endpoint actually returns, so list consumers can't reach
// for detail-only fields (items, tax_amount, ...). The detail endpoint returns the full
// OrderDetail — read it through selectOrderDetail rather than state.orders.singleData.
const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<OrderListItem>({
    name: "orders",
    endpoint: "/admin/orders/",
    initialSingleData: null,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

/** The loaded order detail (state.orders.singleData), typed as what /admin/orders/{id}/ returns. */
export const selectOrderDetail = (state: RootState): OrderDetail | null =>
  (state.orders.singleData as OrderDetail | null) ?? null

/**
 * Fetches one order without writing to the orders slice — for pages that only need to look up
 * an order (e.g. a return's order number) and must not clobber the order detail page's state.
 */
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/orders/${id}/`)
      return unwrapItem<OrderDetail>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

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
