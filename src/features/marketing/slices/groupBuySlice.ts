import { createSliceFactory } from "@/utils/sliceFactory"
import type { GroupBuy } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<GroupBuy>({
    name: "groupBuys",
    endpoint: "/admin/marketing/group-buys/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
