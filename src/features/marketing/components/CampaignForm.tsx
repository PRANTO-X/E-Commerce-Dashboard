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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, postData, updateData } from "@/features/marketing/slices/campaignSlice"

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[-a-zA-Z0-9_]+$/, "Use only letters, numbers, - and _"),
  campaign_type: z.enum(["mega", "landing", "seasonal"]),
  status: z.enum(["draft", "scheduled", "active", "ended"]),
  hero_title: z.string(),
  banner_image: z.string(),
  starts_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().min(1, "End date is required"),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

const toDatetimeLocal = (iso: string) => (iso ? iso.slice(0, 16) : "")

const CampaignForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.campaigns)

  const isEditing = id !== "new"

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      slug: "",
      campaign_type: "seasonal",
      status: "draft",
      hero_title: "",
      banner_image: "",
      starts_at: "",
      ends_at: "",
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
        name: existing.name,
        slug: existing.slug,
        campaign_type: existing.campaign_type,
        status: existing.status,
        hero_title: existing.hero_title ?? "",
        banner_image: existing.banner_image ?? "",
        starts_at: toDatetimeLocal(existing.starts_at),
        ends_at: toDatetimeLocal(existing.ends_at),
      })
    }
  }, [existing, id, isEditing, reset])

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading campaign...</div>
  }

  if (isEditing && existing?.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Campaign not found</h2>
        <Button className="mt-6" onClick={() => navigate("/campaigns")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: CampaignFormValues) => {
    const payload = {
      ...values,
      starts_at: new Date(values.starts_at).toISOString(),
      ends_at: new Date(values.ends_at).toISOString(),
    }

    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload })).unwrap()
        toast.success(`Campaign "${values.name}" updated`)
      } else {
        await dispatch(postData({ payload })).unwrap()
        toast.success(`Campaign "${values.name}" created`)
      }
      navigate("/campaigns")
    } catch {
      toast.error("Failed to save campaign")
    }
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Campaign" : "Add Campaign"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.name}` : "Schedule a new marketing campaign"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Campaign Name</FieldLabel>
              <FieldContent>
                <Input id="name" placeholder="e.g. Eid Mega Sale" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <FieldContent>
                <Input id="slug" placeholder="e.g. eid-mega-sale" {...register("slug")} />
                <FieldError errors={[errors.slug]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="campaign_type">Campaign Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="campaign_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="campaign_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mega">Mega</SelectItem>
                        <SelectItem value="landing">Landing</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.campaign_type]} />
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="starts_at">Start Date</FieldLabel>
              <FieldContent>
                <Input id="starts_at" type="datetime-local" {...register("starts_at")} />
                <FieldError errors={[errors.starts_at]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="ends_at">End Date</FieldLabel>
              <FieldContent>
                <Input id="ends_at" type="datetime-local" {...register("ends_at")} />
                <FieldError errors={[errors.ends_at]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="hero_title">Hero Title</FieldLabel>
              <FieldContent>
                <Input id="hero_title" placeholder="e.g. Up to 50% off" {...register("hero_title")} />
                <FieldError errors={[errors.hero_title]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="banner_image">Banner Image URL</FieldLabel>
              <FieldContent>
                <Input id="banner_image" placeholder="https://..." {...register("banner_image")} />
                <FieldError errors={[errors.banner_image]} />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/campaigns")}>
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
                  : "Create Campaign"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default CampaignForm
