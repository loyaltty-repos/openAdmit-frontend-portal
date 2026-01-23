import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  School,
  MessageSquare,
  FileQuestion,
  FolderOpen,
  HelpCircle,
  Settings,
  Bell,
} from 'lucide-react';

import { SidebarHeader } from '../ui/sidebar';

const sidebarItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Student Management', path: '/admin/students', icon: Users },
  { title: 'Tasks', path: '/admin/tasks', icon: ClipboardList },
  { title: 'Subtasks', path: '/admin/subtasks', icon: FileText },
  { title: 'University Management', path: '/admin/universities', icon: School },
  { title: 'Communication', path: '/admin/messages', icon: MessageSquare },
  { title: 'Questionnaires', path: '/admin/forms', icon: FileQuestion },
  { title: 'Document Manager', path: '/admin/documents', icon: FolderOpen },
  { title: 'FAQs & Knowledge Base', path: '/admin/faqs', icon: HelpCircle },
  { title: 'Settings', path: '/admin/settings', icon: Settings },
  { title: 'Notifications', path: '/admin/notifications', icon: Bell },

];

export function AppSidebar() {
  const location = useLocation();

  // This will sync with the actual sidebar collapse state
  const [collapsed, setCollapsed] = useState(false);

  // Listen to the Sidebar's data-state attribute to stay in sync
  useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar]');
    if (!sidebar) return;

    const updateCollapsed = () => {
      const state = sidebar.getAttribute('data-state');
      setCollapsed(state === 'collapsed');
    };

    // Initial check
    updateCollapsed();

    // Observe attribute changes
    const observer = new MutationObserver(updateCollapsed);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['data-state'] });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border overflow-hidden bg-primary">
        <SidebarHeader className="bg-primary">
          <div className="flex items-center">
            {/* Full logo - hidden when collapsed to icons */}
            <img
              src="/images/logo-light.svg"
              alt="Logo"
              className="w-[200px] h-auto group-data-[collapsible=icon]:hidden"
            />
            {/* Favicon - shown only when collapsed to icons */}
            <img
              src="/images/favicon.svg"
              alt="Favicon"
          
              className=" w-64 hidden group-data-[collapsible=icon]:block"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 w-fit bg-primary">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#F2E3BB]',
                        location.pathname === item.path
                          ? 'bg-[#F2E3BB] text-primary hover:bg-[#F2E3BB] hover:text-white'
                          : 'hover:bg-gray-300/50'
                      )}
                    >
                      <Link to={item.path} className="w-full flex items-center">
                        <item.icon className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-2')} />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Your original bottom collapse button (visible only when collapsed) */}
        {collapsed && (
          <div className="mt-auto p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Trigger the real sidebar toggle
                document.querySelector('[data-sidebar-trigger]')?.click();
              }}
              className="h-8 w-8 mx-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Sidebar>

      {/* Your original floating trigger button */}
      <div className="mt-5">
        <SidebarTrigger>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      </div>
    </>
  );
}