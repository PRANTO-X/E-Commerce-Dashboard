import { createSliceFactory } from "@/utils/sliceFactory"
import { reviews, type Review } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Review>({
    name: "reviews",
    seed: reviews,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
