import { createSliceFactory } from "@/utils/sliceFactory"
import { coupons, type Coupon } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Coupon>({
    name: "coupons",
    seed: coupons,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
