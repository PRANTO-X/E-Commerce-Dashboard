import { Progress } from "@/components/ui/progress"
import { useState,useEffect } from "react"
export function ProgressBar({
  label,
  value,
}: {
  label: string
  value: number
}) {

  const [progress, setProgress] = useState(10)
  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 400)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-sm text-muted-foreground">{progress}%</span>
      </div>

      <Progress value={progress} />
    </div>
  )
}
