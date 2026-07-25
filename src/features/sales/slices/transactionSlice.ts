import { createSliceFactory } from "@/utils/sliceFactory"
import { transactions, type TransactionItem } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<TransactionItem>({
    name: "transactions",
    seed: transactions,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
