import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save, Trash2, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

import { productStatusOptions, productTypeOptions } from "@/features/catalog/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, postData, updateData } from "@/features/catalog/slices/productSlice"
import { fetchAll as fetchAllCategories } from "@/features/catalog/slices/categorySlice"
import {
  fetchAll as fetchAllProductImages,
  postData as postProductImage,
  deleteData as deleteProductImage,
} from "@/features/catalog/slices/productImageSlice"
import {
  fetchAll as fetchAllVariants,
  postData as postVariant,
  deleteData as deleteVariant,
} from "@/features/catalog/slices/variantSlice"
import type { VariantStatus } from "@/features/catalog/types"

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
  // The backend rejects a blank description with a 400 even though the OpenAPI
  // schema doesn't mark it required — enforce non-blank client-side to match.
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
  description: "",
}

const ProductForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.products)
  const { data: categories } = useAppSelector((state) => state.categories)
  const { data: allImages } = useAppSelector((state) => state.productImages)
  const { data: allVariants } = useAppSelector((state) => state.variants)

  const isEditing = id !== "new"
  const images = isEditing ? allImages.filter((img) => img.product === id) : []
  const variants = isEditing ? allVariants.filter((v) => v.product === id) : []

  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")

  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPrice, setNewVariantPrice] = useState("")
  const [newVariantStock, setNewVariantStock] = useState("")

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    dispatch(fetchAllCategories({ page: 1, page_size: 100 }))
    if (isEditing && id) {
      dispatch(fetchSingle(id))
      dispatch(fetchAllProductImages({ page: 1, page_size: 100 }))
      dispatch(fetchAllVariants({ page: 1, page_size: 100 }))
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
        description: existing.description ?? "",
      })
    }
  }, [existing, id, isEditing, reset])

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
    const payload = { ...values, base_price: String(values.base_price) }

    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload })).unwrap()
        toast.success(`${values.name} updated`)
        navigate("/products")
      } else {
        const created = await dispatch(postData({ payload })).unwrap()
        toast.success(`${values.name} created`)
        navigate(`/product_form/${created.id}`)
      }
    } catch {
      toast.error("Failed to save product")
    }
  }

  const handleAddImage = async () => {
    if (!existing?.id || !newImageUrl.trim()) return
    try {
      await dispatch(
        postProductImage({
          payload: {
            product: existing.id,
            image: newImageUrl.trim(),
            alt_text: newImageAlt.trim(),
            sort_order: images.length,
            is_primary: images.length === 0,
          },
        })
      ).unwrap()
      setNewImageUrl("")
      setNewImageAlt("")
      toast.success("Image added")
    } catch {
      toast.error("Failed to add image")
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await dispatch(deleteProductImage(imageId)).unwrap()
      toast.success("Image removed")
    } catch {
      toast.error("Failed to remove image")
    }
  }

  const handleAddVariant = async () => {
    if (!existing?.id || !newVariantSku.trim() || !newVariantName.trim()) return
    try {
      await dispatch(
        postVariant({
          payload: {
            product: existing.id,
            sku: newVariantSku.trim(),
            name: newVariantName.trim(),
            price: newVariantPrice.trim() || "0",
            stock_quantity: Number(newVariantStock) || 0,
            status: "active" as VariantStatus,
            image: "",
          },
        })
      ).unwrap()
      setNewVariantSku("")
      setNewVariantName("")
      setNewVariantPrice("")
      setNewVariantStock("")
      toast.success("Variant added")
    } catch {
      toast.error("Failed to add variant")
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await dispatch(deleteVariant(variantId)).unwrap()
      toast.success("Variant removed")
    } catch {
      toast.error("Failed to remove variant")
    }
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.name}` : "Create a new product in your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Product Name</FieldLabel>
              <FieldContent>
                <Input id="name" placeholder="e.g. iPhone 15 Pro" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <FieldContent>
                <Input id="slug" placeholder="e.g. iphone-15-pro" {...register("slug")} />
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
              <FieldLabel htmlFor="status">Status</FieldLabel>
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

            <Field>
              <FieldLabel htmlFor="base_price">Price ($)</FieldLabel>
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
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.product_type]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea id="description" rows={4} placeholder="Product description" {...register("description")} />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>

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
                <FieldLabel htmlFor="is_featured">Featured</FieldLabel>
              </FieldContent>
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {isEditing && existing?.id && (
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={img.image} alt={img.alt_text} className="h-28 w-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 rounded-full bg-primary/90 p-1 text-primary-foreground">
                        <Star className="h-3 w-3 fill-current" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 rounded-full bg-red-500/90 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="sm:flex-1"
              />
              <Input
                placeholder="Alt text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                className="sm:flex-1"
              />
              <Button type="button" onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                Add Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isEditing && existing?.id && (
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {variants.length > 0 && (
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{variant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        SKU: {variant.sku} · Stock: {variant.stock_quantity} · {variant.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">${Number(variant.price).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input placeholder="SKU" value={newVariantSku} onChange={(e) => setNewVariantSku(e.target.value)} />
              <Input placeholder="Name" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                value={newVariantPrice}
                onChange={(e) => setNewVariantPrice(e.target.value)}
              />
              <Input
                placeholder="Stock"
                type="number"
                value={newVariantStock}
                onChange={(e) => setNewVariantStock(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddVariant}
              disabled={!newVariantSku.trim() || !newVariantName.trim()}
              className="self-start"
            >
              Add Variant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProductForm
