import { createSliceFactory } from "@/utils/sliceFactory"
import type { BundleItem } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<BundleItem>({
    name: "bundleItems",
    endpoint: "/admin/catalog/bundle-items/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
