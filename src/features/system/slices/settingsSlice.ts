import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { defaultStoreSettings, type StoreSettings } from "@/features/system/settingsDefaults"
import {
  STORE_SETTINGS_KEY,
  clearStoredSettings,
  loadStoredSettings,
  writeStoredSettings,
} from "@/features/system/settingsStorage"

// Not sliceFactory-backed: a single settings document. There is no backend settings
// endpoint, so it is persisted to this browser's localStorage (see settingsStorage.ts).

export const saveSettings = createAsyncThunk(
  "settings/save",
  async (settings: StoreSettings, { rejectWithValue }) => {
    try {
      writeStoredSettings(STORE_SETTINGS_KEY, settings)
      return settings
    } catch (err) {
      return rejectWithValue({ error: err instanceof Error ? err.message : "Could not save settings" })
    }
  }
)

export const resetSettings = createAsyncThunk("settings/reset", async () => {
  clearStoredSettings(STORE_SETTINGS_KEY)
  return defaultStoreSettings
})

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadStoredSettings(STORE_SETTINGS_KEY, defaultStoreSettings),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveSettings.fulfilled, (_state, action) => action.payload)
      .addCase(resetSettings.fulfilled, (_state, action) => action.payload)
  },
})

export default settingsSlice.reducer
