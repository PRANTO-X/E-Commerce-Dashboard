import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { DataTable } from "@/components/common/data-table"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchWarehouses, createWarehouse } from "@/features/catalog/slices/inventorySlice"
import type { Warehouse } from "@/features/catalog/types"

const Warehouses = () => {
  const dispatch = useAppDispatch()
  const { warehouses } = useAppSelector((state) => state.inventory)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [isBranch, setIsBranch] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchWarehouses())
  }, [dispatch])

  const handleCreate = async () => {
    if (!name.trim() || !code.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        createWarehouse({
          name: name.trim(),
          code: code.trim(),
          address: address.trim(),
          city: city.trim(),
          is_branch: isBranch,
          is_active: isActive,
        })
      ).unwrap()
      toast.success(`${name} warehouse created`)
      setName("")
      setCode("")
      setAddress("")
      setCity("")
      setIsBranch(false)
      setIsActive(true)
    } catch {
      toast.error("Failed to create warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<Warehouse>[] = [
    { accessorKey: "name", header: "NAME" },
    { accessorKey: "code", header: "CODE" },
    { accessorKey: "city", header: "CITY" },
    { accessorKey: "address", header: "ADDRESS" },
    {
      accessorKey: "is_branch",
      header: "TYPE",
      cell: ({ row }) => (row.getValue("is_branch") ? "Branch" : "Main"),
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
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Warehouses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage warehouse locations used for stock allocation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Warehouse</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="wh-name">Name</FieldLabel>
            <FieldContent>
              <Input id="wh-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Warehouse" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="wh-code">Code</FieldLabel>
            <FieldContent>
              <Input id="wh-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-01" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="wh-city">City</FieldLabel>
            <FieldContent>
              <Input id="wh-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="wh-address">Address</FieldLabel>
            <FieldContent>
              <Input id="wh-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="wh-branch">Branch Location</FieldLabel>
            </FieldContent>
            <Switch id="wh-branch" checked={isBranch} onCheckedChange={setIsBranch} />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="wh-active">Active</FieldLabel>
            </FieldContent>
            <Switch id="wh-active" checked={isActive} onCheckedChange={setIsActive} />
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !name.trim() || !code.trim()}>
            <PlusIcon className="h-4 w-4" />
            Create Warehouse
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={warehouses}
        showPagination={false}
        columnWidths={["200px", "120px", "140px", "220px", "100px", "120px"]}
      />

    </div>
  )
}

export default Warehouses
