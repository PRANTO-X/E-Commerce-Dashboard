import { useEffect, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Boxes,
  Layers,
  Sparkles,
  PackagePlus,
  Plus,
  Edit2,
  Check,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import { ImageUploader, type UploadedImageItem } from "@/components/common/ImageUploader"
import { StatusBadge } from "@/components/common/StatusBadge"

import {
  productStatusOptions,
  productTypeOptions,
  type VariantStatus,
  type BundlePricingMode,
} from "@/features/catalog/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, fetchAll as fetchAllProducts, postData, updateData } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import {
  fetchAll as fetchAllProductImages,
  postData as postProductImage,
  deleteData as deleteProductImage,
} from "@/features/catalog/slices/productImageSlice"
import {
  fetchAll as fetchAllVariants,
  postData as postVariant,
  patchData as patchVariant,
  deleteData as deleteVariant,
} from "@/features/catalog/slices/variantSlice"
import {
  fetchAll as fetchAllAttributes,
} from "@/features/catalog/slices/attributeSlice"
import {
  fetchAll as fetchAllAttributeValues,
} from "@/features/catalog/slices/attributeValueSlice"
import {
  fetchAll as fetchAllBundleItems,
  postData as postBundleItem,
  deleteData as deleteBundleItem,
} from "@/features/catalog/slices/bundleItemSlice"

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[-a-zA-Z0-9_]+$/, "Use only letters, numbers, - and _"),
  category: z.string().min(1, "Select a category"),
  base_price: z.number().positive("Price must be greater than 0"),
  status: z.enum(["draft", "active", "inactive", "archived"]),
  product_type: z.enum(["physical", "digital", "subscription", "bundle"]),
  requires_shipping: z.boolean(),
  is_downloadable: z.boolean(),
  is_recurring: z.boolean(),
  is_featured: z.boolean(),
  bundle_pricing_mode: z.enum(["fixed", "dynamic"]).optional(),
  bundle_discount_percent: z.string().optional(),
  description: z.string().min(1, "Description is required"),
})

type ProductFormValues = z.infer<typeof productSchema>

const defaultFormValues: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  base_price: 0,
  status: "draft",
  product_type: "physical",
  requires_shipping: true,
  is_downloadable: false,
  is_recurring: false,
  is_featured: false,
  bundle_pricing_mode: "fixed",
  bundle_discount_percent: "0",
  description: "",
}

interface DraftVariant {
  tempId: string
  sku: string
  name: string
  price: string
  stock_quantity: string
  status: VariantStatus
  image?: string
}

interface DraftBundleItem {
  tempId: string
  variantId: string
  variantName: string
  variantSku: string
  price: number
  quantity: number
}

const ProductForm = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get("type") === "bundle" ? "bundle" : "physical"

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { singleData: existing, isLoading } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)
  const { data: allVariants } = useAppSelector((state) => state.variants)
  const { data: allAttributes } = useAppSelector((state) => state.attributes)
  const { data: allAttributeValues } = useAppSelector((state) => state.attributeValues)
  const { data: allBundleItems } = useAppSelector((state) => state.bundleItems)

  const isEditing = id !== "new"
  const images = isEditing ? allImages.filter((img) => img.product === id) : []
  const variants = isEditing ? allVariants.filter((v) => v.product === id) : []
  const existingBundleItems = isEditing ? allBundleItems.filter((item) => item.bundle === id) : []

  // Local draft states for when creating a new product
  const [draftImages, setDraftImages] = useState<UploadedImageItem[]>([])
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([])
  const [draftBundleItems, setDraftBundleItems] = useState<DraftBundleItem[]>([])

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

  // Bundle builder state
  const [selectedBundleVariantId, setSelectedBundleVariantId] = useState<string>("")
  const [bundleItemQuantity, setBundleItemQuantity] = useState<number>(1)

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...defaultFormValues,
      product_type: initialType,
    },
  })

  const currentProductType = watch("product_type")
  const currentPricingMode = watch("bundle_pricing_mode") || "fixed"
  const currentDiscountPercent = Number(watch("bundle_discount_percent") || 0)

  useEffect(() => {
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
    dispatch(fetchAllProducts({ page: 1, page_size: 1000 }))
    dispatch(fetchAllAttributes({ page: 1, page_size: 100 }))
    dispatch(fetchAllAttributeValues({ page: 1, page_size: 100 }))
    dispatch(fetchAllVariants({ page: 1, page_size: 1000 }))

    if (isEditing && id) {
      dispatch(fetchSingle(id))
      dispatch(fetchAllProductImages({ page: 1, page_size: 1000 }))
      dispatch(fetchAllBundleItems({ page: 1, page_size: 1000 }))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        name: existing.name,
        slug: existing.slug,
        category: existing.category,
        base_price: Number(existing.base_price),
        status: existing.status,
        product_type: existing.product_type,
        requires_shipping: existing.requires_shipping,
        is_downloadable: existing.is_downloadable,
        is_recurring: existing.is_recurring,
        is_featured: existing.is_featured,
        bundle_pricing_mode: (existing.bundle_pricing_mode as BundlePricingMode) || "fixed",
        bundle_discount_percent: existing.bundle_discount_percent || "0",
        description: existing.description ?? "",
      })
    }
  }, [existing, id, isEditing, reset])

  // Computed display images for existing vs new
  const uploadedImageItems: UploadedImageItem[] = useMemo(() => {
    if (isEditing) {
      return images.map((img) => ({
        id: img.id,
        url: img.image,
        alt: img.alt_text,
        isPrimary: img.is_primary,
      }))
    }
    return draftImages
  }, [isEditing, images, draftImages])

  // Computed display variants
  const displayVariants = isEditing
    ? variants.map((v) => ({
        key: v.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        stock_quantity: String(v.stock_quantity),
        status: v.status,
      }))
    : draftVariants.map((v) => ({ key: v.tempId, ...v }))

  // Computed display bundle items
  const displayBundleItems = useMemo(() => {
    if (isEditing) {
      return existingBundleItems.map((item) => {
        const matchedVariant = allVariants.find((v) => v.id === item.variant)
        const price = matchedVariant ? Number(matchedVariant.price) : 0
        return {
          id: item.id,
          variantId: item.variant,
          variantName: item.variant_name || matchedVariant?.name || "Product Variant",
          variantSku: item.variant_sku || matchedVariant?.sku || "",
          price,
          quantity: item.quantity,
        }
      })
    }
    return draftBundleItems.map((item) => ({
      id: item.tempId,
      variantId: item.variantId,
      variantName: item.variantName,
      variantSku: item.variantSku,
      price: item.price,
      quantity: item.quantity,
    }))
  }, [isEditing, existingBundleItems, draftBundleItems, allVariants])

  // Calculate Bundle Pricing
  const totalBundleRegularValue = displayBundleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const computedBundleDiscountAmount =
    currentPricingMode === "dynamic"
      ? (totalBundleRegularValue * currentDiscountPercent) / 100
      : 0
  const computedDynamicBundlePrice = Math.max(
    0,
    totalBundleRegularValue - computedBundleDiscountAmount
  )

  // Sync dynamic bundle price to base_price field if dynamic mode is active
  useEffect(() => {
    if (currentProductType === "bundle" && currentPricingMode === "dynamic" && totalBundleRegularValue > 0) {
      setValue("base_price", Number(computedDynamicBundlePrice.toFixed(2)))
    }
  }, [currentProductType, currentPricingMode, computedDynamicBundlePrice, totalBundleRegularValue, setValue])

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading product...</div>
  }

  if (isEditing && existing?.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      base_price: String(values.base_price),
      bundle_pricing_mode: values.product_type === "bundle" ? values.bundle_pricing_mode || "fixed" : undefined,
      bundle_discount_percent:
        values.product_type === "bundle" ? String(values.bundle_discount_percent || "0") : undefined,
    }

    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload })).unwrap()
        toast.success(`${values.name} updated successfully`)
        navigate("/products")
      } else {
        const created = await dispatch(postData({ payload })).unwrap()

        // 1. Save draft images
        if (draftImages.length > 0) {
          try {
            await Promise.all(
              draftImages.map((img, idx) =>
                dispatch(
                  postProductImage({
                    payload: {
                      product: created.id,
                      image: img.url,
                      alt_text: img.alt || created.name,
                      sort_order: idx,
                      is_primary: img.isPrimary ?? idx === 0,
                    },
                  })
                ).unwrap()
              )
            )
          } catch {
            console.error("Some images failed to attach")
          }
        }

        // 2. Save draft variants
        if (draftVariants.length > 0) {
          try {
            await Promise.all(
              draftVariants.map((v) =>
                dispatch(
                  postVariant({
                    payload: {
                      product: created.id,
                      sku: v.sku,
                      name: v.name,
                      price: v.price.trim() || String(created.base_price),
                      stock_quantity: Number(v.stock_quantity) || 0,
                      status: v.status,
                      image: v.image || "",
                    },
                  })
                ).unwrap()
              )
            )
          } catch {
            toast.error("Product created, but some variants failed to save")
          }
        }

        // 3. Save draft bundle items if bundle
        if (values.product_type === "bundle" && draftBundleItems.length > 0) {
          try {
            await Promise.all(
              draftBundleItems.map((item) =>
                dispatch(
                  postBundleItem({
                    payload: {
                      bundle: created.id,
                      variant: item.variantId,
                      quantity: item.quantity,
                    },
                  })
                ).unwrap()
              )
            )
          } catch {
            console.error("Some bundle items failed to save")
          }
        }

        toast.success(`${values.name} created successfully!`)
        navigate("/products")
      }
    } catch {
      toast.error("Failed to save product. Please check required fields.")
    }
  }

  // --- Image Upload Handlers ---
  const handleAddImage = async (imageUrl: string, altText: string, isPrimary?: boolean) => {
    if (!isEditing) {
      setDraftImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: imageUrl,
          alt: altText || "Product Image",
          isPrimary: isPrimary ?? prev.length === 0,
        },
      ])
      return
    }

    if (!existing?.id) return
    try {
      await dispatch(
        postProductImage({
          payload: {
            product: existing.id,
            image: imageUrl,
            alt_text: altText,
            sort_order: images.length,
            is_primary: isPrimary ?? images.length === 0,
          },
        })
      ).unwrap()
      toast.success("Image uploaded successfully")
    } catch {
      toast.error("Failed to upload image")
    }
  }

  const handleImagesChange = (updatedList: UploadedImageItem[]) => {
    if (!isEditing) {
      setDraftImages(updatedList)
    } else {
      const currentIds = updatedList.map((i) => i.id)
      const removed = images.filter((img) => !currentIds.includes(img.id))
      removed.forEach((img) => {
        dispatch(deleteProductImage(img.id))
      })
    }
  }

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
          price: newVariantPrice.trim() || String(watch("base_price") || "0"),
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

    if (!existing?.id) return
    try {
      await dispatch(
        postVariant({
          payload: {
            product: existing.id,
            sku: newVariantSku.trim(),
            name: newVariantName.trim(),
            price: newVariantPrice.trim() || String(existing.base_price),
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
    const baseName = watch("name") || "Product"
    const baseSku = (watch("slug") || "PROD").toUpperCase()
    const basePrice = String(watch("base_price") || "0")

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
    } else if (existing?.id) {
      Promise.all(
        newGenerated.map((g) =>
          dispatch(
            postVariant({
              payload: {
                product: existing.id,
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

  const startEditVariant = (v: {
    key: string
    sku: string
    name: string
    price: string
    stock_quantity: string
    status: VariantStatus
  }) => {
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

    if (!existing?.id) return
    try {
      await dispatch(
        postBundleItem({
          payload: {
            bundle: existing.id,
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

  // Filter attribute values for the selected attribute
  const availableAttrValues = allAttributeValues.filter(
    (v) => v.attribute === selectedAttributeId
  )

  return (
    <div className="section-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isEditing
                ? `Edit ${existing?.product_type === "bundle" ? "Combo Bundle" : "Product"}`
                : currentProductType === "bundle"
                ? "Create Combo Bundle"
                : "Add Product"}
            </h1>
            {currentProductType === "bundle" && (
              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Boxes className="h-3 w-3 mr-1" /> Combo Bundle
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {isEditing
              ? `Editing ${existing?.name}`
              : currentProductType === "bundle"
              ? "Package multiple products into a discounted combo bundle"
              : "Create a new product with custom variations, pricing, and images"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>General product metadata, taxonomy, and publishing status</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Product Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder={currentProductType === "bundle" ? "e.g. Creator Starter Kit Combo" : "e.g. iPhone 15 Pro"}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug (URL identifier)</FieldLabel>
              <FieldContent>
                <Input
                  id="slug"
                  placeholder={currentProductType === "bundle" ? "e.g. creator-starter-kit" : "e.g. iphone-15-pro"}
                  {...register("slug")}
                />
                <FieldError errors={[errors.slug]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.category]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="product_type">Product Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="product_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="product_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label} {opt.value === "bundle" && "📦 (Combo Bundle)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.product_type]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="base_price">
                {currentProductType === "bundle" ? "Bundle Price ($)" : "Base Price ($)"}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  {...register("base_price", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.base_price]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Publishing Status</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {productStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Product Description</FieldLabel>
              <FieldContent>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Provide a detailed description of the product or combo package..."
                  {...register("description")}
                />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>

            {/* Switches */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="requires_shipping">Requires Shipping</FieldLabel>
                </FieldContent>
                <Controller
                  control={control}
                  name="requires_shipping"
                  render={({ field }) => (
                    <Switch id="requires_shipping" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="is_downloadable">Downloadable</FieldLabel>
                </FieldContent>
                <Controller
                  control={control}
                  name="is_downloadable"
                  render={({ field }) => (
                    <Switch id="is_downloadable" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="is_recurring">Recurring</FieldLabel>
                </FieldContent>
                <Controller
                  control={control}
                  name="is_recurring"
                  render={({ field }) => (
                    <Switch id="is_recurring" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="is_featured">Featured Item</FieldLabel>
                </FieldContent>
                <Controller
                  control={control}
                  name="is_featured"
                  render={({ field }) => (
                    <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Feature 5: Image Upload Component */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload media files directly from your computer or provide URLs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              images={uploadedImageItems}
              onImagesChange={handleImagesChange}
              onAddImage={handleAddImage}
              label="Upload Product Images"
              description="Drag & drop product images, or click to browse from your device"
            />
          </CardContent>
        </Card>

        {/* Feature 3: Combo / Bundle Builder Section (Active when product_type === 'bundle') */}
        {currentProductType === "bundle" && (
          <Card className="border-purple-500/30 shadow-sm bg-purple-50/10 dark:bg-purple-950/10">
            <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/10 pb-4">
              <div>
                <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
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
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <PackagePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Select Component Products for this Bundle
                </h4>
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
                        : Number(watch("base_price") || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature 4: Product Variations / Variants Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
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
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Generate Variations from Attribute
                </h4>
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
                <h4 className="text-sm font-semibold">Add Custom Variation</h4>
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
                      placeholder={String(watch("base_price") || "0.00")}
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
                      <Input placeholder="SKU" value={editSku} onChange={(e) => setEditSku(e.target.value)} />
                      <Input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      <Input
                        placeholder="Price"
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                      <Input
                        placeholder="Stock"
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

        {/* Submit Card Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-32">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : currentProductType === "bundle"
              ? "Create Combo Bundle"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
