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
import { fetchSingle, postData, patchData } from "@/features/marketing/slices/couponSlice"

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().min(1, "Description is required"),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().min(0, "Value cannot be negative"),
  min_order_value: z.number().min(0),
  max_discount_amount: z.number().nullable(),
  max_usage_count: z.number().int().nullable(),
  per_customer_limit: z.number().int().min(0),
  valid_from: z.string().min(1, "Start date is required"),
  valid_until: z.string(),
  is_active: z.boolean(),
})

type CouponFormValues = z.infer<typeof couponSchema>

const defaultValues: CouponFormValues = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_value: 0,
  max_discount_amount: null,
  max_usage_count: null,
  per_customer_limit: 1,
  valid_from: "",
  valid_until: "",
  is_active: true,
}

const toDatetimeLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : "")

const CouponForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.coupons)

  const isEditing = id !== "new"

  const {
    control,
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues,
  })

  const discountType = watch("discount_type")

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing && existing.id === id) {
      reset({
        code: existing.code,
        description: existing.description,
        discount_type: existing.discount_type,
        discount_value: Number(existing.discount_value),
        min_order_value: Number(existing.min_order_value),
        max_discount_amount: existing.max_discount_amount ? Number(existing.max_discount_amount) : null,
        max_usage_count: existing.max_usage_count,
        per_customer_limit: existing.per_customer_limit,
        valid_from: toDatetimeLocal(existing.valid_from),
        valid_until: toDatetimeLocal(existing.valid_until),
        is_active: existing.is_active,
      })
    }
  }, [existing, id, isEditing, reset])

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading coupon...</div>
  }

  if (isEditing && existing?.id !== id) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Coupon not found</h2>
        <Button className="mt-6" onClick={() => navigate("/coupons")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
      </div>
    )
  }

  const onSubmit = async (values: CouponFormValues) => {
    const payload = {
      code: values.code,
      description: values.description,
      discount_type: values.discount_type,
      discount_value: String(values.discount_value),
      min_order_value: String(values.min_order_value),
      max_discount_amount: values.max_discount_amount != null ? String(values.max_discount_amount) : null,
      max_usage_count: values.max_usage_count,
      per_customer_limit: values.per_customer_limit,
      valid_from: new Date(values.valid_from).toISOString(),
      valid_until: values.valid_until ? new Date(values.valid_until).toISOString() : null,
      is_active: values.is_active,
    }

    try {
      if (isEditing && existing) {
        await dispatch(patchData({ id: existing.id, payload })).unwrap()
        toast.success(`Coupon ${values.code} updated`)
      } else {
        await dispatch(postData({ payload })).unwrap()
        toast.success(`Coupon ${values.code} created`)
      }
      navigate("/coupons")
    } catch {
      toast.error("Failed to save coupon")
    }
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/coupons")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Coupon" : "Add Coupon"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.code}` : "Create a new discount code"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="code">Coupon Code</FieldLabel>
              <FieldContent>
                <Input id="code" placeholder="e.g. WELCOME10" className="font-mono uppercase" {...register("code")} />
                <FieldError errors={[errors.code]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="discount_type">Discount Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="discount_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="discount_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.discount_type]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="discount_value">
                {discountType === "percentage" ? "Percentage (%)" : "Amount ($)"}
              </FieldLabel>
              <FieldContent>
                <Input id="discount_value" type="number" step="0.01" {...register("discount_value", { valueAsNumber: true })} />
                <FieldError errors={[errors.discount_value]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="min_order_value">Minimum Order Value ($)</FieldLabel>
              <FieldContent>
                <Input id="min_order_value" type="number" step="0.01" {...register("min_order_value", { valueAsNumber: true })} />
                <FieldError errors={[errors.min_order_value]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="max_discount_amount">Max Discount Amount ($, optional)</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="max_discount_amount"
                  render={({ field }) => (
                    <Input
                      id="max_discount_amount"
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="max_usage_count">Max Usage Count (optional)</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="max_usage_count"
                  render={({ field }) => (
                    <Input
                      id="max_usage_count"
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    />
                  )}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="per_customer_limit">Per-Customer Limit</FieldLabel>
              <FieldContent>
                <Input id="per_customer_limit" type="number" {...register("per_customer_limit", { valueAsNumber: true })} />
                <FieldError errors={[errors.per_customer_limit]} />
              </FieldContent>
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="is_active">Active</FieldLabel>
              </FieldContent>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="valid_from">Valid From</FieldLabel>
              <FieldContent>
                <Input id="valid_from" type="datetime-local" {...register("valid_from")} />
                <FieldError errors={[errors.valid_from]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="valid_until">Valid Until (optional)</FieldLabel>
              <FieldContent>
                <Input id="valid_until" type="datetime-local" {...register("valid_until")} />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Textarea id="description" placeholder="Coupon description" {...register("description")} />
                <FieldError errors={[errors.description]} />
              </FieldContent>
            </Field>
          </CardContent>
          <CardFooter className="justify-end gap-3 border-t p-4">
            <Button type="button" variant="outline" onClick={() => navigate("/coupons")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Coupon"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default CouponForm
