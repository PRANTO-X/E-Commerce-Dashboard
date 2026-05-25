import { useState } from "react"
import { Shield, ShieldAlert, ShieldCheck, UserCog, Plus, Search, Edit2, Trash2 } from "lucide-react"
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

const rolesData = [
  {
    id: "1",
    name: "Administrator",
    description: "Full access to all system features and settings.",
    usersCount: 2,
    type: "System",
    permissions: ["Full Access"],
    level: "High"
  },
  {
    id: "2",
    name: "Manager",
    description: "Can manage products, orders, and view reports.",
    usersCount: 5,
    type: "Custom",
    permissions: ["Products", "Orders", "Reports", "Customers"],
    level: "Medium"
  },
  {
    id: "3",
    name: "Support",
    description: "Can view orders and handle customer inquiries.",
    usersCount: 8,
    type: "Custom",
    permissions: ["Orders (View)", "Customers (View)", "Chat"],
    level: "Low"
  },
  {
    id: "4",
    name: "Editor",
    description: "Can manage catalog content and blog posts.",
    usersCount: 3,
    type: "Custom",
    permissions: ["Products", "Categories", "Blog"],
    level: "Medium"
  }
]

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRoles = rolesData.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tableHeaders = ["Role Name", "Description", "Permissions", "Users", "Actions"]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Define and manage user roles and their associated access levels.
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Create New Role
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
                  <TableHead key={header} className={header === "Role Name" ? "w-[200px]" : header === "Users" ? "text-center" : header === "Actions" ? "text-right" : ""}>
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
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={role.type === "System"}
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
            <CardDescription>Most common permission groups assigned to roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Catalog Management", desc: "View, create, edit and delete products and categories.", roles: 3 },
                { name: "Order Processing", desc: "Manage order status, payments and shipping.", roles: 2 },
                { name: "Customer Support", desc: "Access customer profiles and communication tools.", roles: 2 }
              ].map((group, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-accent/30">
                  <div className="space-y-1">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.desc}</p>
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
              Always follow the <strong>Principle of Least Privilege</strong> (PoLP). Users should only have the permissions necessary to perform their jobs.
            </p>
            <p className="text-muted-foreground">
              Review roles and permissions quarterly to ensure your system remains secure.
            </p>
            <Button variant="link" className="px-0 h-auto">View security docs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Roles
