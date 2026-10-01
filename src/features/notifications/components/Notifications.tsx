import { useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { PageHeading } from "@/components/common/PageHeading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchNotifications, fetchNotificationPreferences } from "@/features/notifications/slices/notificationSlice"
import type { AdminNotification, NotificationDeliveryStatus } from "@/features/notifications/types"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatDateTime, humanize } from "@/lib/format"
import { getApiErrorMessage } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, RotateCw } from "lucide-react"

const Notifications = () => {
  useDocumentTitle("Notifications")

  const dispatch = useAppDispatch()
  const {
    notifications,
    preferences,
    isLoading,
    error,
    preferencesLoading,
    preferencesError,
  } = useAppSelector((state) => state.notifications)

  const loadNotifications = useCallback(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const loadPreferences = useCallback(() => {
    dispatch(fetchNotificationPreferences())
  }, [dispatch])

  useEffect(() => {
    loadNotifications()
    loadPreferences()
  }, [loadNotifications, loadPreferences])

  const columns: ColumnDef<AdminNotification>[] = [
    { accessorKey: "user_email", header: "USER" },
    {
      accessorKey: "channel",
      header: "CHANNEL",
      cell: ({ row }) => <span className="capitalize">{humanize(row.getValue("channel") as string)}</span>,
    },
    { accessorKey: "subject", header: "SUBJECT" },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as NotificationDeliveryStatus} />
      ),
    },
    {
      accessorKey: "created_at",
      header: "SENT",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDateTime(row.getValue("created_at") as string)}
        </span>
      ),
    },
  ]

  return (
    <div className="section-container">
      <PageHeading
        title="Notifications"
        description="System-generated customer notifications and delivery preferences"
      />

      <DataTable
        columns={columns}
        data={notifications}
        isLoading={isLoading}
        error={error}
        onRetry={loadNotifications}
        showPagination={false}
        minWidth="950px"
        columnWidths={["220px", "120px", "300px", "110px", "200px"]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {preferencesError ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {getApiErrorMessage(preferencesError, "Couldn't load notification preferences.")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadPreferences}
                disabled={preferencesLoading}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : preferencesLoading && preferences.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preferences...
            </p>
          ) : preferences.length === 0 ? (
            <p className="text-sm text-muted-foreground">No preference records yet.</p>
          ) : null}
          {!preferencesError && preferences.map((pref) => (
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
