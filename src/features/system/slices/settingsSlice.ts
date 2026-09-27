import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { defaultStoreSettings, type StoreSettings } from "@/features/system/settingsDefaults"

// Not sliceFactory-backed: a single settings document mutated through local reducers, with
// no list, no detail fetch, and no backend endpoint.

const settingsSlice = createSlice({
  name: "settings",
  initialState: defaultStoreSettings,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<StoreSettings>>) => {
      Object.assign(state, action.payload)
    },
    resetSettings: () => defaultStoreSettings,
  },
})

export const { updateSettings, resetSettings } = settingsSlice.actions

export default settingsSlice.reducer
