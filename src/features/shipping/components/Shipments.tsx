import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link, useNavigate } from "react-router-dom"
import { DataTable } from "@/components/common/data-table"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchShipments } from "@/features/shipping/slices/shippingSlice"
import type { CourierShipment, CourierShipmentStatus } from "@/features/shipping/types"

const statusStyles: Record<CourierShipmentStatus, string> = {
  draft: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  booked: "bg-green-500/10 text-green-400 border border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
}

const Shipments = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { shipments } = useAppSelector((state) => state.shipping)

  useEffect(() => {
    dispatch(fetchShipments())
  }, [dispatch])

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
      cell: ({ row }) => {
        const status = row.getValue("status") as CourierShipmentStatus
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Shipments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Courier bookings made for customer orders
        </p>
      </div>

      <DataTable
        columns={columns}
        data={shipments}
        onRowClick={(s) => navigate(`/order_detail/${s.order}`)}
        showPagination={false}
        minWidth="750px"
        columnWidths={["160px", "140px", "180px", "120px"]}
      />

    </div>
  )
}

export default Shipments
