import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { defaultAuthSettings, type AuthSettings } from "@/features/system/settingsDefaults"
import {
  AUTH_SETTINGS_KEY,
  loadStoredSettings,
  writeStoredSettings,
} from "@/features/system/settingsStorage"

// Not sliceFactory-backed: a single settings document. There is no backend endpoint, so it
// is persisted to this browser's localStorage only — nothing here is enforced server-side.

export const saveAuthSettings = createAsyncThunk(
  "authSettings/save",
  async (settings: AuthSettings, { rejectWithValue }) => {
    try {
      writeStoredSettings(AUTH_SETTINGS_KEY, settings)
      return settings
    } catch (err) {
      return rejectWithValue({ error: err instanceof Error ? err.message : "Could not save settings" })
    }
  }
)

const authSettingsSlice = createSlice({
  name: "authSettings",
  initialState: loadStoredSettings(AUTH_SETTINGS_KEY, defaultAuthSettings),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(saveAuthSettings.fulfilled, (_state, action) => action.payload)
  },
})

export default authSettingsSlice.reducer
