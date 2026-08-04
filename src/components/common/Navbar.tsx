import { SidebarTrigger } from "../ui/sidebar"
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  Search,
  Plus,
  Package,
  Ticket,
  Megaphone,
  FileText,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { logout } from "@/features/authentication/slices/authSlice"

const quickCreateItems = [
  { label: "New Product", icon: Package, url: "/product_form/new" },
  { label: "New Coupon", icon: Ticket, url: "/coupon_form/new" },
  { label: "New Campaign", icon: Megaphone, url: "/campaign_form/new" },
  { label: "New Page", icon: FileText, url: "/page_form/new" },
]

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate("/login", { replace: true })
  }

  const displayName =
    user
      ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
      : ""

  // load saved theme
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light"

    setTheme(savedTheme)

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"

    setTheme(newTheme)

    localStorage.setItem("theme", newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <header className="bg-white dark:bg-gray-950">
      <nav className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white/90" />

          {/* Search */}
          <div className="relative hidden w-xs lg:flex">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate("/products")
                }
              }}
              placeholder="Search product, order, customer..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-100 pl-9 pr-13 text-sm text-gray-900 transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400 dark:border-gray-800 dark:bg-white/5 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:bg-gray-700"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 inline-flex h-7 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400 dark:border-gray-800 dark:bg-white/5">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick create */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-primary-600">
                <Plus className="size-4" />
                <span className="hidden sm:block">Quick Create</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48 p-1.5">
              <DropdownMenuGroup>
                {quickCreateItems.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-lg py-2"
                    onClick={() => navigate(item.url)}
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-gray-200 text-gray-700 shadow-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {theme === "light" ? (
              <MoonIcon className="size-5" />
            ) : (
              <SunIcon className="size-5" />
            )}
          </button>

          {/* Notification */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-gray-200 text-gray-700 shadow-xs transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800">
                <BellIcon className="size-5" />

                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring ring-white dark:ring-gray-800" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-2xl">
              <DropdownMenuLabel className="border-b border-gray-100 px-4 py-4 text-lg font-semibold text-gray-800 dark:border-gray-800 dark:text-white/90">
                Notifications
              </DropdownMenuLabel>

              <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-3">
                <p className="font-medium">New Order Received</p>
                <span className="text-xs text-muted-foreground">
                  Order #1024 has been placed
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-3">
                <p className="font-medium">New Customer Registered</p>
                <span className="text-xs text-muted-foreground">
                  John Doe created an account
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-3">
                <p className="font-medium">Inventory Alert</p>
                <span className="text-xs text-muted-foreground">
                  Product stock is running low
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-gray-200 transition-all dark:border-gray-700">
                <UserIcon className="size-5 text-gray-700 dark:text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 overflow-hidden">
              <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
                  <UserIcon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                    {displayName || "Account"}
                  </span>
                  <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <SettingsIcon /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 hover:text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOutIcon /> Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
