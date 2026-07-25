import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { defaultAuthSettings, type AuthSettings } from "@/assets/Data"

const authSettingsSlice = createSlice({
  name: "authSettings",
  initialState: defaultAuthSettings,
  reducers: {
    updateAuthSettings: (state, action: PayloadAction<Partial<AuthSettings>>) => {
      Object.assign(state, action.payload)
    },
  },
})

export const { updateAuthSettings } = authSettingsSlice.actions

export default authSettingsSlice.reducer
