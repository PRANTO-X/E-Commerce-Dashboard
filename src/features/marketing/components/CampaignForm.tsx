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
import { Checkbox } from "@/components/ui/checkbox"
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
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  type: z.enum(["flash_sale", "mega_event", "seasonal"]),
  bannerImage: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "scheduled", "active", "ended"]),
  description: z.string().optional(),
  productIds: z.array(z.string()),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

const CampaignForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.campaigns)
  const { data: products } = useAppSelector((state) => state.products)

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
      type: "flash_sale",
      bannerImage: "",
      startDate: "",
      endDate: "",
      status: "draft",
      description: "",
      productIds: [],
    },
  })

  useEffect(() => {
    dispatch(fetchAllProducts())
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        name: existing.name,
        type: existing.type,
        bannerImage: existing.bannerImage ?? "",
        startDate: existing.startDate,
        endDate: existing.endDate,
        status: existing.status,
        description: existing.description ?? "",
        productIds: existing.productIds,
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
    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload: { ...existing, ...values } })).unwrap()
        toast.success(`Campaign "${values.name}" updated`)
      } else {
        await dispatch(
          postData({ payload: { ...values, createdAt: new Date().toISOString().slice(0, 10) } })
        ).unwrap()
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
            {isEditing ? `Editing ${existing?.name}` : "Schedule a new flash sale or mega campaign event"}
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
              <FieldLabel htmlFor="type">Campaign Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flash_sale">Flash Sale</SelectItem>
                        <SelectItem value="mega_event">Mega Event</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.type]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
              <FieldContent>
                <Input id="startDate" type="date" {...register("startDate")} />
                <FieldError errors={[errors.startDate]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="endDate">End Date</FieldLabel>
              <FieldContent>
                <Input id="endDate" type="date" {...register("endDate")} />
                <FieldError errors={[errors.endDate]} />
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
              <FieldLabel htmlFor="bannerImage">Banner Image URL</FieldLabel>
              <FieldContent>
                <Input id="bannerImage" placeholder="/images/product-1.jpg" {...register("bannerImage")} />
                <FieldError errors={[errors.bannerImage]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea id="description" rows={3} placeholder="Campaign description" {...register("description")} />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Linked Products</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="productIds"
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-lg border border-field-border p-3">
                      {products.map((product) => {
                        const checked = field.value.includes(product.id)
                        return (
                          <label
                            key={product.id}
                            className="flex items-center gap-2 text-sm cursor-pointer rounded-md p-1.5 hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                if (value) {
                                  field.onChange([...field.value, product.id])
                                } else {
                                  field.onChange(field.value.filter((pid) => pid !== product.id))
                                }
                              }}
                            />
                            <span className="truncate">{product.product}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/campaigns")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Campaign"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default CampaignForm
