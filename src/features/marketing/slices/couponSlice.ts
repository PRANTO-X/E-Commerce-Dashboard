import { createSliceFactory } from "@/lib/sliceFactory"
import type { Coupon } from "../types"

// Coupons list is a bare, unpaginated array, and has no PUT (full update) — only
// list/create/retrieve/PATCH/delete, so updateData is not exported.
const { reducer, fetchAll, fetchSingle, postData, patchData, deleteData } =
  createSliceFactory<Coupon>({
    name: "coupons",
    endpoint: "/admin/coupons/",
  })

export { fetchAll, fetchSingle, postData, patchData, deleteData }

export default reducer
