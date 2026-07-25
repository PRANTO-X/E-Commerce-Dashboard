import { createSliceFactory } from "@/utils/sliceFactory"
import { vendors, type Vendor } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Vendor>({
    name: "vendors",
    seed: vendors,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
