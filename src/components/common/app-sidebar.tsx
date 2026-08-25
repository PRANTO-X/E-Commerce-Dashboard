import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"
import { useAppSelector } from "@/app/hooks"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Megaphone,
  FileText,
  Store,
} from "lucide-react"

const sidebarItems = [
  {
    label: "Home",
    icon: LayoutDashboard,
    items: [{ title: "Overview", url: "/" }],
  },
  {
    label: "Catalog",
    icon: Boxes,
    items: [
      { title: "Products", url: "/products" },
      { title: "Categories", url: "/categories" },
      { title: "Attributes", url: "/attributes" },
      { title: "Inventory", url: "/inventory" },
      { title: "Warehouses", url: "/warehouses" },
      { title: "Reservations", url: "/inventory/reservations" },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Orders", url: "/orders" },
      { title: "Payments", url: "/payments" },
      { title: "Expenses", url: "/expenses" },
      { title: "Returns", url: "/returns" },
      { title: "Couriers", url: "/couriers" },
      { title: "Shipments", url: "/shipments" },
    ],
  },
  {
    label: "Users",
    icon: Users,
    items: [
      { title: "Customers", url: "/customers" },
      { title: "Staffs", url: "/staffs" },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    items: [
      { title: "Coupons", url: "/coupons" },
      { title: "Campaigns", url: "/campaigns" },
      { title: "Reviews", url: "/reviews" },
      { title: "Flash Sales", url: "/flash-sales" },
      { title: "Group Buys", url: "/group-buys" },
      { title: "Automations", url: "/automations" },
    ],
  },
  {
    label: "CMS",
    icon: FileText,
    items: [
      { title: "Banners", url: "/banners" },
      { title: "Blog Posts", url: "/blog-posts" },
      { title: "Pages", url: "/pages" },
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
      { title: "Notifications", url: "/notifications" },
      { title: "Audit Logs", url: "/audit-logs" },
    ],
  },
]

const groups: { label: string; sections: string[] }[] = [
  {
    label: "MAIN",
    sections: ["Home", "Catalog", "Sales"],
  },
  {
    label: "CONTENT",
    sections: ["Users", "Marketing", "CMS"],
  },
  {
    label: "GROWTH",
    sections: ["Analytics", "System"],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { state, isMobile, setOpenMobile, setOpen } = useSidebar()
  const user = useAppSelector((state) => state.auth.user)

  const isCollapsed = state === "collapsed"

  const hasFullName = Boolean(user?.first_name?.trim() || user?.last_name?.trim())
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  const displayName = hasFullName
    ? fullName
    : user?.email
      ? user.email
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Admin Workspace"

  const userEmail = user?.email || ""
  const userRole = user?.role ? user.role.replace(/_/g, " ").toUpperCase() : "ADMIN"

  const initials = user
    ? hasFullName
      ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
      : (user.email?.[0] ?? "A").toUpperCase()
    : "AD"

  const [openSections, setOpenSections] = useState<string[]>([])

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // auto open active section
  useEffect(() => {
    if (isCollapsed) return

    const active = sidebarItems.find((section) =>
      section.items.some((item) => item.url === location.pathname),
    )

    if (active) {
      setOpenSections((prev) =>
        prev.includes(active.label) ? prev : [...prev, active.label],
      )
    }
  }, [location.pathname, isCollapsed])

  // close all when collapsed
  useEffect(() => {
    if (isCollapsed) setOpenSections([])
  }, [isCollapsed])

  const toggleSection = (label: string) => {
    if (isCollapsed) {
      setOpen(true)
      setOpenSections([label])
      return
    }

    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  const sectionFor = (label: string) =>
    sidebarItems.find((s) => s.label === label)

  return (
    <Sidebar variant="floating" collapsible="icon" className="z-30">
      {/* HEADER */}
      <SidebarHeader className="mb-6 mt-2 flex items-center px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:w-auto"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-primary-500/20 group-data-[collapsible=icon]:size-9">
            <Store className="size-5" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
              NestmartIT
            </span>
            <span className="block truncate text-xs font-medium text-gray-500 dark:text-gray-400">
              Admin Workspace
            </span>
          </span>
        </NavLink>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="overflow-x-hidden px-3 group-data-[collapsible=icon]:px-0">
        {groups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            <p className="mb-2 px-3 text-xs font-normal uppercase text-gray-400 dark:text-gray-500 group-data-[collapsible=icon]:hidden">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.sections.map((label) => {
                const section = sectionFor(label)
                if (!section) return null

                const isOpen = openSections.includes(section.label)
                const isActive = section.items.some(
                  (item) => item.url === location.pathname,
                )

                return (
                  <div key={section.label}>
                    {/* HEADER */}
                    <button
                      onClick={() => toggleSection(section.label)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:mx-auto ${
                        isActive
                          ? "text-primary-500"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                        <section.icon className="size-5 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {section.label}
                        </span>
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* SUBMENU */}
                    <div
                      className={`grid transition-all duration-200 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-0.5 py-1">
                          {section.items.map((item) => (
                            <NavLink
                              key={item.title}
                              to={item.url}
                              end
                              onClick={handleLinkClick}
                              className={({ isActive: itemActive }) =>
                                `flex items-center rounded-lg px-3 py-2 pl-6 text-sm transition-colors duration-200 ${
                                  itemActive
                                    ? "bg-primary-500/10 font-medium text-primary-500"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                }`
                              }
                            >
                              {item.title}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </SidebarContent>

      {/* FOOTER — profile */}
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <NavLink
          to="/profile"
          title={`Profile: ${displayName}`}
          className="hidden items-center justify-center group-data-[collapsible=icon]:flex rounded-lg transition-transform hover:scale-105"
        >
          <Avatar className="size-9 ring-2 ring-primary/20">
            {user?.profile_picture ? (
              <AvatarImage src={user.profile_picture} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </NavLink>

        <NavLink
          to="/profile"
          title="View profile & account settings"
          className="block rounded-xl border border-border bg-card p-3 shadow-sm group-data-[collapsible=icon]:hidden transition-all hover:bg-muted/60 hover:border-primary/40 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0 ring-2 ring-primary/20">
              {user?.profile_picture ? (
                <AvatarImage src={user.profile_picture} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-sm font-semibold text-foreground leading-tight" title={displayName}>
                  {displayName}
                </p>
                <span className="shrink-0 text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  {userRole}
                </span>
              </div>
              <p
                className="truncate text-xs text-muted-foreground mt-0.5 font-normal select-all"
                title={userEmail}
              >
                {userEmail}
              </p>
            </div>
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  )
}
