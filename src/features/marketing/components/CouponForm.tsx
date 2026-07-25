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
import { fetchSingle, postData, updateData } from "@/features/marketing/slices/couponSlice"

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().min(0, "Value cannot be negative"),
  minOrderAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().positive("Usage limit must be at least 1"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.enum(["active", "scheduled", "expired", "disabled"]),
})

type CouponFormValues = z.infer<typeof couponSchema>

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
    defaultValues: {
      code: "",
      type: "percent",
      value: 10,
      minOrderAmount: undefined,
      usageLimit: 100,
      expiryDate: "",
      status: "active",
    },
  })

  const type = watch("type")

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  useEffect(() => {
    if (isEditing && existing?.id === id) {
      reset({
        code: existing.code,
        type: existing.type,
        value: existing.value,
        minOrderAmount: existing.minOrderAmount,
        usageLimit: existing.usageLimit,
        expiryDate: existing.expiryDate,
        status: existing.status,
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
    try {
      if (isEditing && existing) {
        await dispatch(updateData({ id: existing.id, payload: { ...existing, ...values } })).unwrap()
        toast.success(`Coupon ${values.code} updated`)
      } else {
        await dispatch(
          postData({
            payload: { ...values, usedCount: 0, createdAt: new Date().toISOString().slice(0, 10) },
          })
        ).unwrap()
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
            {isEditing ? `Editing ${existing?.code}` : "Create a new discount code or voucher"}
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
              <FieldLabel htmlFor="type">Discount Type</FieldLabel>
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
                        <SelectItem value="percent">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.type]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="value">
                {type === "percent" ? "Percentage (%)" : type === "fixed" ? "Amount ($)" : "Value"}
              </FieldLabel>
              <FieldContent>
                <Input id="value" type="number" step="0.01" disabled={type === "free_shipping"} {...register("value", { valueAsNumber: true })} />
                <FieldError errors={[errors.value]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="minOrderAmount">Minimum Order Amount ($)</FieldLabel>
              <FieldContent>
                <Input id="minOrderAmount" type="number" step="0.01" {...register("minOrderAmount", { valueAsNumber: true })} />
                <FieldError errors={[errors.minOrderAmount]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="usageLimit">Usage Limit</FieldLabel>
              <FieldContent>
                <Input id="usageLimit" type="number" {...register("usageLimit", { valueAsNumber: true })} />
                <FieldError errors={[errors.usageLimit]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="expiryDate">Expiry Date</FieldLabel>
              <FieldContent>
                <Input id="expiryDate" type="date" {...register("expiryDate")} />
                <FieldError errors={[errors.expiryDate]} />
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
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
