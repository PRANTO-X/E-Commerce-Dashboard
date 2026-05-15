import React from "react"
import { SidebarTrigger } from "../ui/sidebar"
import { BellIcon, SunIcon, MoonIcon, LogOutIcon,SettingsIcon,UserIcon} from "lucide-react"

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

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light")

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
    <header className="border-b border-border">
      <nav className="px-4 md:px-8 py-2 flex justify-between items-center">
        <div>
          <SidebarTrigger className="cursor-pointer" />
        </div>

        <div className="flex items-center justify-center gap-3">
          {/* Theme */}
          <div>
            <button
              onClick={toggleTheme}
              className="
          focus:outline-none focus:ring-0 focus-visible:ring-0
          border border-border p-2 cursor-pointer rounded-full
          hover:bg-border transition duration-300
        "
            >
              {theme === "light" ? (
                <MoonIcon className="size-5" />
              ) : (
                <SunIcon className="size-5" />
              )}
            </button>{" "}
          </div>
          {/* Notification */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative  focus:outline-none focus:ring-0 focus-visible:ring-0 border border-border p-2 cursor-pointer rounded-full hover:bg-border transition duration-300">
                  <BellIcon className="size-5" />

                  {/* notification dot */}
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-lg">Notifications</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex flex-col items-start py-3">
                  <p className="font-medium">New Order Received</p>

                  <span className="text-xs text-muted-foreground">
                    Order #1024 has been placed
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex flex-col items-start py-3">
                  <p className="font-medium">New Customer Registered</p>

                  <span className="text-xs text-muted-foreground">
                    John Doe created an account
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex flex-col items-start py-3">
                  <p className="font-medium">Inventory Alert</p>

                  <span className="text-xs text-muted-foreground">
                    Product stock is running low
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Profile */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 focus:outline-none focus:ring-0 focus-visible:ring-0 border border-border cursor-pointer rounded-full hover:bg-border transition duration-300">
                    <UserIcon className="size-5"/>
                  </button>
                </DropdownMenuTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium text-base">John Doe</span>
                    <span className="text-xs text-muted-foreground">
                      admin@example.com
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem><UserIcon/>Profile</DropdownMenuItem>

                  <DropdownMenuItem><SettingsIcon/>Settings</DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-red-500">
                    <LogOutIcon/>Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
