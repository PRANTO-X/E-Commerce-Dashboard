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
  onView?: () => void
  editUrl?: string
  onEdit?: () => void
  onDelete?: () => void
  itemName: string
}

const viewIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-green-600 transition-colors hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-500/10 cursor-pointer"
const editIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-500/10 cursor-pointer"
const deleteIconClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10 cursor-pointer"

export function TableActions({
  viewUrl,
  onView,
  editUrl,
  onEdit,
  onDelete,
  itemName,
}: Props) {
  return (
    <div
      className="flex items-center gap-1 sm:ml-1 md:ml-1.5"
      onClick={(e) => e.stopPropagation()}
      data-no-row-click="true"
    >
      {(viewUrl || onView) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {viewUrl ? (
                <Link to={viewUrl} className={viewIconClass}>
                  <EyeIcon className="size-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onView}
                  className={viewIconClass}
                >
                  <EyeIcon className="size-4" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {(editUrl || onEdit) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {editUrl ? (
                <Link to={editUrl} className={editIconClass}>
                  <PencilIcon className="size-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onEdit}
                  className={editIconClass}
                >
                  <PencilIcon className="size-4" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onDelete && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DeleteModal
                  title={`Delete ${itemName}?`}
                  description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
                  onConfirm={() => onDelete?.()}
                  trigger={
                    <button type="button" className={deleteIconClass}>
                      <Trash2Icon className="size-4" />
                    </button>
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
