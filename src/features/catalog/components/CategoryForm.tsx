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
  slug: z.string().min(2, "Slug is required"),
  parent: z.string(),
  status: z.enum(["active", "draft", "inactive"]),
})

type CategoryFormValues = z.infer<typeof categorySchema>

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "inactive" },
] as const

const NO_PARENT = "none"

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: categories, singleData: existing, isLoading } = useAppSelector((state) => state.categories)

  const isEditing = id !== "new"

  const topLevelCategories = categories.filter((c) => !c.parent && c.id !== (isEditing ? id : undefined))

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
      parent: NO_PARENT,
      status: "active",
    },
  })

  useEffect(() => {
    dispatch(fetchAll())
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        name: existing.name,
        slug: existing.slug,
        parent: existing.parent ?? NO_PARENT,
        status: existing.status,
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

    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload: { ...existing, ...values, parent } })).unwrap()
        toast.success(`${values.name} updated`)
      } else {
        await dispatch(
          postData({
            payload: {
              name: values.name,
              slug: values.slug,
              parent,
              status: values.status,
              products: 0,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          })
        ).unwrap()
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
                        {topLevelCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
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
