import { createSliceFactory } from "@/utils/sliceFactory"
import { commissionRules, type CommissionRule } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<CommissionRule>({
    name: "commissionRules",
    seed: commissionRules,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
