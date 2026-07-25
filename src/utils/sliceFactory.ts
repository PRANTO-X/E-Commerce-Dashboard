import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { generateId } from "@/lib/utils"

/**
 * Same slice shape/action names as the createSliceFactory used in the
 * blog-app admin panel (data/singleData/isLoading/error/totalItems +
 * fetchAll/fetchSingle/postData/updateData/patchData/deleteData thunks) —
 * but reading/writing an in-memory seed array instead of calling axios/a
 * `url`, since there's no backend yet. Swapping in real API calls later
 * only means rewriting the bodies of the thunks below, not any component
 * that dispatches them.
 */

interface WithId {
  id: string
}

interface FetchAllParams {
  search?: string
}

export function createSliceFactory<T extends WithId>({
  name,
  seed,
}: {
  name: string
  seed: T[]
}) {
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params: FetchAllParams | undefined, { getState }) => {
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

      return { data: filtered, total: filtered.length }
    }
  )

  const fetchSingle = createAsyncThunk(
    `${name}/fetchSingle`,
    async (id: string, { getState, rejectWithValue }) => {
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
    async ({ payload, onSuccess }: { payload: Partial<T>; onSuccess?: () => void }) => {
      const newItem = { ...payload, id: payload.id ?? generateId(name.toUpperCase()) } as T
      onSuccess?.()
      return newItem
    }
  )

  const updateData = createAsyncThunk(
    `${name}/updateData`,
    async ({ id, payload }: { id: string; payload: Partial<T> }) => {
      return { ...payload, id } as T
    }
  )

  const patchData = createAsyncThunk(
    `${name}/patchData`,
    async ({ id, payload }: { id: string; payload: Partial<T> }, { getState }) => {
      const state = getState() as Record<string, { data: T[] } | undefined>
      const list = state[name]?.data ?? seed
      const existing = list.find((i) => i.id === id)
      return { ...(existing as object), ...payload, id } as T
    }
  )

  const deleteData = createAsyncThunk(`${name}/deleteData`, async (id: string) => id)

  const slice = createSlice({
    name,
    initialState: {
      data: seed, // For list of items
      singleData: {} as T | Record<string, never>, // For single item details
      isLoading: false, // Loading state for all actions
      error: null as unknown, // Error handling
      totalItems: seed.length,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Fetch All
        .addCase(fetchAll.pending, (state) => {
          state.isLoading = true
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.isLoading = false
          state.data = action.payload.data as typeof state.data
          state.totalItems = action.payload.total
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
