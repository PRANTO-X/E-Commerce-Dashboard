import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import ScrollToTop from "@/components/common/ScrollToTop";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* sticky navbar — same surface as sidebar, no border */}
          <div className="sticky top-0 z-10 bg-background">
            <Navbar />
          </div>

          {/* floating content panel */}
          <main
            data-scroll-container
            className="m-3 flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-0 mt-0 dark:border-border dark:bg-background"
          >
            <ScrollToTop />
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
