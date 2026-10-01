import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Truck } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchCouriers,
  fetchShipments,
  bookCourierShipment,
  addTracking,
  updateTracking,
} from "@/features/shipping/slices/shippingSlice"
import type { TrackingStatus } from "@/features/shipping/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { humanize } from "@/lib/format"

const trackingStatusOptions: { label: string; value: TrackingStatus }[] = [
  { label: "Processing", value: "processing" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Exception", value: "exception" },
]

/** Courier booking + tracking controls for a single order. Owns its own shipping fetches. */
export function OrderShippingPanel({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch()
  const { couriers, shipments } = useAppSelector((state) => state.shipping)

  const [submitting, setSubmitting] = useState(false)
  const [selectedCourier, setSelectedCourier] = useState("")
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | "">("")

  useEffect(() => {
    dispatch(fetchCouriers())
    dispatch(fetchShipments())
  }, [dispatch])

  const safeShipments = Array.isArray(shipments) ? shipments : []
  const safeCouriers = Array.isArray(couriers) ? couriers : []
  const shipment = safeShipments.find((s) => s.order === orderId)

  const run = async (action: () => Promise<unknown>, success: string, failure: string, onDone?: () => void) => {
    setSubmitting(true)
    try {
      await action()
      toast.success(success)
      onDone?.()
    } catch {
      toast.error(failure)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBookCourier = () => {
    if (!selectedCourier) return
    return run(
      () => dispatch(bookCourierShipment({ orderId, payload: { integration_id: selectedCourier } })).unwrap(),
      "Courier booked successfully",
      "Failed to book courier"
    )
  }

  const handleAddTracking = () => {
    if (!carrier.trim() || !trackingNumber.trim()) return
    return run(
      () =>
        dispatch(
          addTracking({ orderId, payload: { carrier: carrier.trim(), tracking_number: trackingNumber.trim() } })
        ).unwrap(),
      "Tracking information added",
      "Failed to add tracking",
      () => {
        setCarrier("")
        setTrackingNumber("")
      }
    )
  }

  const handleUpdateTracking = () => {
    if (!trackingStatus) return
    return run(
      () => dispatch(updateTracking({ orderId, payload: { status: trackingStatus } })).unwrap(),
      "Tracking status updated",
      "Failed to update tracking",
      () => setTrackingStatus("")
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          Shipping & Fulfillment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shipment ? (
          <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold">{shipment.provider || "Courier"}</p>
              <p className="text-xs text-muted-foreground">
                Tracking #: <span className="font-mono">{shipment.tracking_number || "—"}</span>
              </p>
            </div>
            <Badge variant="outline" className="capitalize">{humanize(shipment.status)}</Badge>
          </div>
        ) : safeCouriers.length > 0 ? (
          <div className="flex gap-2">
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger className="flex-1" aria-label="Courier">
                <SelectValue placeholder="Select courier..." />
              </SelectTrigger>
              <SelectContent>
                {safeCouriers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBookCourier} disabled={!selectedCourier || submitting}>
              Book Courier
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="carrier">Carrier</FieldLabel>
            <FieldContent>
              <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="e.g. DHL, FedEx" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="tracking_number">Tracking Number</FieldLabel>
            <FieldContent>
              <Input
                id="tracking_number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK12345"
              />
            </FieldContent>
          </Field>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddTracking}
            disabled={submitting || !carrier.trim() || !trackingNumber.trim()}
          >
            Add Tracking
          </Button>

          <div className="flex-1 flex gap-2">
            <Select value={trackingStatus} onValueChange={(v) => setTrackingStatus(v as TrackingStatus)}>
              <SelectTrigger className="h-8 text-xs flex-1" aria-label="Tracking status">
                <SelectValue placeholder="Update status..." />
              </SelectTrigger>
              <SelectContent>
                {trackingStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={handleUpdateTracking} disabled={!trackingStatus || submitting}>
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
