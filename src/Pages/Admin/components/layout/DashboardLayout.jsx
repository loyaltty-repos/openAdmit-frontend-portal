import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import PropTypes from 'prop-types';

export function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1  p-4 md:p-6 min-w-0 overflow-x-auto ml-[-30px]">{children}</main>
        </div>
      </div>
    </SidebarProvider>)
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
}; 