// Hand-transcribed from the OpenAPI schema (AdminNotification/AdminNotificationPreference).
// Both endpoints are read-only for admins (list only, no create/update/delete) — these are
// system-generated records (e.g. order status change emails), not admin-authored content.

export type NotificationChannel = "email" | "sms" | "in_app"
export type NotificationDeliveryStatus = "pending" | "sent" | "failed"

export interface AdminNotification {
  id: string
  user: string
  user_email: string
  channel: NotificationChannel
  notification_type: string
  subject: string
  body: string
  status: NotificationDeliveryStatus
  sent_at: string | null
  created_at: string
}

export interface AdminNotificationPreference {
  id: string
  user: string
  user_email: string
  order_updates_email: boolean
  order_updates_sms: boolean
  promotions_email: boolean
  promotions_sms: boolean
  created_at: string
  updated_at: string
}
