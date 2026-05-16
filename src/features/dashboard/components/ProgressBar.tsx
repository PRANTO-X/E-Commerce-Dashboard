import { Progress } from "@/components/ui/progress"

export function ProgressBar({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-sm text-muted-foreground">{value}%</span>
      </div>

      <Progress value={value} />
    </div>
  )
}
