import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, SlidersHorizontal } from "lucide-react"
import InventoryStatsCards from "./InventoryStatsCards"
import type { ColumnDef } from "@tanstack/react-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DataTable } from "@/components/common/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { adjustStock } from "@/features/catalog/slices/inventorySlice"
import type { Variant } from "@/features/catalog/types"
import { toast } from "sonner"

const statusStyles = {
  active: "bg-green-500/10 text-green-400 border border-green-500/20",
  inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
} as const

const Inventory = () => {
  const dispatch = useAppDispatch()
  const { data: variants } = useAppSelector((state) => state.variants)
  const { data: products } = useAppSelector((state) => state.products)

  const [adjustingVariant, setAdjustingVariant] = useState<Variant | null>(null)
  const [quantityChanged, setQuantityChanged] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    dispatch(fetchAllVariants({ page: 1, page_size: 1000 }))
    dispatch(fetchAllProducts({ page: 1, page_size: 100 }))
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
  }, [dispatch])

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "—"

  const filteredVariants = variants.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
  })

  const handleAdjust = async () => {
    if (!adjustingVariant || !quantityChanged.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        adjustStock({
          variant_id: adjustingVariant.id,
          quantity_changed: Number(quantityChanged),
          notes: notes.trim(),
        })
      ).unwrap()
      await dispatch(fetchAllVariants({ page: 1, page_size: 100 }))
      toast.success(`Stock adjusted for ${adjustingVariant.name}`)
      setAdjustingVariant(null)
      setQuantityChanged("")
      setNotes("")
    } catch {
      toast.error("Failed to adjust stock")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<Variant>[] = [
    {
      accessorKey: "name",
      header: "VARIANT",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{productName(row.getValue("product"))}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("sku")}</span>
      ),
    },
    {
      accessorKey: "stock_quantity",
      header: "STOCK",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.getValue("stock_quantity")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusStyles
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "price",
      header: "PRICE",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">
          ${Number(row.getValue("price")).toFixed(2)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdjustingVariant(row.original)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Adjust
        </Button>
      ),
    },
  ]

  const csvData = filteredVariants.map((v) => ({
    Variant: v.name,
    Product: productName(v.product),
    SKU: v.sku,
    Stock: v.stock_quantity,
    Status: v.status,
    Price: v.price,
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track variant stock levels and record manual adjustments
          </p>
        </div>

        <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Inventory")}>
          <DownloadIcon className="size-5" />
          Export CSV
        </Button>
      </div>

      <InventoryStatsCards />

      <FilterToolbar
        searchPlaceholder="search variant or SKU..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <DataTable
        columns={columns}
        data={filteredVariants}
        onRowClick={(v) => setAdjustingVariant(v)}
        minWidth="980px"
        columnWidths={["220px", "180px", "140px", "100px", "110px", "110px", "120px"]}
      />

      <Dialog open={!!adjustingVariant} onOpenChange={(open) => !open && setAdjustingVariant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {adjustingVariant ? `${adjustingVariant.name} · currently ${adjustingVariant.stock_quantity} in stock` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="quantity_changed">Quantity Change</FieldLabel>
              <FieldContent>
                <Input
                  id="quantity_changed"
                  type="number"
                  placeholder="e.g. 10 or -5"
                  value={quantityChanged}
                  onChange={(e) => setQuantityChanged(e.target.value)}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <FieldContent>
                <Textarea
                  id="notes"
                  placeholder="Reason for adjustment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FieldContent>
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustingVariant(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={submitting || !quantityChanged.trim()}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Inventory
