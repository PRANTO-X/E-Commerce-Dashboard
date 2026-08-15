import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Edit2, Search, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll as fetchAllStaff } from "@/features/users/slices/staffSlice"
import { setUserRole } from "@/features/users/slices/customerSlice"
import type { UserRole } from "@/features/users/types"

// The backend has no custom Role-entity CRUD — only a fixed role enum (admin/staff/customer)
// plus a raw permissions array per staff member (see StaffForm.tsx for the permission
// checklist editor, backed by PATCH /admin/staff/{id}/permissions/). This page is the
// staff-facing view of that: browse staff, see their current role/permissions, and change role.

const roleOptions: UserRole[] = ["admin", "staff", "customer"]

const Roles = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { data: staffs } = useAppSelector((state) => state.staffs)

  useEffect(() => {
    dispatch(fetchAllStaff())
  }, [dispatch])

  const filteredStaff = staffs.filter((s) => {
    const name = [s.first_name, s.last_name].filter(Boolean).join(" ").toLowerCase()
    return name.includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSetRole = async (id: string, role: UserRole) => {
    setUpdatingId(id)
    try {
      await dispatch(setUserRole({ id, role })).unwrap()
      await dispatch(fetchAllStaff())
      toast.success("Role updated")
    } catch {
      toast.error("Failed to update role")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Staff Permissions</h1>
          <p className="text-muted-foreground">
            Manage staff roles and permissions. Detailed permission checklists live on each staff member's edit page.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Role and permission summary for every staff account.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-field-placeholder" />
              <Input
                placeholder="Search staff..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="p-0 border-0">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No staff members found"
                      description="No staff accounts match your current search criteria."
                    />
                  </TableCell>
                </TableRow>
              )}
              {filteredStaff.map((staff) => {
                const name = [staff.first_name, staff.last_name].filter(Boolean).join(" ")
                return (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{name || "—"}</span>
                        <span className="text-xs text-muted-foreground">{staff.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={staff.role}
                        onValueChange={(v) => handleSetRole(staff.id, v as UserRole)}
                        disabled={updatingId === staff.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.includes("*") ? (
                          <Badge variant="outline" className="gap-1">
                            <ShieldCheck className="h-3 w-3" /> All permissions
                          </Badge>
                        ) : staff.permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">None</span>
                        ) : (
                          staff.permissions.map((perm) => (
                            <Badge key={perm} variant="outline">
                              {perm}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-500"
                        onClick={() => navigate(`/staff_form/${staff.id}`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Roles
