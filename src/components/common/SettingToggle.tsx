import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface SettingToggleProps {
  label: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  labelClassName?: string
}

export const SettingToggle = ({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  labelClassName,
}: SettingToggleProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="space-y-0.5">
        <Label className={cn("text-base font-medium", labelClassName)}>
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
