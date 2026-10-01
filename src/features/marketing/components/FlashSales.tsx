import { useEffect, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllFlashSales, postData as postFlashSale } from "@/features/marketing/slices/flashSaleSlice"
import { fetchAll as fetchAllFlashSaleItems, postData as postFlashSaleItem } from "@/features/marketing/slices/flashSaleItemSlice"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency, fromDatetimeLocal } from "@/lib/format"

const saleSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    starts_at: z.string().min(1, "Start date is required"),
    ends_at: z.string().min(1, "End date is required"),
  })
  .refine((v) => new Date(v.ends_at).getTime() > new Date(v.starts_at).getTime(), {
    message: "End must be after the start",
    path: ["ends_at"],
  })

const itemSchema = z.object({
  variant: z.string().min(1, "Select a variant"),
  sale_price: z.number({ error: "Enter a sale price" }).gt(0, "Price must be greater than 0"),
  stock_limit: z
    .number({ error: "Enter a stock limit" })
    .int("Must be a whole number")
    .min(1, "Stock limit must be at least 1"),
})

type FieldErrors = Partial<Record<string, string[]>>
const asErrors = (messages?: string[]) => messages?.map((message) => ({ message }))
const toNumber = (value: string) => (value.trim() === "" ? Number.NaN : Number(value))

const FlashSales = () => {
  useDocumentTitle("Flash Sales")

  const dispatch = useAppDispatch()
  const { data: flashSales } = useAppSelector((state) => state.flashSales)
  const { data: items } = useAppSelector((state) => state.flashSaleItems)
  const { data: variants } = useAppSelector((state) => state.variants)

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saleErrors, setSaleErrors] = useState<FieldErrors>({})
  const [itemErrors, setItemErrors] = useState<FieldErrors>({})

  const [itemVariant, setItemVariant] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemStock, setItemStock] = useState("")

  useEffect(() => {
    dispatch(fetchAllFlashSales({ page: 1, page_size: 100 }))
    dispatch(fetchAllFlashSaleItems({ page: 1, page_size: 100 }))
    dispatch(fetchAllVariants({ page: 1, page_size: 100 }))
  }, [dispatch])

  const selectedSale = flashSales.find((s) => s.id === selectedSaleId)
  const itemsForSale = items.filter((i) => i.flash_sale === selectedSaleId)

  const handleCreateSale = async () => {
    const parsed = saleSchema.safeParse({ name, starts_at: startsAt, ends_at: endsAt })
    if (!parsed.success) {
      setSaleErrors(z.flattenError(parsed.error).fieldErrors)
      return
    }
    setSaleErrors({})
    setSubmitting(true)
    try {
      const created = await dispatch(
        postFlashSale({
          payload: {
            name: name.trim(),
            starts_at: fromDatetimeLocal(startsAt) ?? "",
            ends_at: fromDatetimeLocal(endsAt) ?? "",
            is_active: isActive,
            campaign: null,
          },
        })
      ).unwrap()
      toast.success(`${name} created`)
      setSelectedSaleId(created.id)
      setName("")
      setStartsAt("")
      setEndsAt("")
      setIsActive(true)
    } catch {
      toast.error("Failed to create flash sale")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddItem = async () => {
    if (!selectedSaleId) return
    const parsed = itemSchema.safeParse({
      variant: itemVariant,
      sale_price: toNumber(itemPrice),
      stock_limit: toNumber(itemStock),
    })
    if (!parsed.success) {
      setItemErrors(z.flattenError(parsed.error).fieldErrors)
      return
    }
    setItemErrors({})
    setSubmitting(true)
    try {
      await dispatch(
        postFlashSaleItem({
          payload: {
            flash_sale: selectedSaleId,
            variant: itemVariant,
            sale_price: String(parsed.data.sale_price),
            stock_limit: parsed.data.stock_limit,
          },
        })
      ).unwrap()
      toast.success("Item added to flash sale")
      setItemVariant("")
      setItemPrice("")
      setItemStock("")
    } catch {
      toast.error("Failed to add item")
    } finally {
      setSubmitting(false)
    }
  }

  const variantLabel = (id: string) => {
    const v = variants.find((v) => v.id === id)
    return v ? `${v.name} (${v.sku})` : id
  }

  return (
    <div className="section-container">
      <PageHeading
        title="Flash Sales"
        description="Schedule time-boxed flash sales and set discounted variant pricing"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Flash Sales</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="fs-name">Name</FieldLabel>
              <FieldContent>
                <Input id="fs-name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <FieldError errors={asErrors(saleErrors.name)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="fs-start">Starts At</FieldLabel>
              <FieldContent>
                <Input id="fs-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                <FieldError errors={asErrors(saleErrors.starts_at)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="fs-end">Ends At</FieldLabel>
              <FieldContent>
                <Input id="fs-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                <FieldError errors={asErrors(saleErrors.ends_at)} />
              </FieldContent>
            </Field>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button onClick={handleCreateSale} disabled={submitting}>
              <PlusIcon className="h-4 w-4" />
              Create Flash Sale
            </Button>

            <div className="flex flex-col gap-1 pt-2">
              {flashSales.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No flash sales yet.</p>
              )}
              {flashSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  aria-pressed={selectedSaleId === sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className={`w-full rounded-lg px-3 py-2 text-sm text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                    selectedSaleId === sale.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{sale.name}</span>
                    <StatusBadge status={sale.is_active ? "active" : "inactive"} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{selectedSale ? `Items in "${selectedSale.name}"` : "Select a flash sale"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedSale ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field>
                    <FieldLabel>Variant</FieldLabel>
                    <FieldContent>
                      <Select value={itemVariant} onValueChange={setItemVariant}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name} ({v.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={asErrors(itemErrors.variant)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="fs-item-price">Sale Price</FieldLabel>
                    <FieldContent>
                      <Input id="fs-item-price" type="number" step="0.01" min="0" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                      <FieldError errors={asErrors(itemErrors.sale_price)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="fs-item-stock">Stock Limit</FieldLabel>
                    <FieldContent>
                      <Input id="fs-item-stock" type="number" min="1" step="1" value={itemStock} onChange={(e) => setItemStock(e.target.value)} />
                      <FieldError errors={asErrors(itemErrors.stock_limit)} />
                    </FieldContent>
                  </Field>
                </div>
                <Button onClick={handleAddItem} disabled={submitting} className="self-start">
                  Add Item
                </Button>

                <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {itemsForSale.length === 0 && (
                    <p className="text-sm text-muted-foreground py-6 text-center">No items yet.</p>
                  )}
                  {itemsForSale.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                      <span>{variantLabel(item.variant)}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.sale_price)} · limit {item.stock_limit} · sold {item.sold_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Create or select a flash sale to manage its discounted items.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FlashSales
