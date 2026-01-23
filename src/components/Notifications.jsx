import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import SidebarHeader from "@/components/SidebarHeader";
import { useState } from "react";
import UserLogs from "@/components/UserLogs";

const NotificationsPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-screen">
        <AppSidebar isSidebarOpen={isOpen} />
        <SidebarInset>
          <SidebarHeader isOpen={isOpen} setIsOpen={setIsOpen} />

          <main className="p-3 md:p-6 bg-gray-50 min-w-0 overflow-x-hidden">
            <div className="bg-white rounded-md p-4 sm:p-6 md:p-8">
              <UserLogs limit={10} enablePagination />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NotificationsPage;
