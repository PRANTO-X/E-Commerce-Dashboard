import { Link } from "react-router-dom"
import { EyeIcon, Trash2Icon, PencilIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  viewUrl?: string
  onDelete?: () => void
  editUrl?: string
}

export function TableActions({ viewUrl, onDelete, editUrl }: Props) {
  return (
    <div className="flex items-center gap-3 sm:ml-1 md:ml-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={viewUrl || "#"}>
              <EyeIcon className="h-4 w-4 text-primary" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>View</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {editUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={editUrl || '#'}>
                <PencilIcon className="h-4 w-4 text-blue-500" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onDelete} className="cursor-pointer">
              <Trash2Icon className="h-4 w-4 text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}