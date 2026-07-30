import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { fetchAll, postData } from "@/features/marketing/slices/automationSlice"
import type { AutomationEvent, AutomationEventType } from "@/features/marketing/types"

const eventTypeOptions: { label: string; value: AutomationEventType }[] = [
  { label: "Abandoned Cart", value: "abandoned_cart" },
  { label: "Back in Stock", value: "back_in_stock" },
  { label: "Price Drop", value: "price_drop" },
]

const Automations = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: automations, totalItems, meta } = useAppSelector((state) => state.automations)

  const [eventType, setEventType] = useState<AutomationEventType | "">("")
  const [customerId, setCustomerId] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  const handleCreate = async () => {
    if (!eventType || !customerId.trim()) return
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            event_type: eventType,
            customer: customerId.trim(),
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          },
        })
      ).unwrap()
      toast.success("Automation event created")
      setEventType("")
      setCustomerId("")
      setScheduledAt("")
    } catch {
      toast.error("Failed to create automation event")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<AutomationEvent>[] = [
    {
      accessorKey: "event_type",
      header: "EVENT",
      cell: ({ row }) => (
        <span className="text-sm font-medium capitalize">{(row.getValue("event_type") as string).replace("_", " ")}</span>
      ),
    },
    { accessorKey: "customer", header: "CUSTOMER" },
    {
      accessorKey: "scheduled_at",
      header: "SCHEDULED",
      cell: ({ row }) => {
        const value = row.getValue("scheduled_at") as string | null
        return <span className="text-sm text-muted-foreground">{value ? new Date(value).toLocaleString() : "—"}</span>
      },
    },
    {
      accessorKey: "sent_at",
      header: "SENT",
      cell: ({ row }) => {
        const value = row.getValue("sent_at") as string | null
        return <span className="text-sm text-muted-foreground">{value ? new Date(value).toLocaleString() : "Not sent"}</span>
      },
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Marketing Automations</h1>
        <p className="font-text text-accent-foreground text-sm mt-1">
          Scheduled lifecycle emails triggered by customer/catalog events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Automation Event</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel>Event Type</FieldLabel>
            <FieldContent>
              <Select value={eventType} onValueChange={(v) => setEventType(v as AutomationEventType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Customer ID</FieldLabel>
            <FieldContent>
              <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Customer UUID" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Scheduled At (optional)</FieldLabel>
            <FieldContent>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </FieldContent>
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !eventType || !customerId.trim()}>
            <PlusIcon className="h-4 w-4" />
            Schedule Event
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={automations}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={["160px", "260px", "200px", "200px"]}
      />
    </div>
  )
}

export default Automations
