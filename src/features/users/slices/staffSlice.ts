import { createSliceFactory } from "@/utils/sliceFactory"
import { staffs, type Staff } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Staff>({
    name: "staffs",
    seed: staffs,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
