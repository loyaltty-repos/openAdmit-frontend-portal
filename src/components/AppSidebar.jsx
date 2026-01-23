import { useLocation, useNavigate } from 'react-router-dom';
import {
  User, Home,
  MessageSquare, Settings, LogOut,
  HelpCircle,
  FileText, School, ListChecks,
  CheckSquare, BriefcaseBusiness,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toast } from 'sonner';

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const AppSidebar = ({ isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const SIGNIN_URL = import.meta.env.VITE_HOME_PATH;
  const keyword = "your-secret-keyword";
  const handleSignin = (e) => {
    e.preventDefault();

    // 1) set payload
    window.name = JSON.stringify({ navKeyword: keyword });
    console.log("Sidebar set window.name:", window.name);

    // 2) full navigation (same tab)
    window.location.assign(SIGNIN_URL);
  };
  // console.log(SIGNIN_PATH)
  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const menuItems = [
    { id: 2, name: 'Dashboard', icon: <Home className="h-5 w-5" />, link: '/dashboard' },
    { id: 1, name: 'Profile', icon: <User className="h-5 w-5" />, link: '/dashboard/profile' },
    // { id: 3, name: 'Timeline', icon: <ListChecks className="h-5 w-5" />, link: '/dashboard/timeline' },
    { id: 4, name: 'Checklist', icon: <CheckSquare className="h-5 w-5" />, link: '/dashboard/checklist' },
    { id: 5, name: 'Universities', icon: <School className="h-5 w-5" />, link: '/dashboard/universities' },
    // { id: 6, name: 'Edu Loan', icon: <BriefcaseBusiness className="h-5 w-5" />, link: '/dashboard/edu-loan' },
    { id: 7, name: 'FAQs', icon: <HelpCircle className="h-5 w-5" />, link: '/dashboard/faq' },
    { id: 8, name: 'Documents', icon: <FileText className="h-5 w-5" />, link: '/dashboard/documents' },
    { id: 10, name: 'Messages', icon: <MessageSquare className="h-5 w-5" />, link: '/dashboard/chat' },
    { id: 11, name: 'Notifications', icon: <Bell className="h-5 w-5" />, link: '/dashboard/notifications' },
    // { id: 11, name: 'Settings', icon: <Settings className="h-5 w-5" />, link: '/dashboard/settings' },
    { id: 12, name: 'Sign Out', icon: <LogOut className="h-5 w-5" />, action: handleLogout },
  ];

  return (
    <Sidebar collapsible="icon" className='overflow-hidden bg-primary'>
      <SidebarHeader className={'bg-primary'}>
        {/* {!isSidebarOpen && (
          <div className="py-4 ml-1">
            <img src="/logo.svg" height={35} width={35} />
          </div>
        )} */}

        <a href={SIGNIN_URL} onClick={handleSignin}
          className="flex items-center justify-center"
        >
          <img
            src="/images/logo-light.svg"
            alt="openAdmit logo"
            className="w-[200px] h-auto group-data-[collapsible=icon]:hidden"
          />
          <img
            src="/images/favicon.svg"
            alt="openAdmit favicon"
            className="w-64 hidden group-data-[collapsible=icon]:block"
          />
        </a>
        {/* )} */}
      </SidebarHeader>

      <SidebarContent className={cn('bg-primary', !isSidebarOpen && 'px-2')}>

        <SidebarMenu className={cn('px-3', !isSidebarOpen && 'px-1')}>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              {item.link ? (
                <Link to={item.link} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.name}
                    className={cn(
                      'w-full justify-start cursor-pointer p-6 text-[#F2E3BB]',
                      location.pathname === item.link && 'bg-[#F2E3BB] text-primary hover:bg-[#F2E3BB] hover:text-white'
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </Link>
              ) : (
                <SidebarMenuButton
                  onClick={item.action}
                  tooltip={item.name}
                  className="w-full justify-start cursor-pointer text-red-500 p-6 hover:bg-red-100 hover:text-red-500"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

AppSidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};
export default AppSidebar;