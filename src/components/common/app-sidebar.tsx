import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Home,
  Boxes,
  ShoppingCart,
  Users,
  TicketPercent,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react"

const sidebarItems = [
  {
    label: "Home",
    icon: Home,
    items: [{ title: "Overview", url: "/" }],
  },
  {
    label: "Catalog",
    icon: Boxes,
    items: [
      { title: "Products", url: "/products" },
      { title: "Categories", url: "/categories" },
      { title: "Inventory", url: "/inventory" },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Orders", url: "/orders" },
      { title: "Transactions", url: "/transactions" },
    ],
  },
  {
    label: "Users & Access",
    icon: Users,
    items: [
      { title: "Customers", url: "/customers" },
      { title: "Staff", url: "/staff" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [{ title: "Reports", url: "/reports" }],
  },
  {
    label: "System",
    icon: Settings,
    items: [
      { title: "General Settings", url: "/settings" },
      { title: "Authentication", url: "/auth-settings" },
      { title: "Roles & Permissions", url: "/roles" },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()

  const isCollapsed = state === "collapsed"

  const [openSections, setOpenSections] = useState<string[]>(["Dashboard"])

  // auto open active section
  useEffect(() => {
    const active = sidebarItems.find((section) =>
      section.items.some((item) => item.url === location.pathname),
    )

    if (active) {
      setOpenSections((prev) =>
        prev.includes(active.label) ? prev : [...prev, active.label],
      )
    }
  }, [location.pathname])

  // close all when collapsed
  useEffect(() => {
    if (isCollapsed) setOpenSections([])
  }, [isCollapsed])

  const toggleSection = (label: string) => {
    if (isCollapsed) return

    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  return (
    <Sidebar collapsible="icon" variant="floating" className="z-50">
      {/* HEADER */}
      <SidebarHeader className="mt-2 flex items-center gap-2 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <LayoutDashboard className="h-6 w-6 shrink-0" />

        <span className="font-bold text-xl group-data-[collapsible=icon]:hidden">
          Dahsbord
        </span>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        {sidebarItems.map((section) => {
          const isOpen = openSections.includes(section.label)
          const isActive = section.items.some(
            (item) => item.url === location.pathname,
          )

          return (
            <SidebarGroup
              key={section.label}
              className="group-data-[collapsible=icon]:items-center"
            >
              {/* HEADER */}
              <SidebarGroupLabel
                onClick={() => toggleSection(section.label)}
                className={`flex items-center justify-between text-base cursor-pointer rounded-md px-2 py-2 transition-colors
                  ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }
                  hover:bg-accent
                  group-data-[collapsible=icon]:justify-center
                  group-data-[collapsible=icon]:px-0
                `}
              >
                <span className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
                  {/* ICON (ALWAYS VISIBLE) */}
                  <section.icon className="size-4.5 shrink-0 block" />

                  {/* LABEL */}
                  <span className="group-data-[collapsible=icon]:hidden">
                    {section.label}
                  </span>
                </span>

                {/* CHEVRON */}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300
                    group-data-[collapsible=icon]:hidden
                    ${isOpen ? "rotate-180" : ""}
                  `}
                />
              </SidebarGroupLabel>

              {/* SUBMENU */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                  ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <NavLink to={item.url} end>
                          {({ isActive }) => (
                            <SidebarMenuButton
                              isActive={isActive}
                              className={`pl-8 ${
                                isActive ? "text-primary font-medium" : ""
                              }`}
                            >
                              {item.title}
                            </SidebarMenuButton>
                          )}
                        </NavLink>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </div>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
