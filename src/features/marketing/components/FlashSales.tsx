import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
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

const FlashSales = () => {
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
    if (!name.trim() || !startsAt || !endsAt) return
    setSubmitting(true)
    try {
      const created = await dispatch(
        postFlashSale({
          payload: {
            name: name.trim(),
            starts_at: new Date(startsAt).toISOString(),
            ends_at: new Date(endsAt).toISOString(),
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
    if (!selectedSaleId || !itemVariant || !itemPrice.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        postFlashSaleItem({
          payload: {
            flash_sale: selectedSaleId,
            variant: itemVariant,
            sale_price: itemPrice.trim(),
            stock_limit: Number(itemStock) || 0,
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
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button onClick={handleCreateSale} disabled={submitting || !name.trim() || !startsAt || !endsAt}>
              <PlusIcon className="h-4 w-4" />
              Create Flash Sale
            </Button>

            <div className="flex flex-col gap-1 pt-2">
              {flashSales.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No flash sales yet.</p>
              )}
              {flashSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className={`rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                    selectedSaleId === sale.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{sale.name}</span>
                    <StatusBadge status={sale.is_active ? "active" : "inactive"} />
                  </div>
                </div>
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
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Sale Price</FieldLabel>
                    <FieldContent>
                      <Input type="number" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Stock Limit</FieldLabel>
                    <FieldContent>
                      <Input type="number" value={itemStock} onChange={(e) => setItemStock(e.target.value)} />
                    </FieldContent>
                  </Field>
                </div>
                <Button onClick={handleAddItem} disabled={submitting || !itemVariant || !itemPrice.trim()} className="self-start">
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
                        ${Number(item.sale_price).toFixed(2)} · limit {item.stock_limit} · sold {item.sold_quantity}
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
