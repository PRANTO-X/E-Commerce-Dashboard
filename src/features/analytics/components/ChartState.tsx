import { AlertCircle, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api/client"
import { cn } from "@/lib/utils"

/** Placeholder shown inside a chart card while its data request is in flight. */
export function ChartLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-primary" />
      Loading chart data...
    </div>
  )
}

/** Shown when a chart's request failed — distinct from "no data", with a retry. */
export function ChartError({
  error,
  onRetry,
  className,
}: {
  error: unknown
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-10 px-4 text-center", className)}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Couldn't load chart data</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          {getApiErrorMessage(error, "The request failed. Please try again.")}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcw className="size-3.5" />
        Retry
      </Button>
    </div>
  )
}
