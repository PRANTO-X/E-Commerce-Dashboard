import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { defaultStoreSettings, type StoreSettings } from "@/assets/Data"

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
