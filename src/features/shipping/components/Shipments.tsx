import { useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link, useNavigate } from "react-router-dom"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchShipments } from "@/features/shipping/slices/shippingSlice"
import type { CourierShipment, CourierShipmentStatus } from "@/features/shipping/types"

const Shipments = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { shipments, isLoading, error } = useAppSelector((state) => state.shipping)

  const loadShipments = useCallback(() => {
    dispatch(fetchShipments())
  }, [dispatch])

  useEffect(() => {
    loadShipments()
  }, [loadShipments])

  const columns: ColumnDef<CourierShipment>[] = [
    {
      accessorKey: "order_number",
      header: "ORDER",
      cell: ({ row }) => (
        <Link to={`/order_detail/${row.original.order}`} className="text-sm font-medium text-primary">
          {row.getValue("order_number")}
        </Link>
      ),
    },
    {
      accessorKey: "provider",
      header: "PROVIDER",
      cell: ({ row }) => <span className="capitalize">{row.getValue("provider")}</span>,
    },
    { accessorKey: "tracking_number", header: "TRACKING #" },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as CourierShipmentStatus} />
      ),
    },
  ]

  return (
    <div className="section-container">
      <PageHeading
        title="Shipments"
        description="Courier bookings made for customer orders"
      />

      <DataTable
        columns={columns}
        data={shipments}
        isLoading={isLoading}
        error={error}
        onRetry={loadShipments}
        onRowClick={(s) => navigate(`/order_detail/${s.order}`)}
        showPagination={false}
        minWidth="750px"
        columnWidths={["160px", "140px", "180px", "120px"]}
      />

    </div>
  )
}

export default Shipments
