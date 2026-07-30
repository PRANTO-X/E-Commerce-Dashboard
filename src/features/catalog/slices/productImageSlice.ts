import { createSliceFactory } from "@/utils/sliceFactory"
import type { ProductImage } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<ProductImage>({
    name: "productImages",
    endpoint: "/admin/catalog/product-images/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
