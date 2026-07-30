import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productStatusStyles, type ProductStatus } from "@/features/catalog/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import { fetchAll as fetchAllProductImages } from "@/features/catalog/slices/productImageSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  Tag,
  Hash,
  PackageSearch,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: product, isLoading } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)

  useEffect(() => {
    if (id) {
      dispatch(fetchSingle(id))
      dispatch(fetchAllProductImages({ page: 1, page_size: 100 }))
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
          onClick={() => navigate(-1)}
          className="mt-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Previous Page
        </Button>
      </div>
    )
  }

  const images = allImages.filter((img) => img.product === product.id)
  const primaryImage = images.find((img) => img.is_primary) ?? images[0]
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? "—"

  return (
    <div className="section-container ">
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Product Details
            </h1>
            <p className="text-muted-foreground text-sm">
              Detailed information about {product.name}
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
        <Card className="lg:col-span-1 h-full overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
            {primaryImage ? (
              <img
                src={primaryImage.image}
                alt={primaryImage.alt_text || product.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className={`${productStatusStyles[product.status as ProductStatus]} border-none mb-2`}>
                  {product.status.toUpperCase()}
                </Badge>
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
              </div>
            </div>

            <div className="mt-auto">
              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <Tag className="h-3 w-3 mr-1" /> Product Type
                  </p>
                  <p className="text-lg font-bold capitalize">{product.product_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <Package className="h-3 w-3 mr-1" /> Featured
                  </p>
                  <p className="text-lg font-bold">{product.is_featured ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm flex-1">
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description provided for this product."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
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
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Downloadable / Recurring
                  </p>
                  <p className="text-sm font-medium">
                    {product.is_downloadable ? "Downloadable" : "—"}
                    {product.is_downloadable && product.is_recurring ? " · " : ""}
                    {product.is_recurring ? "Recurring" : ""}
                    {!product.is_downloadable && !product.is_recurring ? "—" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {images.length > 0 && (
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt={img.alt_text || product.name}
                    className="h-24 w-full rounded-lg object-cover"
                  />
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
