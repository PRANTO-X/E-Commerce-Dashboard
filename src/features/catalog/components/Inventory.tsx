import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import InventoryStatsCards from "./InventoryStatsCards"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import { categoryOptions, type InventoryItem } from "@/assets/Data"
import { TableActions } from "@/components/common/TableActions"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/catalog/slices/inventorySlice"
import { toast } from "sonner"
const Inventory = () => {
  const dispatch = useAppDispatch()
  const { data: inventory } = useAppSelector((state) => state.inventory)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])
  const statusOptions = [
    { label: "In Stock", value: "in_stock" },
    { label: "Low Stock", value: "low_stock" },
    { label: "Out of Stock", value: "out_of_stock" },
  ]

  const statusStyles = {
    "In Stock": "bg-green-500/10 text-green-400 border border-green-500/20",

    "Low Stock": "bg-amber-500/10 text-amber-400 border border-amber-500/20",

    "Out of Stock": "bg-red-500/10 text-red-400 border border-red-500/20",
  } as const

  type stockStatus = keyof typeof statusStyles

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "id",
      header: "PRODUCT ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("product")}
        </span>
      ),
    },

    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("sku")}
        </span>
      ),
    },

    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("category")}
        </span>
      ),
    },

    {
      accessorKey: "stock",
      header: "STOCK",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number

        return (
          <span className="text-sm font-medium text-foreground">{stock}</span>
        )
      },
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as stockStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[status]
            }`}
          >
            {status}
          </span>
        )
      },
    },

    {
      accessorKey: "price",
      header: "PRICE",
      cell: ({ row }) => {
        const price = row.getValue("price") as number

        return (
          <span className="text-sm font-semibold text-foreground">
            ${price.toFixed(2)}
          </span>
        )
      },
    },

    {
      accessorKey: "lastRestocked",
      header: "LAST RESTOCKED",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {row.getValue("lastRestocked")}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const product = row.original

        const handleDelete = () => {
          dispatch(deleteData(product.id))
          toast.success(`${product.product} removed from inventory`)
        }

        return (
          <TableActions
            itemName={product.product}
            viewUrl={`/product_detail/${product.id}`}
            onDelete={handleDelete}
          />
        )
      },
    },
  ]

  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Inventory
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage enterprise assets and stock levels
          </p>
        </div>

        <Button
          variant="primary"
          size="action"
          onClick={() => exportToCSV(inventory, "Inventory")}
        >
          <DownloadIcon className="size-5" />
          Export CSV
        </Button>
      </div>

      <InventoryStatsCards />

      <FilterToolbar
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={statusOptions}
                placeholder="Stock Status"
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={categoryOptions}
                placeholder="Categories"
              />
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={inventory}
        columnWidths={[
          "120px",
          "240px",
          "160px",
          "100px",
          "140px",
          "130px",
          "140px",
          "140px",
          "100px",
        ]}
      />
    </div>
  )
}

export default Inventory
