import { createAsyncThunk, createSlice, createAction } from "@reduxjs/toolkit"
import { api, extractApiError } from "@/lib/api/client"
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "@/lib/api/tokenStore"
import type { AuthUser, LoginPayload } from "../types"

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  bootstrapped: boolean
  error: unknown
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  bootstrapped: false,
  error: null,
}

interface LoginResponseData {
  access: string
  refresh: string
  user: AuthUser
}

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/customer/auth/login/", payload)
      const data = res.data.data as LoginResponseData
      setAccessToken(data.access)
      setRefreshToken(data.refresh)
      return data.user
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export const logout = createAsyncThunk("auth/logout", async () => {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await api.post("/customer/auth/logout/", { refresh: refreshToken })
    }
  } catch {
    // best-effort — clear the local session regardless of server response
  } finally {
    clearTokens()
  }
})

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_: void, { rejectWithValue }) => {
  try {
    const res = await api.get("/customer/auth/me/")
    return res.data.data as AuthUser
  } catch (err) {
    return rejectWithValue(extractApiError(err))
  }
})

// Silently restores a session from a persisted refresh token on app boot.
export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_: void, { dispatch, rejectWithValue }) => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return rejectWithValue(null)
    }
    try {
      const res = await api.post("/customer/auth/refresh/", { refresh: refreshToken })
      const access = res.data.data.access as string
      setAccessToken(access)
      return await dispatch(fetchMe()).unwrap()
    } catch (err) {
      clearTokens()
      return rejectWithValue(extractApiError(err))
    }
  }
)

// Dispatched by main.tsx when the axios client (src/lib/api/client.ts) gives up
// refreshing a session, so Redux state stays in sync without client.ts importing the store.
export const sessionExpired = createAction("auth/sessionExpired")

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.bootstrapped = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload ?? action.error
        state.isAuthenticated = false
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })

      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.bootstrapped = true
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.bootstrapped = true
      })

      .addCase(sessionExpired, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export default authSlice.reducer
