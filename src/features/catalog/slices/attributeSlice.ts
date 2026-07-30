import { createSliceFactory } from "@/utils/sliceFactory"
import type { Attribute } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Attribute>({
    name: "attributes",
    endpoint: "/admin/catalog/attributes/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
