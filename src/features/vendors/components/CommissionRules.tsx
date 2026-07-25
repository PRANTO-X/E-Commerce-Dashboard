import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchAll, postData, deleteData } from "@/features/vendors/slices/commissionRuleSlice"
import { fetchAll as fetchAllVendors } from "@/features/vendors/slices/vendorSlice"
import { toast } from "sonner"
import { type CommissionRule } from "@/assets/Data"

const CommissionRules = () => {
  const dispatch = useAppDispatch()
  const { data: commissionRules } = useAppSelector((state) => state.commissionRules)
  const { data: vendors } = useAppSelector((state) => state.vendors)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [scope, setScope] = useState<CommissionRule["scope"]>("global")
  const [target, setTarget] = useState("")
  const [rate, setRate] = useState("10")

  useEffect(() => {
    dispatch(fetchAll())
    dispatch(fetchAllVendors())
  }, [dispatch])

  const resetForm = () => {
    setName("")
    setScope("global")
    setTarget("")
    setRate("10")
  }

  const handleCreate = () => {
    if (!name.trim() || !rate) return
    dispatch(
      postData({
        payload: {
          name: name.trim(),
          scope,
          target: scope === "global" ? undefined : target,
          rate: Number(rate),
          status: "active",
          createdAt: new Date().toISOString().slice(0, 10),
        },
      })
    )
    toast.success("Commission rule created")
    resetForm()
    setOpen(false)
  }

  return (
    <div className="section-container">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Commission Rules</h1>
          <p className="font-text text-accent-foreground text-sm mt-1">
            Configure platform, category, and vendor-specific commission rates.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="action">
              <PlusIcon className="size-5" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Commission Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fashion Category Rate" />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as CommissionRule["scope"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (Platform Default)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scope !== "global" && (
                <div className="space-y-2">
                  <Label>{scope === "vendor" ? "Vendor" : "Category slug"}</Label>
                  {scope === "vendor" ? (
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. electronics" />
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>Rate (%)</Label>
                <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionRules.map((rule) => {
                const vendorName = rule.scope === "vendor" ? vendors.find((v) => v.id === rule.target)?.name : rule.target
                return (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{rule.scope}</TableCell>
                    <TableCell className="text-muted-foreground">{vendorName || "—"}</TableCell>
                    <TableCell className="font-semibold">{rule.rate}%</TableCell>
                    <TableCell>
                      <Badge variant={rule.status === "active" ? "success" : "secondary"}>{rule.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => {
                          dispatch(deleteData(rule.id))
                          toast.success("Rule deleted")
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500 inline" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommissionRules
