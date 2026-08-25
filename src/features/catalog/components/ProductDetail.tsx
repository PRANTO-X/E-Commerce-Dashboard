import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { ProductStatus } from "@/features/catalog/types"
import { StatusBadge } from "@/components/common/StatusBadge"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { fetchAll as fetchAllProductImages } from "@/features/catalog/slices/productImageSlice"
import { fetchAll as fetchAllVariants } from "@/features/catalog/slices/variantSlice"
import { fetchAll as fetchAllBundleItems } from "@/features/catalog/slices/bundleItemSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  Tag,
  Hash,
  PackageSearch,
  Boxes,
  Layers,
  Sparkles,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { singleData: product, isLoading } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)
  const { data: allVariants } = useAppSelector((state) => state.variants)
  const { data: allBundleItems } = useAppSelector((state) => state.bundleItems)

  useEffect(() => {
    if (id) {
      dispatch(fetchSingle(id))
      dispatch(fetchAllProductImages({ page: 1, page_size: 100 }))
      dispatch(fetchAllVariants({ page: 1, page_size: 1000 }))
      dispatch(fetchAllBundleItems({ page: 1, page_size: 1000 }))
    }
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
  }, [dispatch, id])

  if (isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading product...</div>
  }

  if (!product || product.id !== id) {
    return (
      <div className="section-container space-y-0 flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="mb-6 rounded-full bg-muted p-6">
          <PackageSearch className="h-12 w-12 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-bold text-foreground font-heading">
          Product Not Found
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground font-text">
          The product you're looking for doesn't exist or may have been removed.
        </p>

        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="mt-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Products
        </Button>
      </div>
    )
  }

  const images = allImages.filter((img) => img.product === product.id)
  const primaryImage = images.find((img) => img.is_primary) ?? images[0]
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? "—"
  const variants = allVariants.filter((v) => v.product === product.id)
  const bundleItems = allBundleItems.filter((b) => b.bundle === product.id)

  const isBundle = product.product_type === "bundle"

  // Calculate bundle components value
  const bundleComponents = bundleItems.map((item) => {
    const matchedVariant = allVariants.find((v) => v.id === item.variant)
    const price = matchedVariant ? Number(matchedVariant.price) : 0
    return {
      ...item,
      variantName: item.variant_name || matchedVariant?.name || "Bundled Item",
      variantSku: item.variant_sku || matchedVariant?.sku || "",
      price,
      subtotal: price * item.quantity,
    }
  })

  const totalBundleRegularValue = bundleComponents.reduce((sum, item) => sum + item.subtotal, 0)
  const discountPercent = Number(product.bundle_discount_percent || 0)
  const savings = totalBundleRegularValue - Number(product.base_price)

  return (
    <div className="section-container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="back"
            size="icon"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              {isBundle && (
                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Boxes className="h-3.5 w-3.5 mr-1" /> Combo Bundle
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Detailed product specifications, variations, and catalog information
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/product_form/${product.id}`)}
          variant="apply"
          size="action"
        >
          <Edit className="size-5" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image and Primary Info */}
        <Card className="lg:col-span-1 h-full overflow-hidden border border-border shadow-sm bg-card flex flex-col">
          <div className="aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
            {primaryImage ? (
              <img
                src={primaryImage.image}
                alt={primaryImage.alt_text || product.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground/50" />
            )}
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <StatusBadge status={product.status as ProductStatus} className="border-none mb-2" />
                <h2 className="text-2xl font-bold text-foreground">
                  {product.name}
                </h2>
                <p className="text-muted-foreground text-sm flex items-center mt-1">
                  <Hash className="h-3 w-3 mr-1" /> {product.slug}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${Number(product.base_price).toFixed(2)}
                </p>
                {isBundle && savings > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">
                    Save ${savings.toFixed(2)} ({discountPercent}%)
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <Tag className="h-3 w-3 mr-1" /> Product Type
                  </p>
                  <p className="text-sm font-bold capitalize">{product.product_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <Package className="h-3 w-3 mr-1" /> Featured
                  </p>
                  <p className="text-sm font-bold">{product.is_featured ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description provided for this product."}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle>Specifications & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Category
                  </p>
                  <p className="text-sm font-medium">{categoryName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Created At
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Requires Shipping
                  </p>
                  <p className="text-sm font-medium">{product.requires_shipping ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Downloadable / Recurring
                  </p>
                  <p className="text-sm font-medium">
                    {product.is_downloadable ? "Downloadable" : "—"}
                    {product.is_downloadable && product.is_recurring ? " · " : ""}
                    {product.is_recurring ? "Recurring" : ""}
                    {!product.is_downloadable && !product.is_recurring ? "Physical Product" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Combo Bundle Details Card */}
          {isBundle && (
            <Card className="border-purple-500/30 shadow-sm bg-purple-50/10 dark:bg-purple-950/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Boxes className="h-5 w-5" /> Combo Bundle Components
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400">
                    {bundleComponents.length} items bundled
                  </Badge>
                </div>
                <CardDescription>
                  This product is a combo package containing the following items:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bundleComponents.length > 0 ? (
                  <div className="divide-y rounded-xl border border-border bg-card overflow-hidden">
                    <div className="bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase grid grid-cols-12">
                      <span className="col-span-6">Component</span>
                      <span className="col-span-2 text-right">Unit Price</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Subtotal</span>
                    </div>
                    {bundleComponents.map((item) => (
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
                        <div className="col-span-2 text-right font-semibold text-foreground">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No components linked to this bundle yet. Click "Edit Product" to add items.
                  </p>
                )}

                {totalBundleRegularValue > 0 && (
                  <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Regular Components Value:</span>
                      <span className="font-medium text-foreground">${totalBundleRegularValue.toFixed(2)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Bundle Discount:</span>
                        <span>{discountPercent}%</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-purple-500/20 font-bold text-base">
                      <span>Bundle Package Price:</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        ${Number(product.base_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feature 4: Product Variations Card */}
          {variants.length > 0 && (
            <Card className="border border-border shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" /> Product Variations ({variants.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y rounded-xl border border-border bg-card overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase grid grid-cols-12">
                    <span className="col-span-5">Variation</span>
                    <span className="col-span-3">SKU</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">Stock</span>
                  </div>
                  {variants.map((v) => (
                    <div key={v.id} className="px-4 py-3 grid grid-cols-12 items-center text-sm">
                      <div className="col-span-5">
                        <p className="font-medium text-foreground">{v.name}</p>
                      </div>
                      <div className="col-span-3 font-mono text-xs text-muted-foreground">
                        {v.sku}
                      </div>
                      <div className="col-span-2 text-right font-semibold text-foreground">
                        ${Number(v.price).toFixed(2)}
                      </div>
                      <div className="col-span-2 text-right">
                        <Badge
                          variant="outline"
                          className={
                            v.stock_quantity > 0
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {v.stock_quantity} units
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Images Gallery */}
          {images.length > 0 && (
            <Card className="border border-border shadow-sm bg-card">
              <CardHeader>
                <CardTitle>Image Gallery ({images.length})</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border border-border aspect-square">
                    <img
                      src={img.image}
                      alt={img.alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
