import { createSliceFactory } from "@/utils/sliceFactory"
import { inventory, type InventoryItem } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<InventoryItem>({
    name: "inventory",
    seed: inventory,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
