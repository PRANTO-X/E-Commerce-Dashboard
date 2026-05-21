import { ActionButton } from "@/components/common/ActionButton"
import { ExampleComboboxCustomItems } from "@/components/common/ComboBox"
import { DataTable } from "@/components/common/data-table"
import FilterToolbar from "@/components/common/FilterToolBar"
import { DownloadIcon, EyeIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import React from "react"
import { Link } from "react-router-dom"

const Customers = () => {
  const statusStyles = {
    Active: "bg-green-500/10 text-green-400 border border-green-500/20",
    Inactive: "bg-red-500/10 text-red-400 border border-red-500/20",
    
  } as const

  type CustomerStatus = keyof typeof statusStyles

  const status = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    totalOrders: number
    totalSpent: number
    status: CustomerStatus
    createdAt: string
    lastOrderAt?: string
  }

  const customers: Customer[] = [
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+8801712345678",
      avatar: "",
      totalOrders: 5,
      totalSpent: 320.5,
      status: "Active",
      createdAt: "2025-01-10",
      lastOrderAt: "2026-05-12",
    },
    {
      id: "CUST-002",
      name: "Sarah Khan",
      email: "sarah@example.com",
      phone: "+8801812345678",
      avatar: "",
      totalOrders: 2,
      totalSpent: 120.0,
      status: "Active",
      createdAt: "2025-02-14",
      lastOrderAt: "2026-04-20",
    },
    {
      id: "CUST-003",
      name: "Michael Smith",
      email: "michael@example.com",
      phone: "+8801912345678",
      avatar: "",
      totalOrders: 0,
      totalSpent: 0,
      status: "Inactive",
      createdAt: "2025-03-01",
    },
    {
      id: "CUST-004",
      name: "Ayesha Rahman",
      email: "ayesha@example.com",
      phone: "+8801612345678",
      avatar: "",
      totalOrders: 12,
      totalSpent: 980.75,
      status: "Active",
      createdAt: "2024-12-25",
      lastOrderAt: "2026-05-15",
    },
    {
      id: "CUST-005",
      name: "David Johnson",
      email: "david@example.com",
      phone: "+8801512345678",
      avatar: "",
      totalOrders: 3,
      totalSpent: 210.0,
      status: "Inactive",
      createdAt: "2025-06-10",
      lastOrderAt: "2025-12-01",
    },
    {
      id: "CUST-006",
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
      phone: "+8801711122233",
      avatar: "",
      totalOrders: 8,
      totalSpent: 540.2,
      status: "Active",
      createdAt: "2024-11-18",
      lastOrderAt: "2026-05-10",
    },
    {
      id: "CUST-007",
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "+8801811122233",
      avatar: "",
      totalOrders: 1,
      totalSpent: 60.0,
      status: "Inactive",
      createdAt: "2025-07-22",
    },
    {
      id: "CUST-008",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+8801911122233",
      avatar: "",
      totalOrders: 15,
      totalSpent: 1500.99,
      status: "Active",
      createdAt: "2024-10-05",
      lastOrderAt: "2026-05-16",
    },
    {
      id: "CUST-009",
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
      phone: "+8801611122233",
      avatar: "",
      totalOrders: 6,
      totalSpent: 420.0,
      status: "Active",
      createdAt: "2025-03-15",
      lastOrderAt: "2026-05-01",
    },
    {
      id: "CUST-010",
      name: "Sophia Wilson",
      email: "sophia@example.com",
      phone: "+8801511122233",
      avatar: "",
      totalOrders: 0,
      totalSpent: 0,
      status: "Inactive",
      createdAt: "2025-08-01",
    },
    {
      id: "CUST-011",
      name: "Hasan Ali",
      email: "hasan@example.com",
      phone: "+8801712233445",
      avatar: "",
      totalOrders: 4,
      totalSpent: 250.3,
      status: "Active",
      createdAt: "2025-01-28",
      lastOrderAt: "2026-04-25",
    },
    {
      id: "CUST-012",
      name: "Olivia Martin",
      email: "olivia@example.com",
      phone: "+8801812233445",
      avatar: "",
      totalOrders: 9,
      totalSpent: 890.0,
      status: "Active",
      createdAt: "2024-09-12",
      lastOrderAt: "2026-05-14",
    },
    {
      id: "CUST-013",
      name: "Imran Hossain",
      email: "imran@example.com",
      phone: "+8801912233445",
      avatar: "",
      totalOrders: 2,
      totalSpent: 150.0,
      status: "Inactive",
      createdAt: "2025-05-05",
    },
    {
      id: "CUST-014",
      name: "Mia Clark",
      email: "mia@example.com",
      phone: "+8801612233445",
      avatar: "",
      totalOrders: 7,
      totalSpent: 600.45,
      status: "Active",
      createdAt: "2025-02-20",
      lastOrderAt: "2026-05-11",
    },
    {
      id: "CUST-015",
      name: "Jahid Hasan",
      email: "jahid@example.com",
      phone: "+8801512233445",
      avatar: "",
      totalOrders: 11,
      totalSpent: 1120.0,
      status: "Active",
      createdAt: "2024-08-30",
      lastOrderAt: "2026-05-17",
    },
    {
      id: "CUST-016",
      name: "Emma Johnson",
      email: "emma@example.com",
      phone: "+8801713344556",
      avatar: "",
      totalOrders: 0,
      totalSpent: 0,
      status: "Inactive",
      createdAt: "2025-09-10",
    },
    {
      id: "CUST-017",
      name: "Arif Khan",
      email: "arif@example.com",
      phone: "+8801813344556",
      avatar: "",
      totalOrders: 3,
      totalSpent: 180.0,
      status: "Active",
      createdAt: "2025-04-18",
      lastOrderAt: "2026-03-22",
    },
    {
      id: "CUST-018",
      name: "Isabella Lee",
      email: "isabella@example.com",
      phone: "+8801913344556",
      avatar: "",
      totalOrders: 14,
      totalSpent: 1650.7,
      status: "Active",
      createdAt: "2024-07-19",
      lastOrderAt: "2026-05-13",
    },
    {
      id: "CUST-019",
      name: "Sabbir Rahman",
      email: "sabbir@example.com",
      phone: "+8801613344556",
      avatar: "",
      totalOrders: 1,
      totalSpent: 70.0,
      status: "Inactive",
      createdAt: "2025-06-25",
    },
    {
      id: "CUST-020",
      name: "Charlotte White",
      email: "charlotte@example.com",
      phone: "+8801513344556",
      avatar: "",
      totalOrders: 10,
      totalSpent: 990.99,
      status: "Active",
      createdAt: "2024-12-01",
      lastOrderAt: "2026-05-16",
    },
  ]

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "CUSTOMER ID",
      cell: ({ row }) => (
        <span className="font-medium text-primary text-sm">
          {row.getValue("id")}
        </span>
      ),
    },

    {
      accessorKey: "name",
      header: "CUSTOMER",
      cell: ({ row }) => {
        const customer = row.original

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                customer.name.charAt(0)
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {customer.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {customer.email}
              </span>
            </div>
          </div>
        )
      },
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
      accessorKey: "totalOrders",
      header: "ORDERS",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {row.getValue("totalOrders")}
        </span>
      ),
    },

    {
      accessorKey: "totalSpent",
      header: "TOTAL SPENT",
      cell: ({ row }) => {
        const amount = row.getValue("totalSpent") as number

        return (
          <span className="text-sm font-semibold text-foreground">
            ${amount.toFixed(2)}
          </span>
        )
      },
    },

    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as CustomerStatus

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
      accessorKey: "createdAt",
      header: "JOINED",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("createdAt")}
        </span>
      ),
    },

    {
      accessorKey: "lastOrderAt",
      header: "LAST ORDER",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {row.getValue("lastOrderAt") || "No Orders"}
        </span>
      ),
    },

    {
      id: "actions",
      header: "ACTION",
      cell: ({ row }) => {
        const customer = row.original

        return (
          <Link to={`/customer_detail/${customer.id}`} className="ml-1 flex items-center gap-1 text-xs text-primary">
            <EyeIcon className="size-3.5" /> View
          </Link>
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
            Customers
          </h1>

          <p className="font-text text-accent-foreground text-sm mt-1">
            Manage and analyze your enterprise client database.
          </p>
        </div>

        <ActionButton variant="download" icon={DownloadIcon}>
          Export CSV
        </ActionButton>
      </div>

      {/* Filter */}
      <FilterToolbar
        searchPlaceholder="Search customer..."
        filters={[
          {
            component: (
              <ExampleComboboxCustomItems
                frameworks={status}
                placeholder="Status"
              />
            ),
          },
        ]}
      />

      <div>
        <DataTable
          columns={columns}
          data={customers}
          columnWidths={[
            "120px",
            "260px",
            "160px",
            "100px",
            "140px",
            "130px",
            "140px",
            "140px",
            "100px",
          ]}
        />
      </div>
    </div>
  )
}

export default Customers
