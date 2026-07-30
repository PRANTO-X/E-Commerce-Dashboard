import { createSliceFactory } from "@/utils/sliceFactory"
import type { Campaign } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Campaign>({
    name: "campaigns",
    endpoint: "/admin/marketing/campaigns/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
