import { useEffect, useState, useCallback } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/common/data-table"
import { PageHeading } from "@/components/common/PageHeading"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, postData } from "@/features/marketing/slices/groupBuySlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import type { GroupBuy } from "@/features/marketing/types"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency, formatDate, fromDatetimeLocal } from "@/lib/format"

const groupBuySchema = z
  .object({
    product: z.string().min(1, "Select a product"),
    name: z.string().trim().min(1, "Name is required"),
    target_quantity: z
      .number({ error: "Enter a target quantity" })
      .int("Must be a whole number")
      .min(1, "Target quantity must be at least 1"),
    group_price: z.number({ error: "Enter a group price" }).gt(0, "Price must be greater than 0"),
    starts_at: z.string().min(1, "Start date is required"),
    ends_at: z.string().min(1, "End date is required"),
  })
  .refine((v) => new Date(v.ends_at).getTime() > new Date(v.starts_at).getTime(), {
    message: "End must be after the start",
    path: ["ends_at"],
  })

type FieldErrors = Partial<Record<string, string[]>>
const asErrors = (messages?: string[]) => messages?.map((message) => ({ message }))
const toNumber = (value: string) => (value.trim() === "" ? Number.NaN : Number(value))

const GroupBuys = () => {
  useDocumentTitle("Group Buys")

  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: groupBuys, totalItems, meta, isLoading, error } = useAppSelector((state) => state.groupBuys)
  const { data: products } = useAppSelector((state) => state.products)

  const [productId, setProductId] = useState("")
  const [name, setName] = useState("")
  const [targetQuantity, setTargetQuantity] = useState("")
  const [groupPrice, setGroupPrice] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<FieldErrors>({})

  const loadGroupBuys = useCallback(() => {
    dispatch(fetchAll({ page }))
  }, [dispatch, page])

  useEffect(() => {
    loadGroupBuys()
    dispatch(fetchAllProducts({ page: 1, page_size: 100 }))
  }, [loadGroupBuys, dispatch])

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id

  const handleCreate = async () => {
    const parsed = groupBuySchema.safeParse({
      product: productId,
      name,
      target_quantity: toNumber(targetQuantity),
      group_price: toNumber(groupPrice),
      starts_at: startsAt,
      ends_at: endsAt,
    })
    if (!parsed.success) {
      setFormErrors(z.flattenError(parsed.error).fieldErrors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            product: productId,
            name: name.trim(),
            target_quantity: parsed.data.target_quantity,
            group_price: String(parsed.data.group_price),
            starts_at: fromDatetimeLocal(startsAt) ?? "",
            ends_at: fromDatetimeLocal(endsAt) ?? "",
          },
        })
      ).unwrap()
      toast.success(`${name} created`)
      setProductId("")
      setName("")
      setTargetQuantity("")
      setGroupPrice("")
      setStartsAt("")
      setEndsAt("")
    } catch {
      toast.error("Failed to create group buy")
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnDef<GroupBuy>[] = [
    { accessorKey: "name", header: "NAME" },
    {
      accessorKey: "product",
      header: "PRODUCT",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{productName(row.getValue("product"))}</span>,
    },
    {
      id: "progress",
      header: "PROGRESS",
      cell: ({ row }) => (
        <span>{row.original.current_quantity} / {row.original.target_quantity}</span>
      ),
    },
    {
      accessorKey: "group_price",
      header: "GROUP PRICE",
      cell: ({ row }) => <span>{formatCurrency(row.getValue("group_price") as string)}</span>,
    },
    {
      id: "schedule",
      header: "SCHEDULE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.starts_at)} → {formatDate(row.original.ends_at)}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <PageHeading
        title="Group Buys"
        description="Run group-buying promotions with target quantities and special pricing"
      />

      <Card>
        <CardHeader>
          <CardTitle>Create Group Buy</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="gb-product">Product</FieldLabel>
            <FieldContent>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger id="gb-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={asErrors(formErrors.product)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-name">Name</FieldLabel>
            <FieldContent>
              <Input id="gb-name" value={name} onChange={(e) => setName(e.target.value)} />
              <FieldError errors={asErrors(formErrors.name)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-target">Target Quantity</FieldLabel>
            <FieldContent>
              <Input id="gb-target" type="number" min="1" step="1" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
              <FieldError errors={asErrors(formErrors.target_quantity)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-price">Group Price ($)</FieldLabel>
            <FieldContent>
              <Input id="gb-price" type="number" step="0.01" min="0" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} />
              <FieldError errors={asErrors(formErrors.group_price)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-start">Starts At</FieldLabel>
            <FieldContent>
              <Input id="gb-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              <FieldError errors={asErrors(formErrors.starts_at)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-end">Ends At</FieldLabel>
            <FieldContent>
              <Input id="gb-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              <FieldError errors={asErrors(formErrors.ends_at)} />
            </FieldContent>
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting}>
            <PlusIcon className="h-4 w-4" />
            Create Group Buy
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={groupBuys}
        isLoading={isLoading}
        error={error}
        onRetry={loadGroupBuys}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        minWidth="750px"
        columnWidths={["200px", "140px", "140px", "220px"]}
      />
    </div>
  )
}

export default GroupBuys
