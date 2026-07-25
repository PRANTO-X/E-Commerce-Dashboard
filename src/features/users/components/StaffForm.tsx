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

import { useAppData } from "@/store/AppDataProvider"
import { generateId } from "@/lib/utils"

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Manager", "Sales", "Support", "Editor"]),
  status: z.enum(["Active", "Inactive", "On Leave"]),
})

type StaffFormValues = z.infer<typeof staffSchema>

const roleOptions = ["Admin", "Manager", "Sales", "Support", "Editor"] as const
const statusOptions = ["Active", "Inactive", "On Leave"] as const

const StaffForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getStaffById, addStaff, updateStaff } = useAppData()

  const isEditing = id !== "new"
  const existing = isEditing ? getStaffById(id ?? "") : undefined

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: existing?.name ?? "",
      email: existing?.email ?? "",
      phone: existing?.phone ?? "",
      role: (existing?.role as StaffFormValues["role"]) ?? "Support",
      status: existing?.status ?? "Active",
    },
  })

  if (isEditing && !existing) {
    return (
      <div className="section-container py-12 text-center">
        <h2 className="text-2xl font-bold">Staff member not found</h2>
        <Button className="mt-6" onClick={() => navigate("/staffs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staff
        </Button>
      </div>
    )
  }

  const onSubmit = (values: StaffFormValues) => {
    if (isEditing && existing) {
      updateStaff(existing.id, values)
      toast.success(`${values.name} updated`)
    } else {
      addStaff({
        id: generateId("STAFF"),
        avatar: "",
        joinedAt: new Date().toISOString().slice(0, 10),
        ...values,
      })
      toast.success(`${values.name} added`)
    }
    navigate("/staffs")
  }

  return (
    <div className="section-container">
      <div className="flex items-center gap-4">
        <Button variant="back" size="icon" onClick={() => navigate("/staffs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Staff Member" : "Add Staff Member"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? `Editing ${existing?.name}` : "Invite a new team member"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Staff Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <FieldContent>
                <Input id="name" placeholder="e.g. Alice Johnson" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input id="email" type="email" placeholder="alice@example.com" {...register("email")} />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <FieldContent>
                <Input id="phone" placeholder="+8801712345671" {...register("phone")} />
                <FieldError errors={[errors.phone]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <FieldContent>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.role]} />
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
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
            <Button type="button" variant="outline" onClick={() => navigate("/staffs")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Add Staff"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default StaffForm
