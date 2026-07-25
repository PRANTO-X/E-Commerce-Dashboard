import { createSliceFactory } from "@/utils/sliceFactory"
import { products, type ProductItem } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<ProductItem>({
    name: "products",
    seed: products,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
