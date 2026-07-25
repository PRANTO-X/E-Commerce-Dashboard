import { createSliceFactory } from "@/utils/sliceFactory"
import { campaigns, type Campaign } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Campaign>({
    name: "campaigns",
    seed: campaigns,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
