import { createSliceFactory } from "@/utils/sliceFactory"
import { customers, type Customer } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Customer>({
    name: "customers",
    seed: customers,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
