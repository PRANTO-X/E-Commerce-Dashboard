import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { exportToCSV } from "@/utility/ExportToCsv"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll } from "@/features/users/slices/staffSlice"
import type { AdminUser } from "@/features/users/types"

const Staffs = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data: allStaffs } = useAppSelector((state) => state.staffs)
  const [search, setSearch] = useState("")

  useEffect(() => {
    dispatch(fetchAll())
  }, [dispatch])

  const staffs = allStaffs.filter((staff) => {
    if (!search) return true
    const q = search.toLowerCase()
    const name = [staff.first_name, staff.last_name].filter(Boolean).join(" ").toLowerCase()
    return name.includes(q) || staff.email.toLowerCase().includes(q)
  })

  const columns: ColumnDef<AdminUser>[] = [
    {
      id: "staff",
      header: "STAFF",
      cell: ({ row }) => {
        const staff = row.original
        const name = [staff.first_name, staff.last_name].filter(Boolean).join(" ")
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {staff.profile_picture ? (
                <img src={staff.profile_picture} alt={name} className="h-full w-full object-cover" />
              ) : (
                (name || staff.email).charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{name || "—"}</span>
              <span className="text-xs text-muted-foreground">{staff.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "PHONE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("phone") || "N/A"}</span>
      ),
    },
    {
      id: "permissions",
      header: "PERMISSIONS",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.permissions.includes("*") ? "All" : row.original.permissions.length}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "STATUS",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.getValue("is_active")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {row.getValue("is_active") ? "active" : "inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/staff_form/${row.original.id}`)}>
          Edit
        </Button>
      ),
    },
  ]

  const csvData = staffs.map((staff) => ({
    id: staff.id,
    name: [staff.first_name, staff.last_name].filter(Boolean).join(" "),
    email: staff.email,
    phone: staff.phone,
    active: staff.is_active,
    permissions: staff.permissions.join("; "),
  }))

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Staff Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your team members and their permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="action" onClick={() => exportToCSV(csvData, "Staffs")}>
            <DownloadIcon className="size-5" /> Export CSV
          </Button>
          <Button variant="apply" size="action" onClick={() => navigate("/staff_form/new")}>
            <PlusIcon className="size-5" /> Add Staff
          </Button>
        </div>
      </div>

      <FilterToolbar
        searchPlaceholder="Search staff..."
        searchValue={search}
        onSearchChange={setSearch}
        onReset={() => setSearch("")}
      />

      <div>
        <DataTable
          columns={columns}
          data={staffs}
          columnWidths={["280px", "160px", "140px", "130px", "100px"]}
        />
      </div>
    </div>
  )
}

export default Staffs
