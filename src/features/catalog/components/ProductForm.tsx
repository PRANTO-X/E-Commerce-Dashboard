import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Save, Boxes } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { UploadedImageItem } from "@/components/common/ImageUploader"

import type { BundlePricingMode } from "@/features/catalog/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, fetchAll as fetchAllProducts, postData, updateData } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import {
  fetchAll as fetchAllProductImages,
  postData as postProductImage,
} from "@/features/catalog/slices/productImageSlice"
import {
  fetchAll as fetchAllVariants,
  postData as postVariant,
} from "@/features/catalog/slices/variantSlice"
import { fetchAll as fetchAllAttributes } from "@/features/catalog/slices/attributeSlice"
import { fetchAll as fetchAllAttributeValues } from "@/features/catalog/slices/attributeValueSlice"
import {
  fetchAll as fetchAllBundleItems,
  postData as postBundleItem,
} from "@/features/catalog/slices/bundleItemSlice"
import { useDocumentTitle } from "@/hooks/use-document-title"
import {
  productSchema,
  defaultFormValues,
  type DisplayBundleItem,
  type DraftBundleItem,
  type DraftVariant,
  type ProductFormValues,
} from "@/features/catalog/productFormSchema"
import { DetailPageState } from "@/components/common/DetailPageState"
import { resolveDetailState } from "@/lib/detailState"
import { ProductBasicInfoSection } from "./ProductBasicInfoSection"
import { ProductImagesSection } from "./ProductImagesSection"
import { ProductBundleSection } from "./ProductBundleSection"
import { ProductVariantsSection } from "./ProductVariantsSection"

/** Counts rejected results and describes them, e.g. "2 of 3 images". */
function describeFailures(results: PromiseSettledResult<unknown>[], noun: string): string | null {
  const failed = results.filter((r) => r.status === "rejected").length
  if (failed === 0) return null
  const plural = results.length === 1 ? noun : `${noun}s`
  return `${failed} of ${results.length} ${plural}`
}

const ProductForm = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get("type") === "bundle" ? "bundle" : "physical"

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { singleData: existing, singleStatus, singleError } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)
  const { data: allVariants } = useAppSelector((state) => state.variants)
  const { data: allAttributes } = useAppSelector((state) => state.attributes)
  const { data: allAttributeValues } = useAppSelector((state) => state.attributeValues)
  const { data: allBundleItems } = useAppSelector((state) => state.bundleItems)

  useDocumentTitle(existing?.name ? `${existing.name} — Product` : "Product Form")

  const isEditing = id !== "new"
  const images = isEditing ? allImages.filter((img) => img.product === id) : []
  const variants = isEditing ? allVariants.filter((v) => v.product === id) : []
  const existingBundleItems = useMemo(
    () => (isEditing ? allBundleItems.filter((item) => item.bundle === id) : []),
    [isEditing, allBundleItems, id]
  )

  // Local draft states for when creating a new product
  const [draftImages, setDraftImages] = useState<UploadedImageItem[]>([])
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([])
  const [draftBundleItems, setDraftBundleItems] = useState<DraftBundleItem[]>([])

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
    // Unfiltered: the bundle builder lists variants of every product.
    dispatch(fetchAllVariants({ page: 1, page_size: 1000 }))

    if (isEditing && id) {
      dispatch(fetchSingle(id))
      // Filtered server-side so this product's rows aren't cut off by a global page.
      dispatch(fetchAllProductImages({ page: 1, page_size: 100, product: id }))
      dispatch(fetchAllBundleItems({ page: 1, page_size: 100, bundle: id }))
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

  // Computed display bundle items
  const displayBundleItems: DisplayBundleItem[] = useMemo(() => {
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

  const pageState = isEditing ? resolveDetailState(singleStatus, singleError, existing?.id === id) : null
  if (pageState) {
    return (
      <DetailPageState
        state={pageState}
        entity="Product"
        backTo="/products"
        backLabel="Back to Products"
        error={singleError}
        onRetry={() => id && dispatch(fetchSingle(id))}
      />
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

    if (isEditing && existing) {
      try {
        await dispatch(updateData({ id: existing.id, payload })).unwrap()
        toast.success(`${values.name} updated successfully`)
        navigate("/products")
      } catch {
        toast.error("Failed to save product. Please check required fields.")
      }
      return
    }

    let created
    try {
      created = await dispatch(postData({ payload })).unwrap()
    } catch {
      toast.error("Failed to save product. Please check required fields.")
      return
    }

    // The product now exists; attach its sub-resources and report each kind that failed
    // instead of claiming full success.
    const [imageResults, variantResults, bundleResults] = await Promise.all([
      Promise.allSettled(
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
      ),
      Promise.allSettled(
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
      ),
      Promise.allSettled(
        (values.product_type === "bundle" ? draftBundleItems : []).map((item) =>
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
      ),
    ])

    const failures = [
      describeFailures(imageResults, "image"),
      describeFailures(variantResults, "variant"),
      describeFailures(bundleResults, "bundle item"),
    ].filter((f): f is string => f !== null)

    if (failures.length > 0) {
      // Continue on the saved product's edit page so the missing pieces can be re-added
      // without creating a duplicate product.
      toast.error(`${values.name} was created, but some items failed to save`, {
        description: `Failed: ${failures.join(", ")}. Re-add them on this page.`,
        duration: 10000,
      })
      navigate(`/product_form/${created.id}`, { replace: true })
      return
    }

    toast.success(`${values.name} created successfully!`)
    navigate("/products")
  }

  const productId = isEditing ? existing?.id : undefined
  const formBasePrice = watch("base_price")

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
        <ProductBasicInfoSection
          control={control}
          register={register}
          errors={errors}
          categories={categories}
          currentProductType={currentProductType}
        />

        <ProductImagesSection
          isEditing={isEditing}
          productId={productId}
          images={images}
          draftImages={draftImages}
          setDraftImages={setDraftImages}
        />

        {/* Combo / Bundle Builder Section (Active when product_type === 'bundle') */}
        {currentProductType === "bundle" && (
          <ProductBundleSection
            control={control}
            register={register}
            isEditing={isEditing}
            productId={productId}
            allVariants={allVariants}
            displayBundleItems={displayBundleItems}
            draftBundleItems={draftBundleItems}
            setDraftBundleItems={setDraftBundleItems}
            currentPricingMode={currentPricingMode}
            currentDiscountPercent={currentDiscountPercent}
            formBasePrice={formBasePrice}
            totalBundleRegularValue={totalBundleRegularValue}
            computedBundleDiscountAmount={computedBundleDiscountAmount}
            computedDynamicBundlePrice={computedDynamicBundlePrice}
          />
        )}

        <ProductVariantsSection
          isEditing={isEditing}
          productId={productId}
          existingBasePrice={existing?.base_price}
          variants={variants}
          draftVariants={draftVariants}
          setDraftVariants={setDraftVariants}
          allAttributes={allAttributes}
          allAttributeValues={allAttributeValues}
          formName={watch("name")}
          formSlug={watch("slug")}
          formBasePrice={formBasePrice}
        />

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
