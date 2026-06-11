import { Loader2 } from "lucide-react"

const Loader = () => {
  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-200px)] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p>Loading...</p>
    </div>
  )
}

export default Loader
