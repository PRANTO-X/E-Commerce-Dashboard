import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

import { categoryOptions, type ProductStatus } from "@/assets/Data"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, postData, updateData } from "@/features/catalog/slices/productSlice"

const productSchema = z.object({
  product: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU is required"),
  category: z.string().min(1, "Select a category"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  status: z.enum(["active", "draft", "archived", "inactive"]),
  image: z.string().min(1, "Image URL is required"),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

const statusOptions: { label: string; value: ProductStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
  { label: "Inactive", value: "inactive" },
]

const defaultFormValues: ProductFormValues = {
  product: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  status: "draft",
  image: "/images/product-1.jpg",
  description: "",
}

const ProductForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.products)

  const isEditing = id !== "new"

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
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        product: existing.product,
        sku: existing.sku,
        category: existing.category,
        price: existing.price,
        stock: existing.stock ?? 0,
        status: existing.status,
        image: existing.image,
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
    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload: { ...existing, ...values } })).unwrap()
        toast.success(`${values.product} updated`)
      } else {
        await dispatch(
          postData({
            payload: { ...values, rating: 0, sales: 0, createdAt: new Date().toISOString().slice(0, 10) },
          })
        ).unwrap()
        toast.success(`${values.product} created`)
      }
      navigate("/products")
    } catch {
      toast.error("Failed to save product")
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
            {isEditing ? `Editing ${existing?.product}` : "Create a new product in your catalog"}
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
              <FieldLabel htmlFor="product">Product Name</FieldLabel>
              <FieldContent>
                <Input id="product" placeholder="e.g. iPhone 15 Pro" {...register("product")} />
                <FieldError errors={[errors.product]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="sku">SKU</FieldLabel>
              <FieldContent>
                <Input id="sku" placeholder="e.g. APL-IP15P-256" {...register("sku")} />
                <FieldError errors={[errors.sku]} />
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
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                        {statusOptions.map((opt) => (
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
              <FieldLabel htmlFor="price">Price ($)</FieldLabel>
              <FieldContent>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                <FieldError errors={[errors.price]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="stock">Stock Quantity</FieldLabel>
              <FieldContent>
                <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} />
                <FieldError errors={[errors.stock]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <FieldContent>
                <Input id="image" placeholder="/images/product-1.jpg" {...register("image")} />
                <FieldError errors={[errors.image]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea id="description" rows={4} placeholder="Product description" {...register("description")} />
                <FieldError errors={[errors.description]} />
              </FieldContent>
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
    </div>
  )
}

export default ProductForm
