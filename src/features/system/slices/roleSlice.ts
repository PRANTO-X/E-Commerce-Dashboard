import { createSliceFactory } from "@/utils/sliceFactory"
import { roles, type Role } from "@/assets/Data"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<Role>({
    name: "roles",
    seed: roles,
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
