import { useState } from "react"
import { toast } from "sonner"
import { Check, Edit2, Layers, Plus, Sparkles, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/common/StatusBadge"
import { useAppDispatch } from "@/app/hooks"
import {
  postData as postVariant,
  patchData as patchVariant,
  deleteData as deleteVariant,
} from "@/features/catalog/slices/variantSlice"
import type { Attribute, AttributeValue, Variant, VariantStatus } from "@/features/catalog/types"
import type { DisplayVariant, DraftVariant } from "@/features/catalog/productFormSchema"

interface ProductVariantsSectionProps {
  isEditing: boolean
  /** Id of the saved product being edited; undefined while creating. */
  productId: string | undefined
  /** Saved base price of the product being edited (default price for new variants). */
  existingBasePrice: string | undefined
  /** Saved variants of the product being edited. */
  variants: Variant[]
  draftVariants: DraftVariant[]
  setDraftVariants: React.Dispatch<React.SetStateAction<DraftVariant[]>>
  allAttributes: Attribute[]
  allAttributeValues: AttributeValue[]
  formName: string
  formSlug: string
  formBasePrice: number
}

export function ProductVariantsSection({
  isEditing,
  productId,
  existingBasePrice,
  variants,
  draftVariants,
  setDraftVariants,
  allAttributes,
  allAttributeValues,
  formName,
  formSlug,
  formBasePrice,
}: ProductVariantsSectionProps) {
  const dispatch = useAppDispatch()

  // Variation builder state
  const [variationMode, setVariationMode] = useState<"manual" | "generator">("manual")
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("")
  const [selectedAttrValueIds, setSelectedAttrValueIds] = useState<string[]>([])
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPrice, setNewVariantPrice] = useState("")
  const [newVariantStock, setNewVariantStock] = useState("10")
  const [newVariantStatus, setNewVariantStatus] = useState<VariantStatus>("active")

  // Editing variant state
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [editSku, setEditSku] = useState("")
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editStock, setEditStock] = useState("")
  const [editStatus, setEditStatus] = useState<VariantStatus>("active")

  // Computed display variants
  const displayVariants: DisplayVariant[] = isEditing
    ? variants.map((v) => ({
        key: v.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        stock_quantity: String(v.stock_quantity),
        status: v.status,
      }))
    : draftVariants.map((v) => ({ key: v.tempId, ...v }))

  // --- Variation Handlers ---
  const handleAddManualVariant = async () => {
    if (!newVariantSku.trim() || !newVariantName.trim()) {
      toast.error("Please provide both SKU and Variation Name")
      return
    }

    if (!isEditing) {
      setDraftVariants((prev) => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          sku: newVariantSku.trim(),
          name: newVariantName.trim(),
          price: newVariantPrice.trim() || String(formBasePrice || "0"),
          stock_quantity: newVariantStock.trim() || "10",
          status: newVariantStatus,
        },
      ])
      setNewVariantSku("")
      setNewVariantName("")
      setNewVariantPrice("")
      setNewVariantStock("10")
      toast.success("Variation added to draft")
      return
    }

    if (!productId) return
    try {
      await dispatch(
        postVariant({
          payload: {
            product: productId,
            sku: newVariantSku.trim(),
            name: newVariantName.trim(),
            price: newVariantPrice.trim() || String(existingBasePrice),
            stock_quantity: Number(newVariantStock) || 0,
            status: newVariantStatus,
            image: "",
          },
        })
      ).unwrap()
      setNewVariantSku("")
      setNewVariantName("")
      setNewVariantPrice("")
      setNewVariantStock("10")
      toast.success("Variation added successfully")
    } catch {
      toast.error("Failed to add variation")
    }
  }

  const handleGenerateVariations = () => {
    if (!selectedAttributeId || selectedAttrValueIds.length === 0) {
      toast.error("Please select an attribute and at least one attribute value")
      return
    }

    const attribute = allAttributes.find((a) => a.id === selectedAttributeId)
    const baseName = formName || "Product"
    const baseSku = (formSlug || "PROD").toUpperCase()
    const basePrice = String(formBasePrice || "0")

    const newGenerated: DraftVariant[] = selectedAttrValueIds.map((valId) => {
      const val = allAttributeValues.find((v) => v.id === valId)
      const valName = val?.value || "Option"
      return {
        tempId: crypto.randomUUID(),
        sku: `${baseSku}-${valName.toUpperCase().replace(/\s+/g, "")}`,
        name: `${baseName} - ${attribute ? attribute.name + " " : ""}${valName}`,
        price: basePrice,
        stock_quantity: "10",
        status: "active",
      }
    })

    if (!isEditing) {
      setDraftVariants((prev) => [...prev, ...newGenerated])
      toast.success(`Generated ${newGenerated.length} variation(s)`)
    } else if (productId) {
      Promise.all(
        newGenerated.map((g) =>
          dispatch(
            postVariant({
              payload: {
                product: productId,
                sku: g.sku,
                name: g.name,
                price: g.price,
                stock_quantity: Number(g.stock_quantity),
                status: "active",
                image: "",
              },
            })
          ).unwrap()
        )
      )
        .then(() => toast.success(`Generated and saved ${newGenerated.length} variation(s)`))
        .catch(() => toast.error("Failed to save some generated variations"))
    }

    setSelectedAttrValueIds([])
  }

  const startEditVariant = (v: DisplayVariant) => {
    setEditingVariantId(v.key)
    setEditSku(v.sku)
    setEditName(v.name)
    setEditPrice(v.price)
    setEditStock(v.stock_quantity)
    setEditStatus(v.status)
  }

  const cancelEditVariant = () => setEditingVariantId(null)

  const saveEditVariant = async () => {
    if (!editingVariantId || !editSku.trim() || !editName.trim()) return

    if (!isEditing) {
      setDraftVariants((prev) =>
        prev.map((v) =>
          v.tempId === editingVariantId
            ? {
                ...v,
                sku: editSku.trim(),
                name: editName.trim(),
                price: editPrice.trim() || "0",
                stock_quantity: editStock.trim() || "0",
                status: editStatus,
              }
            : v
        )
      )
      setEditingVariantId(null)
      toast.success("Variation updated")
      return
    }

    try {
      await dispatch(
        patchVariant({
          id: editingVariantId,
          payload: {
            sku: editSku.trim(),
            name: editName.trim(),
            price: editPrice.trim() || "0",
            stock_quantity: Number(editStock) || 0,
            status: editStatus,
          },
        })
      ).unwrap()
      toast.success("Variation updated")
      setEditingVariantId(null)
    } catch {
      toast.error("Failed to update variation")
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!isEditing) {
      setDraftVariants((prev) => prev.filter((v) => v.tempId !== variantId))
      return
    }
    try {
      await dispatch(deleteVariant(variantId)).unwrap()
      toast.success("Variation removed")
    } catch {
      toast.error("Failed to remove variation")
    }
  }

  // Filter attribute values for the selected attribute
  const availableAttrValues = allAttributeValues.filter(
    (v) => v.attribute === selectedAttributeId
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle level={2} className="flex items-center gap-2">
            <Layers className="h-5 w-5" /> Product Variations
          </CardTitle>
          <CardDescription>
            Define size, color, storage, or custom product variations with dedicated SKUs and prices.
          </CardDescription>
        </div>
        <div className="flex rounded-lg bg-muted p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setVariationMode("manual")}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              variationMode === "manual" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Custom Variation
          </button>
          <button
            type="button"
            onClick={() => setVariationMode("generator")}
            className={`px-3 py-1 font-medium rounded-md transition-all ${
              variationMode === "generator" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3 inline mr-1" /> Generate Matrix
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {variationMode === "generator" ? (
          /* Attribute Combinator / Generator */
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Generate Variations from Attribute
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Select Attribute (e.g. Size, Color)</label>
                <Select
                  value={selectedAttributeId}
                  onValueChange={(val) => {
                    setSelectedAttributeId(val)
                    setSelectedAttrValueIds([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose attribute..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allAttributes.map((attr) => (
                      <SelectItem key={attr.id} value={attr.id}>
                        {attr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAttributeId && (
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Choose Values to Generate</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableAttrValues.map((val) => {
                      const isSelected = selectedAttrValueIds.includes(val.id)
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAttrValueIds(selectedAttrValueIds.filter((id) => id !== val.id))
                            } else {
                              setSelectedAttrValueIds([...selectedAttrValueIds, val.id])
                            }
                          }}
                          className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {val.value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleGenerateVariations}
              disabled={!selectedAttributeId || selectedAttrValueIds.length === 0}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate {selectedAttrValueIds.length} Variation(s)
            </Button>
          </div>
        ) : (
          /* Manual Variation Creator */
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Add Custom Variation</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">SKU</label>
                <Input
                  placeholder="e.g. IP15-256-BLU"
                  value={newVariantSku}
                  onChange={(e) => setNewVariantSku(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Variation Name</label>
                <Input
                  placeholder="e.g. 256GB - Blue"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={String(formBasePrice || "0.00")}
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Initial Stock</label>
                <Input
                  type="number"
                  value={newVariantStock}
                  onChange={(e) => setNewVariantStock(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select value={newVariantStatus} onValueChange={(v) => setNewVariantStatus(v as VariantStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddManualVariant}
              disabled={!newVariantSku.trim() || !newVariantName.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Variation
            </Button>
          </div>
        )}

        {/* List of Variations */}
        {displayVariants.length > 0 ? (
          <div className="divide-y rounded-xl border border-border bg-card overflow-hidden">
            {displayVariants.map((variant) =>
              editingVariantId === variant.key ? (
                <div key={variant.key} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 items-center bg-muted/40">
                  <Input
                    placeholder="SKU"
                    aria-label={`SKU for ${variant.name || variant.sku || "this variant"}`}
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                  />
                  <Input
                    placeholder="Name"
                    aria-label={`Variant name for ${variant.name || variant.sku || "this variant"}`}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    aria-label={`Price for ${variant.name || variant.sku || "this variant"}`}
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                  <Input
                    placeholder="Stock"
                    aria-label={`Stock for ${variant.name || variant.sku || "this variant"}`}
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                  <div className="flex items-center gap-1.5">
                    <Select value={editStatus} onValueChange={(v) => setEditStatus(v as VariantStatus)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" onClick={saveEditVariant}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={cancelEditVariant}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={variant.key} className="flex items-center justify-between p-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{variant.name}</span>
                    <span className="text-xs text-muted-foreground">
                      SKU: <span className="font-mono">{variant.sku}</span> · Stock: {variant.stock_quantity} units
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">${Number(variant.price).toFixed(2)}</span>
                    <StatusBadge status={variant.status} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditVariant(variant)}
                      className="h-8 text-xs text-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVariant(variant.key)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No variations configured. You can generate multiple variations or add custom variants above.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
