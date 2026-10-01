import { useState } from "react"
import { Controller, type Control, type UseFormRegister } from "react-hook-form"
import { toast } from "sonner"
import { Boxes, PackagePlus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { useAppDispatch } from "@/app/hooks"
import {
  postData as postBundleItem,
  deleteData as deleteBundleItem,
} from "@/features/catalog/slices/bundleItemSlice"
import type { Variant } from "@/features/catalog/types"
import type {
  DisplayBundleItem,
  DraftBundleItem,
  ProductFormValues,
} from "@/features/catalog/productFormSchema"

interface ProductBundleSectionProps {
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  isEditing: boolean
  /** Id of the saved product being edited; undefined while creating. */
  productId: string | undefined
  allVariants: Variant[]
  displayBundleItems: DisplayBundleItem[]
  draftBundleItems: DraftBundleItem[]
  setDraftBundleItems: React.Dispatch<React.SetStateAction<DraftBundleItem[]>>
  currentPricingMode: string
  currentDiscountPercent: number
  formBasePrice: number
  totalBundleRegularValue: number
  computedBundleDiscountAmount: number
  computedDynamicBundlePrice: number
}

export function ProductBundleSection({
  control,
  register,
  isEditing,
  productId,
  allVariants,
  displayBundleItems,
  draftBundleItems,
  setDraftBundleItems,
  currentPricingMode,
  currentDiscountPercent,
  formBasePrice,
  totalBundleRegularValue,
  computedBundleDiscountAmount,
  computedDynamicBundlePrice,
}: ProductBundleSectionProps) {
  const dispatch = useAppDispatch()

  // Bundle builder state
  const [selectedBundleVariantId, setSelectedBundleVariantId] = useState<string>("")
  const [bundleItemQuantity, setBundleItemQuantity] = useState<number>(1)

  // --- Bundle Item Handlers ---
  const handleAddBundleItem = async () => {
    if (!selectedBundleVariantId) {
      toast.error("Please select a product component for the bundle")
      return
    }

    const selectedVariant = allVariants.find((v) => v.id === selectedBundleVariantId)
    if (!selectedVariant) return

    if (!isEditing) {
      // Check if already in draft
      const exists = draftBundleItems.some((item) => item.variantId === selectedBundleVariantId)
      if (exists) {
        setDraftBundleItems((prev) =>
          prev.map((item) =>
            item.variantId === selectedBundleVariantId
              ? { ...item, quantity: item.quantity + bundleItemQuantity }
              : item
          )
        )
      } else {
        setDraftBundleItems((prev) => [
          ...prev,
          {
            tempId: crypto.randomUUID(),
            variantId: selectedBundleVariantId,
            variantName: selectedVariant.name,
            variantSku: selectedVariant.sku,
            price: Number(selectedVariant.price),
            quantity: bundleItemQuantity,
          },
        ])
      }
      setSelectedBundleVariantId("")
      setBundleItemQuantity(1)
      toast.success("Item added to combo bundle")
      return
    }

    if (!productId) return
    try {
      await dispatch(
        postBundleItem({
          payload: {
            bundle: productId,
            variant: selectedBundleVariantId,
            quantity: bundleItemQuantity,
          },
        })
      ).unwrap()
      setSelectedBundleVariantId("")
      setBundleItemQuantity(1)
      toast.success("Item added to combo bundle")
    } catch {
      toast.error("Failed to add item to bundle")
    }
  }

  const handleDeleteBundleItem = async (bundleItemId: string) => {
    if (!isEditing) {
      setDraftBundleItems((prev) => prev.filter((item) => item.tempId !== bundleItemId))
      return
    }
    try {
      await dispatch(deleteBundleItem(bundleItemId)).unwrap()
      toast.success("Bundle item removed")
    } catch {
      toast.error("Failed to remove bundle item")
    }
  }

  return (
    <Card className="border-purple-500/30 shadow-sm bg-purple-50/10 dark:bg-purple-950/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/10 pb-4">
        <div>
          <CardTitle level={2} className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Boxes className="h-5 w-5" /> Combo Bundle Builder
          </CardTitle>
          <CardDescription>
            Configure the bundled components, quantities, and combo discount pricing.
          </CardDescription>
        </div>
        <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400">
          {displayBundleItems.length} items bundled
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Bundle Pricing Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-purple-500/20 bg-background/60 p-4">
          <Field>
            <FieldLabel htmlFor="bundle_pricing_mode">Bundle Pricing Mode</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="bundle_pricing_mode"
                render={({ field }) => (
                  <Select value={field.value || "fixed"} onValueChange={field.onChange}>
                    <SelectTrigger id="bundle_pricing_mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price (Manual override)</SelectItem>
                      <SelectItem value="dynamic">Dynamic (Discount % of Components)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
          </Field>

          {currentPricingMode === "dynamic" && (
            <Field>
              <FieldLabel htmlFor="bundle_discount_percent">Bundle Discount Percentage (%)</FieldLabel>
              <FieldContent>
                <Input
                  id="bundle_discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g. 15 for 15% off"
                  {...register("bundle_discount_percent")}
                />
              </FieldContent>
            </Field>
          )}
        </div>

        {/* Add Items to Bundle */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <PackagePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Select Component Products for this Bundle
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8">
              <label className="text-xs text-muted-foreground mb-1 block">Component Item / Variant</label>
              <Select value={selectedBundleVariantId} onValueChange={setSelectedBundleVariantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a product/variant to bundle..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {allVariants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} (SKU: {v.sku}) — ${Number(v.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
              <Input
                type="number"
                min="1"
                value={bundleItemQuantity}
                onChange={(e) => setBundleItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                onClick={handleAddBundleItem}
                disabled={!selectedBundleVariantId}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Bundled Items List */}
        {displayBundleItems.length > 0 ? (
          <div className="divide-y rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase grid grid-cols-12">
              <span className="col-span-6">Component Item</span>
              <span className="col-span-2 text-right">Unit Price</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>
            {displayBundleItems.map((item) => (
              <div key={item.id} className="px-4 py-3 grid grid-cols-12 items-center text-sm">
                <div className="col-span-6">
                  <p className="font-medium text-foreground">{item.variantName}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.variantSku || "—"}</p>
                </div>
                <div className="col-span-2 text-right text-muted-foreground">
                  ${item.price.toFixed(2)}
                </div>
                <div className="col-span-2 text-center font-semibold">
                  {item.quantity}x
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="font-semibold text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBundleItem(item.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
            No components added yet. Select products above to include them in this combo bundle.
          </div>
        )}

        {/* Live Bundle Breakdown Summary Card */}
        {displayBundleItems.length > 0 && (
          <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Total Individual Components Value:</span>
              <span className="font-medium text-foreground">${totalBundleRegularValue.toFixed(2)}</span>
            </div>
            {currentPricingMode === "dynamic" && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span>Bundle Discount ({currentDiscountPercent}%):</span>
                <span>-${computedBundleDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-purple-500/20 text-base font-bold text-foreground">
              <span>Combo Bundle Price:</span>
              <span className="text-purple-600 dark:text-purple-400">
                ${currentPricingMode === "dynamic"
                  ? computedDynamicBundlePrice.toFixed(2)
                  : Number(formBasePrice || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
