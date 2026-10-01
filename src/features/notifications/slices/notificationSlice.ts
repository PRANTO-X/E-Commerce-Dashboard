import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapList, unwrapEnvelope } from "@/lib/api/envelope"
import type { AdminNotification, AdminNotificationPreference } from "../types"

// Both endpoints are read-only (list only) — notifications are paginated (shape 3), while
// preferences comes back as a bare array wrapped in {data, message} (shape 1).
//
// Not sliceFactory-backed: state holds two independent collections (`notifications` and
// `preferences`) from two differently-shaped endpoints, so there is no single `data` list
// for the factory to own.

interface NotificationState {
  notifications: AdminNotification[]
  preferences: AdminNotificationPreference[]
  /** Notifications list request state. */
  isLoading: boolean
  error: unknown
  /** Preferences request state (separate endpoint, tracked independently). */
  preferencesLoading: boolean
  preferencesError: unknown
}

const initialState: NotificationState = {
  notifications: [],
  preferences: [],
  isLoading: false,
  error: null,
  preferencesLoading: false,
  preferencesError: null,
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/notifications/")
      return unwrapList<AdminNotification>(res.data).items
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const fetchNotificationPreferences = createAsyncThunk(
  "notifications/fetchPreferences",
  async (_: void | undefined, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/notifications/preferences/")
      return unwrapEnvelope<AdminNotificationPreference[]>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.preferencesLoading = true
        state.preferencesError = null
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false
        state.preferencesError = null
        state.preferences = action.payload
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false
        state.preferencesError = action.payload ?? action.error
      })
  },
})

export default notificationSlice.reducer
