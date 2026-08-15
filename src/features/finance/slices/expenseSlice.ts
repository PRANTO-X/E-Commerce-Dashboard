import { createSliceFactory } from "@/utils/sliceFactory"
import type { Expense } from "../types"
import { initialExpenses } from "../data/initialExpenses"

const {
  reducer,
  fetchAll,
  fetchSingle,
  postData,
  updateData,
  patchData,
  deleteData,
} = createSliceFactory<Expense>({
  name: "expenses",
  seed: initialExpenses,
})

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }
export default reducer
