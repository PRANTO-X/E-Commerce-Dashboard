import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapEnvelope } from "@/lib/api/envelope"
import type {
  InventoryTransaction,
  SetWarehouseStockPayload,
  StockAdjustmentPayload,
  StockReservation,
  VariantStockSummary,
  Warehouse,
  WarehouseStock,
} from "../types"

// Inventory is not a generic CRUD list (see comment in types.ts) — this slice hand-rolls
// thunks for the specific read/action endpoints the backend actually exposes.

interface InventoryState {
  warehouses: Warehouse[]
  reservations: StockReservation[]
  variantStock: Record<string, VariantStockSummary>
  variantTransactions: Record<string, InventoryTransaction[]>
  variantWarehouseStock: Record<string, WarehouseStock[]>
  isLoading: boolean
  error: unknown
}

const initialState: InventoryState = {
  warehouses: [],
  reservations: [],
  variantStock: {},
  variantTransactions: {},
  variantWarehouseStock: {},
  isLoading: false,
  error: null,
}

export const fetchWarehouses = createAsyncThunk(
  "inventory/fetchWarehouses",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/inventory/warehouses/")
      return unwrapEnvelope<Warehouse[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const createWarehouse = createAsyncThunk(
  "inventory/createWarehouse",
  async (payload: Omit<Warehouse, "id" | "created_at">, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/inventory/warehouses/", payload)
      return unwrapEnvelope<Warehouse>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchReservations = createAsyncThunk(
  "inventory/fetchReservations",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/inventory/reservations/")
      return unwrapEnvelope<StockReservation[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchVariantStock = createAsyncThunk(
  "inventory/fetchVariantStock",
  async (variantId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/inventory/variants/${variantId}/stock/`)
      return unwrapEnvelope<VariantStockSummary>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchVariantTransactions = createAsyncThunk(
  "inventory/fetchVariantTransactions",
  async (variantId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/inventory/variants/${variantId}/transactions/`)
      return { variantId, transactions: unwrapEnvelope<InventoryTransaction[]>(res.data) }
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchVariantWarehouseStock = createAsyncThunk(
  "inventory/fetchVariantWarehouseStock",
  async (variantId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/inventory/variants/${variantId}/warehouse-stock/`)
      return { variantId, stock: unwrapEnvelope<WarehouseStock[]>(res.data) }
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const setWarehouseStock = createAsyncThunk(
  "inventory/setWarehouseStock",
  async (payload: SetWarehouseStockPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/inventory/warehouses/stock/", payload)
      return unwrapEnvelope<WarehouseStock>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const adjustStock = createAsyncThunk(
  "inventory/adjustStock",
  async (payload: StockAdjustmentPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/inventory/adjustments/", payload)
      return unwrapEnvelope<InventoryTransaction>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.isLoading = false
        state.warehouses = action.payload
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses = [action.payload, ...state.warehouses]
      })

      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.reservations = action.payload
      })

      .addCase(fetchVariantStock.fulfilled, (state, action) => {
        state.variantStock[action.payload.variant_id] = action.payload
      })

      .addCase(fetchVariantTransactions.fulfilled, (state, action) => {
        state.variantTransactions[action.payload.variantId] = action.payload.transactions
      })

      .addCase(fetchVariantWarehouseStock.fulfilled, (state, action) => {
        state.variantWarehouseStock[action.payload.variantId] = action.payload.stock
      })

      .addCase(setWarehouseStock.fulfilled, (state, action) => {
        state.variantWarehouseStock[action.payload.variant] = [
          ...(state.variantWarehouseStock[action.payload.variant] ?? []).filter(
            (s) => s.warehouse !== action.payload.warehouse
          ),
          action.payload,
        ]
      })

      .addCase(adjustStock.fulfilled, (state, action) => {
        const variantId = action.payload.variant
        state.variantTransactions[variantId] = [
          action.payload,
          ...(state.variantTransactions[variantId] ?? []),
        ]
      })
  },
})

export default inventorySlice.reducer
