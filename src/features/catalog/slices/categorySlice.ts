import { createSliceFactory } from "@/utils/sliceFactory"
import type { Category } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Category>({
    name: "categories",
    endpoint: "/admin/catalog/categories/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
