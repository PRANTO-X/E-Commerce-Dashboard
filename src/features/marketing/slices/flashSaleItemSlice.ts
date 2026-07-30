import { createSliceFactory } from "@/utils/sliceFactory"
import type { FlashSaleItem } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<FlashSaleItem>({
    name: "flashSaleItems",
    endpoint: "/admin/marketing/flash-sale-items/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
