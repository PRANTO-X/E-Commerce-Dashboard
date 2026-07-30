import { createSliceFactory } from "@/utils/sliceFactory"
import type { AuditLog } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<AuditLog>({
    name: "auditLogs",
    endpoint: "/admin/audit/logs/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
