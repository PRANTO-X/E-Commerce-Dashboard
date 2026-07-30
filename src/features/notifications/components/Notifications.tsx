import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchNotifications, fetchNotificationPreferences } from "@/features/notifications/slices/notificationSlice"
import type { AdminNotification, NotificationDeliveryStatus } from "@/features/notifications/types"

const statusStyles: Record<NotificationDeliveryStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  sent: "bg-green-500/10 text-green-400 border border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
}

const Notifications = () => {
  const dispatch = useAppDispatch()
  const { notifications, preferences, isLoading } = useAppSelector((state) => state.notifications)

  useEffect(() => {
    dispatch(fetchNotifications())
    dispatch(fetchNotificationPreferences())
  }, [dispatch])

  const columns: ColumnDef<AdminNotification>[] = [
    { accessorKey: "user_email", header: "USER" },
    {
      accessorKey: "channel",
      header: "CHANNEL",
      cell: ({ row }) => <span className="capitalize">{(row.getValue("channel") as string).replace("_", " ")}</span>,
    },
    { accessorKey: "subject", header: "SUBJECT" },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as NotificationDeliveryStatus
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "SENT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(row.getValue("created_at")).toLocaleString()}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="font-text text-accent-foreground text-sm mt-1">
          System-generated customer notifications and delivery preferences
        </p>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        showPagination={false}
        columnWidths={["220px", "120px", "300px", "110px", "200px"]}
      />
      {!isLoading && notifications.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No notifications yet.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {preferences.length === 0 && (
            <p className="text-sm text-muted-foreground">No preference records yet.</p>
          )}
          {preferences.map((pref) => (
            <div key={pref.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
              <span className="font-medium">{pref.user_email}</span>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Order updates: email {pref.order_updates_email ? "on" : "off"}, sms {pref.order_updates_sms ? "on" : "off"}</span>
                <span>·</span>
                <span>Promotions: email {pref.promotions_email ? "on" : "off"}, sms {pref.promotions_sms ? "on" : "off"}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
