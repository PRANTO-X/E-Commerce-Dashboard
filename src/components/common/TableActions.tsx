import { Link } from "react-router-dom"
import { EyeIcon, Trash2Icon, PencilIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteModal } from "./DeleteModal"
type Props = {
  viewUrl?: string
  onDelete?: () => void
  editUrl?: string
  itemName: string
}

const viewIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-green-600 transition-colors hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-500/10"
const editIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-500/10"
const deleteIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10"

export function TableActions({ viewUrl, onDelete, editUrl, itemName }: Props) {
  return (
    <div className="flex items-center gap-1 sm:ml-1 md:ml-1.5">
      {viewUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={viewUrl || "#"} className={viewIconClass}>
                <EyeIcon className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {editUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={editUrl || "#"} className={editIconClass}>
                <PencilIcon className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DeleteModal
                title={`Delete ${itemName}?`}
                description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
                onConfirm={() => onDelete?.()}
                trigger={
                  <button className={`cursor-pointer ${deleteIconClass}`}>
                    <Trash2Icon className="size-4" />
                  </button>
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
