import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSingle, postData, patchData, updateStaffPermissions } from "@/features/users/slices/staffSlice"
import { permissionCodes, type PermissionCode } from "@/features/users/types"

const createSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
})

const editSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  is_active: z.boolean(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

const StaffForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { singleData: existing, isLoading } = useAppSelector((state) => state.staffs)

  const isEditing = id !== "new"
  const [selectedPermissions, setSelectedPermissions] = useState<Set<PermissionCode>>(new Set())
  const [savingPermissions, setSavingPermissions] = useState(false)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", password: "", first_name: "", last_name: "", phone: "" },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { first_name: "", last_name: "", phone: "", is_active: true },
  })

  const [syncedFor, setSyncedFor] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchSingle(id))
    }
  }, [dispatch, id, isEditing])

  // Sync the form + permission checklist once per loaded staff member, without a state-setting effect.
  if (isEditing && existing && existing.id === id && existing.id !== syncedFor) {
    setSyncedFor(existing.id)
    editForm.reset({
      first_name: existing.first_name,
      last_name: existing.last_name,
      phone: existing.phone,
      is_active: existing.is_active,
    })
    setSelectedPermissions(new Set(existing.permissions.filter((p): p is PermissionCode => p !== "*") as PermissionCode[]))
  }

  if (isEditing && isLoading) {
    return <div className="section-container py-12 text-center text-muted-foreground">Loading staff member...</div>
  }

  if (isEditing && existing && existing.id !== id) {
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

  const togglePermission = (code: PermissionCode) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const handleCreate = async (values: CreateFormValues) => {
    try {
      const created = await dispatch(
        postData({
          payload: { ...values, permissions: Array.from(selectedPermissions) },
        })
      ).unwrap()
      toast.success(`${values.email} added`)
      navigate(`/staff_form/${created.id}`)
    } catch {
      toast.error("Failed to add staff member")
    }
  }

  const handleUpdate = async (values: EditFormValues) => {
    if (!existing) return
    try {
      await dispatch(patchData({ id: existing.id, payload: values })).unwrap()
      toast.success("Staff member updated")
    } catch {
      toast.error("Failed to update staff member")
    }
  }

  const handleSavePermissions = async () => {
    if (!existing) return
    setSavingPermissions(true)
    try {
      const changes = permissionCodes.map((code) => ({ code, enabled: selectedPermissions.has(code) }))
      await dispatch(updateStaffPermissions({ id: existing.id, changes })).unwrap()
      toast.success("Permissions updated")
    } catch {
      toast.error("Failed to update permissions")
    } finally {
      setSavingPermissions(false)
    }
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
            {isEditing ? `Editing ${existing?.email}` : "Invite a new team member"}
          </p>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={editForm.handleSubmit(handleUpdate)}>
          <Card>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                <FieldContent>
                  <Input id="first_name" {...editForm.register("first_name")} />
                  <FieldError errors={[editForm.formState.errors.first_name]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                <FieldContent>
                  <Input id="last_name" {...editForm.register("last_name")} />
                  <FieldError errors={[editForm.formState.errors.last_name]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <FieldContent>
                  <Input id="phone" {...editForm.register("phone")} />
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="is_active">Active</FieldLabel>
                </FieldContent>
                <Controller
                  control={editForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-end gap-3 border-t p-4">
              <Button type="button" variant="outline" onClick={() => navigate("/staffs")}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <form onSubmit={createForm.handleSubmit(handleCreate)}>
          <Card>
            <CardHeader>
              <CardTitle>Staff Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input id="email" type="email" {...createForm.register("email")} />
                  <FieldError errors={[createForm.formState.errors.email]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Temporary Password</FieldLabel>
                <FieldContent>
                  <Input id="password" type="password" {...createForm.register("password")} />
                  <FieldError errors={[createForm.formState.errors.password]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                <FieldContent>
                  <Input id="first_name" {...createForm.register("first_name")} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                <FieldContent>
                  <Input id="last_name" {...createForm.register("last_name")} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <FieldContent>
                  <Input id="phone" {...createForm.register("phone")} />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </form>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permissionCodes.map((code) => (
            <label key={code} className="flex items-center gap-2 text-sm cursor-pointer rounded-md p-1.5 hover:bg-muted/50">
              <Checkbox checked={selectedPermissions.has(code)} onCheckedChange={() => togglePermission(code)} />
              <span>{code}</span>
            </label>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t p-4">
          {isEditing ? (
            <Button onClick={handleSavePermissions} disabled={savingPermissions}>
              <Save className="h-4 w-4" />
              Save Permissions
            </Button>
          ) : (
            <Button onClick={createForm.handleSubmit(handleCreate)} disabled={createForm.formState.isSubmitting}>
              <Save className="h-4 w-4" />
              Create Staff Member
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default StaffForm
