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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, fetchSingle, postData, updateData } from "@/features/catalog/slices/categorySlice"

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[-a-zA-Z0-9_]+$/, "Use only letters, numbers, - and _"),
  description: z.string(),
  parent: z.string(),
  image: z.string(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0, "Must be 0 or greater"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

const NO_PARENT = "none"

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: categories, singleData: existing, isLoading } = useAppSelector((state) => state.categories)

  const isEditing = id !== "new"

  const parentOptions = categories.filter((c) => !c.parent && c.id !== (isEditing ? id : undefined))

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent: NO_PARENT,
      image: "",
      is_active: true,
      sort_order: 0,
    },
  })

  useEffect(() => {
    dispatch(fetchAll({ page: 1, page_size: 100 }))
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        name: existing.name,
        slug: existing.slug,
        description: existing.description ?? "",
        parent: existing.parent ?? NO_PARENT,
        image: existing.image ?? "",
        is_active: existing.is_active,
        sort_order: existing.sort_order ?? 0,
      })
    }
  }, [existing, id, isEditing, reset])

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading category...</div>
  }

  if (isEditing && existing?.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <Button className="mt-6" onClick={() => navigate("/categories")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: CategoryFormValues) => {
    const parent = values.parent === NO_PARENT ? null : values.parent
    const payload = { ...values, parent }

    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload })).unwrap()
        toast.success(`${values.name} updated`)
      } else {
        await dispatch(postData({ payload })).unwrap()
        toast.success(`${values.name} created`)
      }
      navigate("/categories")
    } catch {
      toast.error("Failed to save category")
    }
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/categories")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Category" : "Add Category"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.name}` : "Create a new category to organize your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Category Name</FieldLabel>
              <FieldContent>
                <Input id="name" placeholder="e.g. Smartphones" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <FieldContent>
                <Input id="slug" placeholder="e.g. smartphones" {...register("slug")} />
                <FieldError errors={[errors.slug]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="parent">Parent Category</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="parent"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="parent">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_PARENT}>None (top-level)</SelectItem>
                        {parentOptions.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.parent]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="sort_order">Sort Order</FieldLabel>
              <FieldContent>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register("sort_order", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.sort_order]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <FieldContent>
                <Input id="image" placeholder="https://..." {...register("image")} />
                <FieldError errors={[errors.image]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <FieldError errors={[errors.is_active]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea id="description" placeholder="Category description" {...register("description")} />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/categories")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default CategoryForm
