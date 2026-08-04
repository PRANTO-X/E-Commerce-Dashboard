import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchReservations } from "@/features/catalog/slices/inventorySlice"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import type { StockReservation, StockReservationStatus } from "@/features/catalog/types"

const statusStyles: Record<StockReservationStatus, string> = {
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  consumed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  released: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  expired: "bg-red-500/10 text-red-400 border border-red-500/20",
}

const Reservations = () => {
  const dispatch = useAppDispatch()
  const { reservations } = useAppSelector((state) => state.inventory)
  const { data: variants } = useAppSelector((state) => state.variants)

  useEffect(() => {
    dispatch(fetchReservations())
    dispatch(fetchAllVariants({ page: 1, page_size: 100 }))
  }, [dispatch])

  const variantLabel = (id: string) => {
    const variant = variants.find((v) => v.id === id)
    return variant ? `${variant.name} (${variant.sku})` : id
  }

  const columns: ColumnDef<StockReservation>[] = [
    {
      accessorKey: "variant",
      header: "VARIANT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{variantLabel(row.getValue("variant"))}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "QUANTITY",
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as StockReservationStatus
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "expires_at",
      header: "EXPIRES AT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("expires_at")).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "CREATED AT",
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
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Stock Reservations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Active stock holds from in-progress checkouts and orders
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        showPagination={false}
        columnWidths={["260px", "110px", "120px", "200px", "200px"]}
      />
    </div>
  )
}

export default Reservations
