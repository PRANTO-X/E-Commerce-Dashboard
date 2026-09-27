import {
  createAsyncThunk,
  createReducer,
  createSlice,
  type ActionReducerMapBuilder,
  type Reducer,
} from "@reduxjs/toolkit"
import { generateId } from "@/lib/utils"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapList, unwrapItem, type ListMeta } from "@/lib/api/envelope"

interface WithId {
  id: string
}

interface FetchAllParams {
  page?: number
  page_size?: number
  search?: string
  [key: string]: unknown
}

/**
 * Two modes, selected by whether `endpoint` is passed:
 *  - `endpoint` present: thunks call the real backend (used by migrated slices).
 *  - `endpoint` absent (`seed` only): thunks operate purely in-memory (legacy/not-yet-migrated slices).
 * The consumer-facing contract ({reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData})
 * and state shape are identical either way, so components never need to change when a slice migrates.
 */
export function createSliceFactory<T extends WithId>({
  name,
  endpoint,
  seed = [],
  initialSingleData,
}: {
  name: string
  endpoint?: string
  seed?: T[]
  /**
   * Initial `singleData`. Defaults to an empty object (the original behavior). Domains whose
   * components distinguish "not loaded yet" from "loaded" by checking `!singleData` must pass
   * `null` here, otherwise an empty object is truthy and detail pages render as broken.
   */
  initialSingleData?: T | null
}) {
  const resourceUrl = (id: string) => `${endpoint}${id}/`

  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params: FetchAllParams | undefined, { getState, rejectWithValue }) => {
      if (endpoint) {
        try {
          const { page = 1, page_size = 20, ...rest } = params ?? {}
          const res = await api.get(endpoint, { params: { page, page_size, ...rest } })
          const { items, meta } = unwrapList<T>(res.data, page, page_size)
          return { data: items, total: meta.count, meta }
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }

      const state = getState() as Record<string, { data: T[] } | undefined>
      const list = state[name]?.data ?? seed
      const search = params?.search?.trim().toLowerCase()

      const filtered = search
        ? list.filter((item) =>
            Object.values(item as Record<string, unknown>).some(
              (value) => typeof value === "string" && value.toLowerCase().includes(search)
            )
          )
        : list

      return { data: filtered, total: filtered.length, meta: null as ListMeta | null }
    }
  )

  const fetchSingle = createAsyncThunk(
    `${name}/fetchSingle`,
    async (id: string, { getState, rejectWithValue }) => {
      if (endpoint) {
        try {
          const res = await api.get(resourceUrl(id))
          return unwrapItem<T>(res.data)
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }

      const state = getState() as Record<string, { data: T[] } | undefined>
      const list = state[name]?.data ?? seed
      const item = list.find((i) => i.id === id)
      if (!item) {
        return rejectWithValue({ error: `${name} item "${id}" not found` })
      }
      return item
    }
  )

  const postData = createAsyncThunk(
    `${name}/postData`,
    async (
      { payload, onSuccess }: { payload: Partial<T>; onSuccess?: () => void },
      { rejectWithValue }
    ) => {
      if (endpoint) {
        try {
          const res = await api.post(endpoint, payload)
          const item = unwrapItem<T>(res.data)
          onSuccess?.()
          return item
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }

      const newItem = { ...payload, id: payload.id ?? generateId(name.toUpperCase()) } as T
      onSuccess?.()
      return newItem
    }
  )

  const updateData = createAsyncThunk(
    `${name}/updateData`,
    async ({ id, payload }: { id: string; payload: Partial<T> }, { rejectWithValue }) => {
      if (endpoint) {
        try {
          const res = await api.put(resourceUrl(id), payload)
          return unwrapItem<T>(res.data)
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }

      return { ...payload, id } as T
    }
  )

  const patchData = createAsyncThunk(
    `${name}/patchData`,
    async ({ id, payload }: { id: string; payload: Partial<T> }, { getState, rejectWithValue }) => {
      if (endpoint) {
        try {
          const res = await api.patch(resourceUrl(id), payload)
          return unwrapItem<T>(res.data)
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }

      const state = getState() as Record<string, { data: T[] } | undefined>
      const list = state[name]?.data ?? seed
      const existing = list.find((i) => i.id === id)
      return { ...(existing as object), ...payload, id } as T
    }
  )

  const deleteData = createAsyncThunk(
    `${name}/deleteData`,
    async (id: string, { rejectWithValue }) => {
      if (endpoint) {
        try {
          await api.delete(resourceUrl(id))
          return id
        } catch (err) {
          return rejectWithValue(extractApiError(err))
        }
      }
      return id
    }
  )

  const slice = createSlice({
    name,
    initialState: {
      data: seed, // For list of items
      singleData: (initialSingleData === undefined ? ({} as T) : initialSingleData) as unknown as T | Record<string, never>, // For single item details
      isLoading: false, // Loading state for all actions
      error: null as unknown, // Error handling
      totalItems: seed.length,
      meta: null as ListMeta | null, // server pagination info, populated once endpoint-backed
    },
    reducers: {},
    extraReducers: (builder) => {
      return builder
        // Fetch All
        .addCase(fetchAll.pending, (state) => {
          state.isLoading = true
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = action.payload.data as typeof state.data
          state.totalItems = action.payload.total
          state.meta = action.payload.meta
          state.error = null
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })

        // Fetch Single
        .addCase(fetchSingle.pending, (state) => {
          state.isLoading = true
        })
        .addCase(fetchSingle.fulfilled, (state, action) => {
          state.isLoading = false
          state.singleData = action.payload as typeof state.singleData
          state.error = null
        })
        .addCase(fetchSingle.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })

        // Post Data
        .addCase(postData.pending, (state) => {
          state.isLoading = true
        })
        .addCase(postData.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = [action.payload, ...state.data] as typeof state.data
          state.totalItems = state.data.length
          state.error = null
        })
        .addCase(postData.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })

        // Update Data
        .addCase(updateData.pending, (state) => {
          state.isLoading = true
        })
        .addCase(updateData.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = state.data.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ) as typeof state.data
          state.error = null
        })
        .addCase(updateData.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })

        // Patch Data
        .addCase(patchData.pending, (state) => {
          state.isLoading = true
        })
        .addCase(patchData.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = state.data.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ) as typeof state.data
          state.error = null
        })
        .addCase(patchData.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })

        // Delete Data
        .addCase(deleteData.pending, (state) => {
          state.isLoading = true
        })
        .addCase(deleteData.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = state.data.filter((item) => item.id !== action.payload)
          state.totalItems = state.data.length
          state.error = null
        })
        .addCase(deleteData.rejected, (state, action) => {
          state.isLoading = false
          state.error = action.payload ?? action.error
        })
    },
  })

  return {
    reducer: slice.reducer,
    fetchAll,
    fetchSingle,
    postData,
    updateData,
    patchData,
    deleteData,
  }
}

/**
 * Layers extra action cases on top of a factory-built reducer, for domains whose
 * action-endpoint thunks (approve/refund/process/...) also need to write to state.
 *
 * This exists because a slice's own thunks must be declared BEFORE their cases are
 * registered, while the factory call comes first — so the cases cannot be passed into
 * `createSliceFactory` options. Wrap the exported reducer instead:
 *
 *   const { reducer, fetchAll } = createSliceFactory<Review>({ name: "reviews", endpoint })
 *   export default withExtraCases(reducer, (builder) => {
 *     builder.addCase(approveReview.fulfilled, (state, action) => { ... })
 *   })
 *
 * Cases run after the factory's own, so they can rely on the factory's state shape.
 */
export function withExtraCases<S>(
  base: Reducer<S>,
  buildCases: (builder: ActionReducerMapBuilder<S>) => void
): Reducer<S> {
  const extra = createReducer(undefined as unknown as S, (builder) => {
    buildCases(builder)
    return builder
  })

  // `createReducer` returns the identical state reference for non-matching actions, so this
  // composition is a no-op for every action the extra cases don't handle.
  return (state, action) => extra(base(state, action), action)
}
