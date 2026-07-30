import { createSliceFactory } from "@/utils/sliceFactory"
import type { Variant } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Variant>({
    name: "variants",
    endpoint: "/admin/catalog/variants/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
