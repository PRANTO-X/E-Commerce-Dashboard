import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { products, statusStyles, type ProductStatus } from "@/assets/Data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionButton } from "@/components/common/ActionButton"
import {
  ArrowLeft,
  Edit,
  Star,
  Package,
  ShoppingCart,
  Calendar,
  Tag,
  Hash,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
        <Button variant="ghost" onClick={() => navigate("/products")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="section-container animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/products")}
            className="rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Product Details
            </h1>
            <p className="text-muted-foreground text-sm">
              Detailed information about {product.product}
            </p>
          </div>
        </div>
        <ActionButton onClick={()=> navigate(`/product_form/${product.id}`)} variant="apply" icon={Edit}>Edit Product</ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image and Primary Info */}
        <Card className="lg:col-span-1 h-full overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={product.image}
              alt={product.product}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </div>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge
                  className={`${
                    statusStyles[product.status as ProductStatus]
                  } border-none mb-2`}
                >
                  {product.status.toUpperCase()}
                </Badge>
                <h2 className="text-2xl font-bold text-foreground">
                  {product.product}
                </h2>
                <p className="text-muted-foreground text-sm flex items-center mt-1">
                  <Hash className="h-3 w-3 mr-1" /> {product.sku}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-500 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "text-muted-foreground opacity-30"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">
                {product.rating} (Customer Rating)
              </span>
            </div>

            <div className="mt-auto">
              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <Package className="h-3 w-3 mr-1" /> Stock Available
                  </p>
                  <p className="text-lg font-bold">{product.stock || 0} Units</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center">
                    <ShoppingCart className="h-3 w-3 mr-1" /> Total Sales
                  </p>
                  <p className="text-lg font-bold">{product.sales} Sales</p>
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
                {product.description ||
                  "No description provided for this product. High-quality materials and craftsmanship ensure durability and performance."}
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
                  <p className="text-sm font-medium capitalize">
                    {product.category.replace("_", " ")}
                  </p>
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
                  <p className="text-sm font-medium">{product.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    SKU Number
                  </p>
                  <p className="text-sm font-medium">{product.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Availability
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      product.status === "active"
                        ? "text-green-500 border-green-500/20 bg-green-500/5"
                        : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                    }
                  >
                    {product.status === "active" ? "In Stock" : "Limited Stock"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional: Add more sections like Pricing History, Recent Activity, or Related Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex items-end gap-2 h-20 pt-4">
                      {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                         <div 
                            key={i} 
                            className="flex-1 bg-primary/20 hover:bg-primary rounded-t-sm transition-colors cursor-pointer" 
                            style={{ height: `${h}%` }}
                         />
                      ))}
                   </div>
                   <p className="text-xs text-muted-foreground mt-4 text-center">Sales trend over the last 7 months</p>
                </CardContent>
             </Card>

             <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-2">
                   <Button variant="outline" className="w-full justify-start text-xs h-8">
                      Duplicate Product
                   </Button>
                   <Button variant="outline" className="w-full justify-start text-xs h-8">
                      View on Storefront
                   </Button>
                   <Button variant="outline" className="w-full justify-start text-xs h-8 text-red-500 hover:text-red-500">
                      Archive Product
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
