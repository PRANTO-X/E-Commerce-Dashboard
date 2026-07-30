import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapList, unwrapEnvelope } from "@/lib/api/envelope"
import type { AdminNotification, AdminNotificationPreference } from "../types"

// Both endpoints are read-only (list only) — notifications are paginated (shape 3), while
// preferences comes back as a bare array wrapped in {data, message} (shape 1).

interface NotificationState {
  notifications: AdminNotification[]
  preferences: AdminNotificationPreference[]
  isLoading: boolean
  error: unknown
}

const initialState: NotificationState = {
  notifications: [],
  preferences: [],
  isLoading: false,
  error: null,
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
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
      })

      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload
      })
  },
})

export default notificationSlice.reducer
