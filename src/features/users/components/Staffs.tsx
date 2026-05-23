import { ActionButton } from "@/components/common/ActionButton"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import React from "react"
import { useNavigate } from "react-router-dom"
import { TableActions } from "@/components/common/TableActions"

const Staffs = () => {
  const navigate = useNavigate()
  
  const statusStyles = {
    Active: "bg-green-500/10 text-green-400 border border-green-500/20",
    Inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
    "On Leave": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  } as const

  type StaffStatus = keyof typeof statusStyles

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "On Leave", value: "on-leave" },
  ]

  const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Sales", value: "sales" },
    { label: "Support", value: "support" },
    { label: "Editor", value: "editor" },
  ]

  interface Staff {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    role: string
    status: StaffStatus
    joinedAt: string
  }

  const staffs: Staff[] = [
    {
      id: "STAFF-001",
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+8801712345671",
      avatar: "",
      role: "Admin",
      status: "Active",
      joinedAt: "2024-01-15",
    },
    {
      id: "STAFF-002",
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "+8801812345672",
      avatar: "",
      role: "Manager",
      status: "Active",
      joinedAt: "2024-02-20",
    },
    {
      id: "STAFF-003",
      name: "Charlie Davis",
      email: "charlie@example.com",
      phone: "+8801912345673",
      avatar: "",
      role: "Sales",
      status: "Inactive",
      joinedAt: "2024-03-05",
    },
    {
      id: "STAFF-004",
      name: "Diana Prince",
      email: "diana@example.com",
      phone: "+8801612345674",
      avatar: "",
      role: "Support",
      status: "Active",
      joinedAt: "2024-04-10",
    },
    {
      id: "STAFF-005",
      name: "Edward Norton",
      email: "edward@example.com",
      phone: "+8801512345675",
      avatar: "",
      role: "Editor",
      status: "On Leave",
      joinedAt: "2024-05-12",
    },
    {
      id: "STAFF-006",
      name: "Fiona Gallagher",
      email: "fiona@example.com",
      phone: "+8801711122231",
      avatar: "",
      role: "Sales",
      status: "Active",
      joinedAt: "2024-06-18",
    },
    {
      id: "STAFF-007",
      name: "George Miller",
      email: "george@example.com",
      phone: "+8801811122232",
      avatar: "",
      role: "Manager",
      status: "Active",
      joinedAt: "2024-07-22",
    },
    {
      id: "STAFF-008",
      name: "Hannah Abbott",
      email: "hannah@example.com",
      phone: "+8801911122233",
      avatar: "",
      role: "Support",
      status: "Inactive",
      joinedAt: "2024-08-05",
    },
    {
      id: "STAFF-009",
      name: "Ian Wright",
      email: "ian@example.com",
      phone: "+8801611122234",
      avatar: "",
      role: "Editor",
      status: "Active",
      joinedAt: "2024-09-15",
    },
    {
      id: "STAFF-010",
      name: "Julia Roberts",
      email: "julia@example.com",
      phone: "+8801511122235",
      avatar: "",
      role: "Sales",
      status: "Active",
      joinedAt: "2024-10-01",
    },
  ]

  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: "id",
      header: "STAFF ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },

    {
      accessorKey: "name",
      header: "STAFF NAME",
      cell: ({ row }) => {
        const staff = row.original

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {staff.avatar ? (
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                staff.name.charAt(0)
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {staff.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {staff.email}
              </span>
            </div>
          </div>
        )
      },
    },

    {
      accessorKey: "role",
      header: "ROLE",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("role")}
        </span>
      ),
    },

    {
      accessorKey: "phone",
      header: "PHONE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("phone") || "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as StaffStatus

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },

    {
      accessorKey: "joinedAt",
      header: "JOINED DATE",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("joinedAt")}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const staff = row.original
         const handleDelete = () => {
          const confirmDelete = window.confirm(
            `Are you sure you want to delete ${staff.name}?`,
          )

          if (confirmDelete) {
            console.log("Deleting:", staff.name)
          }
        }
        return (
          <TableActions onDelete={handleDelete} editUrl={`/staff_form/${staff.id}`}/>
        )
      },
    },
  ]

  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Staff Members
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage your team members, roles, and permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <ActionButton variant="download" icon={DownloadIcon}>
            Export CSV
            </ActionButton>
            <ActionButton variant="apply" icon={PlusIcon} onClick={() => navigate("/staff_form/new")}>
            Add Staff
            </ActionButton>
        </div>
      </div>

      {/* Filter */}
      <FilterToolbar
        searchPlaceholder="Search staff..."
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={roleOptions}
                placeholder="Role"
              />
            ),
          },
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={statusOptions}
                placeholder="Status"
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={staffs}
          columnWidths={[
            "120px",
            "260px",
            "140px",
            "160px",
            "130px",
            "140px",
            "100px",
          ]}
        />
      </div>
    </div>
  )
}

export default Staffs
