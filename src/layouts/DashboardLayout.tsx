import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import type React from "react";



const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar/>

        <div className="flex flex-col flex-1 min-w-0">
          {/* sticky navbar — stays within the flex column, width follows sidebar */}
          <div className="sticky top-0 z-10 bg-background">
            <Navbar />
          </div>

          {/* scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout;