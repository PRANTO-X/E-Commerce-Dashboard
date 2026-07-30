// Hand-transcribed from the OpenAPI schema (AuditLog) — read-only, standard paginated list.

export interface AuditLog {
  id: string
  actor: string | null
  actor_email: string
  action: string
  target_type: string
  target_id: string
  changes: Record<string, unknown>
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string
  created_at: string
}
