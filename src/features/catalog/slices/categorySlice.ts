import { createSliceFactory } from "@/utils/sliceFactory"
import { categories, type Category } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Category>({
    name: "categories",
    seed: categories,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
