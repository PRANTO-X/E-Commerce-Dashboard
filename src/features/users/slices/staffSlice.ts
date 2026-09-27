import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSliceFactory } from "@/lib/sliceFactory"
import { api, extractApiError } from "@/lib/api/client"
import { unwrapItem } from "@/lib/api/envelope"
import type { AdminUser, PermissionCode } from "../types"

const { reducer, fetchAll, fetchSingle, postData, patchData } = createSliceFactory<AdminUser>({
  name: "staffs",
  endpoint: "/admin/staff/",
  initialSingleData: null,
})

export { fetchAll, fetchSingle, postData, patchData }

// Action-only endpoint — permissions are a sub-resource of the staff member, not generic
// CRUD, so it lives outside the factory. Callers should re-dispatch fetchSingle(id) afterward
// to refresh the detail page's state.singleData (this thunk intentionally doesn't touch
// Redux state itself).

export const updateStaffPermissions = createAsyncThunk(
  "staffs/updatePermissions",
  async (
    { id, changes }: { id: string; changes: { code: PermissionCode; enabled: boolean }[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/admin/staff/${id}/permissions/`, { permissions: changes })
      return unwrapItem<AdminUser>(res.data)
    } catch (err) {
      return rejectWithValue(extractApiError(err))
    }
  }
)

export default reducer
