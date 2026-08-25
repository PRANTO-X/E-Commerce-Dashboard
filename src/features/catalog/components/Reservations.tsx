import { useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchReservations } from "@/features/catalog/slices/inventorySlice"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import type { StockReservation, StockReservationStatus } from "@/features/catalog/types"

const Reservations = () => {
  const dispatch = useAppDispatch()
  const { reservations, isLoading, error } = useAppSelector((state) => state.inventory)
  const { data: variants } = useAppSelector((state) => state.variants)

  const loadReservations = useCallback(() => {
    dispatch(fetchReservations())
  }, [dispatch])

  useEffect(() => {
    loadReservations()
    dispatch(fetchAllVariants({ page: 1, page_size: 100 }))
  }, [loadReservations, dispatch])

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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as StockReservationStatus} />
      ),
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
      <PageHeading
        title="Stock Reservations"
        description="Active stock holds from in-progress checkouts and orders"
      />

      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        error={error}
        onRetry={loadReservations}
        showPagination={false}
        minWidth="900px"
        columnWidths={["260px", "110px", "120px", "200px", "200px"]}
      />
    </div>
  )
}

export default Reservations
