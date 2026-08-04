import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Save } from "lucide-react"

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
import { fetchSingle, postData, updateData } from "@/features/cms/slices/pageSlice"

const pageSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[-a-zA-Z0-9_]+$/, "Use only letters, numbers, - and _"),
  page_type: z.enum(["landing", "brand", "static"]),
  body: z.string().min(1, "Body is required"),
  hero_image: z.string(),
  is_published: z.boolean(),
})

type PageFormValues = z.infer<typeof pageSchema>

const PageForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.pages)

  const isEditing = id !== "new"

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      slug: "",
      page_type: "static",
      body: "",
      hero_image: "",
      is_published: false,
    },
  })

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        title: existing.title,
        slug: existing.slug,
        page_type: existing.page_type,
        body: existing.body,
        hero_image: existing.hero_image ?? "",
        is_published: existing.is_published,
      })
    }
  }, [existing, id, isEditing, reset])

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading page...</div>
  }

  if (isEditing && existing?.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Page not found</h2>
        <Button className="mt-6" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pages
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: PageFormValues) => {
    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload: values })).unwrap()
        toast.success(`${values.title} updated`)
      } else {
        await dispatch(postData({ payload: values })).unwrap()
        toast.success(`${values.title} created`)
      }
      navigate("/pages")
    } catch {
      toast.error("Failed to save page")
    }
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Page" : "Add Page"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.title}` : "Create a new content page"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <FieldContent>
                <Input id="title" placeholder="e.g. About Us" {...register("title")} />
                <FieldError errors={[errors.title]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <FieldContent>
                <Input id="slug" placeholder="e.g. about-us" {...register("slug")} />
                <FieldError errors={[errors.slug]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="page_type">Page Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="page_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="page_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landing">Landing</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="static">Static</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.page_type]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="hero_image">Hero Image URL</FieldLabel>
              <FieldContent>
                <Input id="hero_image" placeholder="https://..." {...register("hero_image")} />
              </FieldContent>
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="is_published">Published</FieldLabel>
              </FieldContent>
              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <Switch id="is_published" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="body">Body</FieldLabel>
              <FieldContent>
                <Textarea id="body" rows={8} placeholder="Page content" {...register("body")} />
                <FieldError errors={[errors.body]} />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/pages")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Page"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default PageForm
