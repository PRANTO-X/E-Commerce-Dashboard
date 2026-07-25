import { createSliceFactory } from "@/utils/sliceFactory"
import { orders, type Order } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Order>({
    name: "orders",
    seed: orders,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
