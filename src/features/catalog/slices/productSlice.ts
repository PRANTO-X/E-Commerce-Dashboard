import { createSliceFactory } from "@/utils/sliceFactory"
import type { Product } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Product>({
    name: "products",
    endpoint: "/admin/catalog/products/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
