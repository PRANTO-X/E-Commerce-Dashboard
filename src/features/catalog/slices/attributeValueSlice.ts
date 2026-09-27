import { createSliceFactory } from "@/lib/sliceFactory"
import type { AttributeValue } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<AttributeValue>({
    name: "attributeValues",
    endpoint: "/admin/catalog/attribute-values/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
