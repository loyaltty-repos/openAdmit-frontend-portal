import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUser, getUserInitials, logout, subscribeToAuth } from '@/lib/auth';

// ✅ Notifications service (admin)
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
} from '@/services/notificationService';

// ✅ socket refresh tick (same as SidebarHeader)
import { useNotificationSocket } from '@/hooks/NotificationSocketContext';

// small util (no libs)
const timeAgo = (dateValue) => {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString('en-GB');
};

export function AppHeader() {
  const [user, setUser] = useState(null);
  const [userInitials, setUserInitials] = useState('');
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // 🔔 Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage] = useState(1);
  const [notifLimit] = useState(10);

  // ✅ socket refresh tick
  const { refreshTick } = useNotificationSocket();

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/signin');
      return;
    }
    setUser(userData);
    setUserInitials(getUserInitials());

    const unsubscribe = subscribeToAuth((isAuthenticated) => {
      if (!isAuthenticated) {
        navigate('/signin');
      }
    });

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleLogout = () => {
    try {
      logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);

      const params = { page: notifPage, limit: notifLimit, sortOrder: 'desc' };
      const res = await getAdminNotifications(params);

      const list = res?.data?.notifications || [];
      const formatted = list.map((n) => ({
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: !!n.isRead,
        createdDate: n.createdDate,
        time: timeAgo(n.createdDate),
      }));

      setNotifications(formatted);
    } catch (e) {
      console.error('Notification fetch failed:', e);
    } finally {
      setNotifLoading(false);
    }
  }, [notifLimit, notifPage]);

  // ✅ initial fetch (badge count)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ real-time refresh when socket gets any notification event
  useEffect(() => {
    if (!refreshTick) return;
    fetchNotifications();
  }, [refreshTick, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markOneAsRead = async (notificationId) => {
    try {
      // optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      await markAdminNotificationAsRead(notificationId);
    } catch (e) {
      console.error('Mark read failed:', e);
      // rollback (best-effort)
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length === 0) return;

    // optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await Promise.all(unreadIds.map((id) => markAdminNotificationAsRead(id)));
    } catch (e) {
      console.error('Mark all read failed:', e);
      fetchNotifications();
    }
  };

  const clearAllLocal = () => {
    setNotifications([]);
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur flex items-center px-4 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold ">Dashboard</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* 🔔 Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={async () => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next) await fetchNotifications();
              }}
              className="relative h-10 w-10 rounded-md cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
             <div
  className="
    absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-gray-200 overflow-hidden
    max-sm:fixed max-sm:top-16 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:right-auto
    max-sm:w-[calc(100vw-24px)] max-sm:max-w-[420px]
  "
>

                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    {notifLoading && (
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline"
                      disabled={notifLoading || unreadCount === 0}
                    >
                      Mark all read
                    </button>
                    {/* <button
                      type="button"
                      onClick={clearAllLocal}
                      className="text-xs text-gray-600 hover:underline"
                      disabled={notifLoading}
                    >
                      Clear
                    </button> */}
                  </div>
                </div>

                {/* List */}
         <div className="max-h-80 max-sm:max-h-[60vh] overflow-auto">


                  {!notifLoading && notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-sm text-gray-600">No notifications 🎉</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => markOneAsRead(n._id)}
                        className={`w-full text-left cursor-pointer px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${n.isRead ? 'bg-white' : 'bg-primary/10 border-l-4 border-primary'
                          }`}
                      >
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {n.title || 'Notification'}
                        </p>
                        {n.message ? (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                        ) : null}
                        <p className="text-[11px] text-gray-500 mt-2">{n.time}</p>
                      </button>
                    ))
                  )}
                </div>

                {/* ✅ Footer (View All) */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/admin/notifications');
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </button>

                  <button
                    type="button"
                    onClick={fetchNotifications}
                    className="text-xs text-gray-600 hover:underline"
                    disabled={notifLoading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_picture || ''} />
                  <AvatarFallback>{userInitials || 'A'}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {user?.email || ''}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
