import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/audit/slices/auditLogSlice"
import type { AuditLog } from "@/features/audit/types"

const AuditLogs = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [action, setAction] = useState("")
  const [targetType, setTargetType] = useState("")
  const { data: logs, totalItems, meta } = useAppSelector((state) => state.auditLogs)

  useEffect(() => {
    dispatch(
      fetchAll({
        page,
        ...(action.trim() ? { action: action.trim() } : {}),
        ...(targetType.trim() ? { target_type: targetType.trim() } : {}),
      })
    )
  }, [dispatch, page, action, targetType])

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: "actor_email", header: "ACTOR" },
    {
      accessorKey: "action",
      header: "ACTION",
      cell: ({ row }) => (
        <span className="text-sm font-mono text-muted-foreground">{row.getValue("action")}</span>
      ),
    },
    { accessorKey: "target_type", header: "TARGET TYPE" },
    {
      accessorKey: "ip_address",
      header: "IP ADDRESS",
      cell: ({ row }) => <span>{row.getValue("ip_address") || "—"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "DATE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track administrative actions performed across the system
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Filter by action (e.g. POST /api/v1/admin/orders/)"
          value={action}
          onChange={(e) => {
            setPage(1)
            setAction(e.target.value)
          }}
        />
        <Input
          placeholder="Filter by target type"
          value={targetType}
          onChange={(e) => {
            setPage(1)
            setTargetType(e.target.value)
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAction("")
            setTargetType("")
            setPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={["220px", "300px", "140px", "140px", "200px"]}
      />
    </div>
  )
}

export default AuditLogs
