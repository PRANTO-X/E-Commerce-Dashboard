import React from "react"
import type { LucideIcon } from "lucide-react"

interface ActionButtonProps {
  children: React.ReactNode
  variant?: variant
  onClick?: () => void
  className?: string
  icon?: LucideIcon
}

const variantStyles = {
  apply: "bg-primary text-white  hover:bg-primary/90 shadow-sm",
  reset: "bg-red-600 text-white  border-red-700 hover:bg-red-600/50",
  download: "bg-accent border border-primary border-border hover:bg-primary",
} as const

type variant = keyof typeof variantStyles

export function ActionButton({
  children,
  variant = "apply",
  onClick,
  className = "",
  icon: Icon,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        transition duration-300 py-2 px-4 rounded-lg cursor-pointer flex justify-center items-center gap-1
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {Icon && <Icon className="size-5" />}
      <span>{children}</span>
      
    </button>
  )
}