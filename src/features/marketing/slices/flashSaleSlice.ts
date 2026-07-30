import { createSliceFactory } from "@/utils/sliceFactory"
import type { FlashSale } from "../types"

// Backend only exposes list+create for flash sales (no per-id retrieve/update/delete) —
// fetchSingle/updateData/patchData/deleteData exist for interface consistency but the UI
// only calls fetchAll/postData.
const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<FlashSale>({
    name: "flashSales",
    endpoint: "/admin/marketing/flash-sales/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
