import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
  productStatusOptions,
  productTypeOptions,
  type Category,
  type ProductType,
} from "@/features/catalog/types"
import type { ProductFormValues } from "@/features/catalog/productFormSchema"

interface ProductBasicInfoSectionProps {
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  categories: Category[]
  currentProductType: ProductType
}

export function ProductBasicInfoSection({
  control,
  register,
  errors,
  categories,
  currentProductType,
}: ProductBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>Basic Information</CardTitle>
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
  )
}
