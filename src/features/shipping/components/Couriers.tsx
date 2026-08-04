import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/common/data-table"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchCouriers, createCourier } from "@/features/shipping/slices/shippingSlice"
import type { CourierIntegration, CourierProvider } from "@/features/shipping/types"

const providerOptions: { label: string; value: CourierProvider }[] = [
  { label: "Pathao", value: "pathao" },
  { label: "Steadfast", value: "steadfast" },
  { label: "RedX", value: "redx" },
  { label: "eCourier", value: "ecourier" },
]

const Couriers = () => {
  const dispatch = useAppDispatch()
  const { couriers } = useAppSelector((state) => state.shipping)

  const [provider, setProvider] = useState<CourierProvider | "">("")
  const [displayName, setDisplayName] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchCouriers())
  }, [dispatch])

  const handleCreate = async () => {
    if (!provider || !displayName.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        createCourier({
          provider,
          display_name: displayName.trim(),
          is_active: isActive,
          base_url: baseUrl.trim(),
        })
      ).unwrap()
      toast.success(`${displayName} courier added`)
      setProvider("")
      setDisplayName("")
      setBaseUrl("")
      setIsActive(true)
    } catch {
      toast.error("Failed to add courier")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<CourierIntegration>[] = [
    { accessorKey: "display_name", header: "NAME" },
    {
      accessorKey: "provider",
      header: "PROVIDER",
      cell: ({ row }) => <span className="capitalize">{row.getValue("provider")}</span>,
    },
    { accessorKey: "base_url", header: "BASE URL" },
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
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Couriers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage courier integrations used to ship orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Courier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="provider">Provider</FieldLabel>
            <FieldContent>
              <Select value={provider} onValueChange={(v) => setProvider(v as CourierProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="display_name">Display Name</FieldLabel>
            <FieldContent>
              <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Pathao Express" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="base_url">Base URL</FieldLabel>
            <FieldContent>
              <Input id="base_url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.provider.com" />
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
            </FieldContent>
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !provider || !displayName.trim()}>
            <PlusIcon className="h-4 w-4" />
            Add Courier
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={couriers}
        showPagination={false}
        columnWidths={["200px", "140px", "260px", "120px"]}
      />

    </div>
  )
}

export default Couriers
