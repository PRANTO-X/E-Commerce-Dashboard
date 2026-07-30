import { createSliceFactory } from "@/utils/sliceFactory"
import type { ContentPage } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<ContentPage>({
    name: "pages",
    endpoint: "/admin/cms/pages/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
