import { createSliceFactory } from "@/utils/sliceFactory"
import type { HomepageBanner } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<HomepageBanner>({
    name: "banners",
    endpoint: "/admin/cms/banners/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
