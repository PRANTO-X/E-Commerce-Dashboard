import { useEffect, useState, useCallback } from "react"
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
import { exportToCSV } from "@/lib/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { adjustStock } from "@/features/catalog/slices/inventorySlice"
import type { Variant } from "@/features/catalog/types"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { toast } from "sonner"
import { useDocumentTitle } from "@/hooks/use-document-title"

const VARIANT_LIST_PARAMS = { page: 1, page_size: 1000 } as const

/** Adjustments are signed deltas: a non-zero whole number (e.g. 10 to add, -5 to remove). */
function parseQuantityDelta(raw: string): number | null {
  const trimmed = raw.trim()
  if (!/^-?\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  return Number.isSafeInteger(n) && n !== 0 ? n : null
}

const Inventory = () => {
  useDocumentTitle("Inventory")

  const dispatch = useAppDispatch()
  const { data: variants, isLoading, error } = useAppSelector((state) => state.variants)
  const { data: products } = useAppSelector((state) => state.products)

  const [adjustingVariant, setAdjustingVariant] = useState<Variant | null>(null)
  const [quantityChanged, setQuantityChanged] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  // Single source of truth for the list query so the post-adjustment refetch matches the page load.
  const loadVariants = useCallback(() => dispatch(fetchAllVariants(VARIANT_LIST_PARAMS)), [dispatch])

  useEffect(() => {
    loadVariants()
    dispatch(fetchAllProducts({ page: 1, page_size: 100 }))
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
  }, [loadVariants, dispatch])

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "—"

  const filteredVariants = variants.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q)
  })

  const quantityDelta = parseQuantityDelta(quantityChanged)
  const resultingStock = adjustingVariant && quantityDelta !== null
    ? adjustingVariant.stock_quantity + quantityDelta
    : null
  const quantityError = !quantityChanged.trim()
    ? null
    : quantityDelta === null
      ? "Enter a whole number other than 0 (e.g. 10 or -5)"
      : null
  const canSubmit = quantityDelta !== null && !quantityError

  const handleAdjust = async () => {
    if (!adjustingVariant || quantityDelta === null || quantityError) return
    setSubmitting(true)
    try {
      await dispatch(
        adjustStock({
          variant_id: adjustingVariant.id,
          quantity_changed: quantityDelta,
          notes: notes.trim(),
        })
      ).unwrap()
      await loadVariants()
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
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as string} />
      ),
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
        <PageHeading
          title="Inventory"
          description="Track variant stock levels and record manual adjustments"
        />

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
        isLoading={isLoading}
        error={error}
        onRetry={loadVariants}
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
                  step={1}
                  inputMode="numeric"
                  placeholder="e.g. 10 or -5"
                  value={quantityChanged}
                  aria-invalid={!!quantityError}
                  aria-describedby="quantity_changed_hint"
                  onChange={(e) => setQuantityChanged(e.target.value)}
                />
                <p
                  id="quantity_changed_hint"
                  className={quantityError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
                >
                  {quantityError ??
                    (resultingStock !== null
                      ? `New stock will be ${resultingStock}`
                      : "Positive to add stock, negative to remove")}
                </p>
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
            <Button onClick={handleAdjust} disabled={submitting || !canSubmit}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Inventory
