import { useState } from "react"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  PlusIcon,
  Search,
  Edit2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useAppData } from "@/store/AppDataProvider"
import { toast } from "sonner"
import { generateId } from "@/lib/utils"

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const { roles, addRole, deleteRole } = useAppData()

  const handleCreateRole = () => {
    const name = window.prompt("New role name?")
    if (!name) return
    addRole({
      id: generateId("ROLE"),
      name,
      description: "Custom role — configure permissions from the permission matrix.",
      usersCount: 0,
      type: "Custom",
      permissions: [],
      level: "Low",
    })
    toast.success(`Role "${name}" created`)
  }

  const handleDeleteRole = (id: string, name: string) => {
    deleteRole(id)
    toast.success(`Role "${name}" deleted`)
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const tableHeaders = [
    "Role Name",
    "Description",
    "Permissions",
    "Users",
    "Actions",
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Define and manage user roles and their associated access levels.
          </p>
        </div>
        <Button
          variant="primary"
          size="action"
          onClick={handleCreateRole}
        >
          <PlusIcon className="size-5" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                A list of all roles defined in your organization.
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-field-placeholder" />
              <Input
                placeholder="Search roles..."
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
                {tableHeaders.map((header) => (
                  <TableHead
                    key={header}
                    className={
                      header === "Role Name"
                        ? "w-[200px]"
                        : header === "Users"
                          ? "text-center"
                          : header === "Actions"
                            ? "text-right"
                            : ""
                    }
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {role.level === "High" ? (
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                      ) : role.level === "Medium" ? (
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{role.name}</span>
                      {role.type === "System" && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {role.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm, index) => (
                        <Badge key={index} variant="outline">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                      {role.usersCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-500"
                        onClick={() => toast.info("Role editing form isn't built yet — coming in a future update.")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={role.type === "System"}
                        onClick={() => handleDeleteRole(role.id, role.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PERMISSION MATRIX HINT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Permission Overview</CardTitle>
            <CardDescription>
              Most common permission groups assigned to roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Catalog Management",
                  desc: "View, create, edit and delete products and categories.",
                  roles: 3,
                },
                {
                  name: "Order Processing",
                  desc: "Manage order status, payments and shipping.",
                  roles: 2,
                },
                {
                  name: "Customer Support",
                  desc: "Access customer profiles and communication tools.",
                  roles: 2,
                },
              ].map((group, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg bg-accent/30"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.desc}
                    </p>
                  </div>
                  <Badge variant="outline">{group.roles} Roles</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Tip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Always follow the <strong>Principle of Least Privilege</strong>{" "}
              (PoLP). Users should only have the permissions necessary to
              perform their jobs.
            </p>
            <p className="text-muted-foreground">
              Review roles and permissions quarterly to ensure your system
              remains secure.
            </p>
            <Button variant="link" className="px-0 h-auto">
              View security docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Roles
