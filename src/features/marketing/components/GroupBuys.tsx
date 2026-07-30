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
import { fetchAll, postData } from "@/features/marketing/slices/groupBuySlice"
import { fetchAll as fetchAllProducts } from "@/features/catalog/slices/productSlice"
import type { GroupBuy } from "@/features/marketing/types"

const GroupBuys = () => {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const { data: groupBuys, totalItems, meta } = useAppSelector((state) => state.groupBuys)
  const { data: products } = useAppSelector((state) => state.products)

  const [productId, setProductId] = useState("")
  const [name, setName] = useState("")
  const [targetQuantity, setTargetQuantity] = useState("")
  const [groupPrice, setGroupPrice] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAll({ page }))
    dispatch(fetchAllProducts({ page: 1, page_size: 100 }))
  }, [dispatch, page])

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id

  const handleCreate = async () => {
    if (!productId || !name.trim() || !targetQuantity || !groupPrice.trim() || !startsAt || !endsAt) return
    setSubmitting(true)
    try {
      await dispatch(
        postData({
          payload: {
            product: productId,
            name: name.trim(),
            target_quantity: Number(targetQuantity),
            group_price: groupPrice.trim(),
            starts_at: new Date(startsAt).toISOString(),
            ends_at: new Date(endsAt).toISOString(),
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
      cell: ({ row }) => <span>${Number(row.getValue("group_price")).toFixed(2)}</span>,
    },
    {
      id: "schedule",
      header: "SCHEDULE",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.original.starts_at).toLocaleDateString()} → {new Date(row.original.ends_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Group Buys</h1>
        <p className="font-text text-accent-foreground text-sm mt-1">
          Run group-buying promotions with target quantities and special pricing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Group Buy</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Product</FieldLabel>
            <FieldContent>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
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
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-name">Name</FieldLabel>
            <FieldContent>
              <Input id="gb-name" value={name} onChange={(e) => setName(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-target">Target Quantity</FieldLabel>
            <FieldContent>
              <Input id="gb-target" type="number" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-price">Group Price ($)</FieldLabel>
            <FieldContent>
              <Input id="gb-price" type="number" step="0.01" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-start">Starts At</FieldLabel>
            <FieldContent>
              <Input id="gb-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="gb-end">Ends At</FieldLabel>
            <FieldContent>
              <Input id="gb-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </FieldContent>
          </Field>
        </CardContent>
        <CardContent className="pt-0">
          <Button onClick={handleCreate} disabled={submitting || !productId}>
            <PlusIcon className="h-4 w-4" />
            Create Group Buy
          </Button>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={groupBuys}
        manualPagination
        pageIndex={page - 1}
        pageCount={meta?.totalPages ?? 1}
        totalCount={totalItems}
        onPageChange={(index) => setPage(index + 1)}
        columnWidths={["200px", "140px", "140px", "220px"]}
      />
    </div>
  )
}

export default GroupBuys
