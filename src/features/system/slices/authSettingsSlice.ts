import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { defaultAuthSettings, type AuthSettings } from "@/features/system/settingsDefaults"

// Not sliceFactory-backed: a single settings document mutated through a local reducer, with
// no list, no detail fetch, and no backend endpoint.

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
