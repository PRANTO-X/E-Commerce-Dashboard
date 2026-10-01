import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type {
  BookCourierShipmentPayload,
  CourierIntegration,
  CourierIntegrationPayload,
  CourierShipment,
  TrackingPayload,
  TrackingUpdatePayload,
} from "../types"

// Not sliceFactory-backed: `couriers` and `shipments` are two separate collections, and
// every mutating thunk is an action endpoint keyed by order/courier id (book, track, update)
// rather than a generic `{id}` resource route.

interface ShippingState {
  couriers: CourierIntegration[]
  shipments: CourierShipment[]
  /** Couriers list request state. */
  isLoading: boolean
  error: unknown
  /** Shipments list request state (separate so one list's failure doesn't mask the other). */
  shipmentsLoading: boolean
  shipmentsError: unknown
}

const initialState: ShippingState = {
  couriers: [],
  shipments: [],
  isLoading: false,
  error: null,
  shipmentsLoading: false,
  shipmentsError: null,
}

export const fetchCouriers = createAsyncThunk(
  "shipping/fetchCouriers",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/shipping/couriers/")
      return unwrapEnvelope<CourierIntegration[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const createCourier = createAsyncThunk(
  "shipping/createCourier",
  async (payload: CourierIntegrationPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/shipping/couriers/", payload)
      return unwrapEnvelope<CourierIntegration>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchShipments = createAsyncThunk(
  "shipping/fetchShipments",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/shipping/couriers/shipments/")
      return unwrapEnvelope<CourierShipment[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const bookCourierShipment = createAsyncThunk(
  "shipping/bookCourierShipment",
  async ({ orderId, payload }: { orderId: string; payload: BookCourierShipmentPayload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/shipping/orders/${orderId}/courier/`, payload)
      return unwrapEnvelope<CourierShipment>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const addTracking = createAsyncThunk(
  "shipping/addTracking",
  async ({ orderId, payload }: { orderId: string; payload: TrackingPayload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/admin/shipping/orders/${orderId}/tracking/`, payload)
      return unwrapEnvelope<unknown>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const updateTracking = createAsyncThunk(
  "shipping/updateTracking",
  async ({ orderId, payload }: { orderId: string; payload: TrackingUpdatePayload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/shipping/orders/${orderId}/tracking/update/`, payload)
      return unwrapEnvelope<unknown>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouriers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCouriers.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.couriers = action.payload
      })
      .addCase(fetchCouriers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(createCourier.fulfilled, (state, action) => {
        state.couriers = [action.payload, ...state.couriers]
      })

      .addCase(fetchShipments.pending, (state) => {
        state.shipmentsLoading = true
        state.shipmentsError = null
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.shipmentsLoading = false
        state.shipmentsError = null
        state.shipments = action.payload
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.shipmentsLoading = false
        state.shipmentsError = action.payload ?? action.error
      })

      .addCase(bookCourierShipment.fulfilled, (state, action) => {
        state.shipments = [
          action.payload,
          ...state.shipments.filter((s) => s.order !== action.payload.order),
        ]
      })
  },
})

export default shippingSlice.reducer
