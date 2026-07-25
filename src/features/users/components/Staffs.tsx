import { Button } from "@/components/ui/button"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { TableActions } from "@/components/common/TableActions"
import { exportToCSV } from "@/utility/ExportToCsv"
import { type Staff } from "@/assets/Data"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, deleteData } from "@/features/users/slices/staffSlice"
import { toast } from "sonner"
const Staffs = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: staffs } = useAppSelector((state) => state.staffs)

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

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
          dispatch(deleteData(staff.id))
          toast.success(`${staff.name} deleted`)
        }
        return (
          <TableActions itemName={staff.name} onDelete={handleDelete} editUrl={`/staff_form/${staff.id}`}/>
        )
      },
    },
  ]
  const csvData = staffs.map((staff)=>({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    phone: staff.phone,
    status: staff.status,
    joined_date: staff.joinedAt,
  }));

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
            <Button variant="primary" size="action" onClick={() => exportToCSV(csvData,'Staffs')}>
            <DownloadIcon className="size-5" /> Export CSV
            </Button>
            <Button variant="apply" size="action" onClick={() => navigate("/staff_form/new")}>
            <PlusIcon className="size-5" /> Add Staff
            </Button>
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
