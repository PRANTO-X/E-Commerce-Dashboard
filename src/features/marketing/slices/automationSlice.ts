import { createSliceFactory } from "@/utils/sliceFactory"
import type { AutomationEvent } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<AutomationEvent>({
    name: "automations",
    endpoint: "/admin/marketing/automations/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
