import { SidebarTrigger } from './ui/sidebar'
import { Bell, ChevronDown, LogOut, Menu, User } from 'lucide-react'
import { Avatar } from '@radix-ui/react-avatar'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { getUser, getUserInitials, logout } from '@/lib/auth'
import {
  getStudentNotifications,
  getAdminNotifications,
  markStudentNotificationAsRead,
  markAdminNotificationAsRead,
} from '@/services/notificationService'
import { useNotificationSocket } from '@/hooks/NotificationSocketContext'

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

const getRouteByNotificationType = (type, isAdminView) => {
  const t = String(type || "").toUpperCase();

  if (!isAdminView) {
    if (t === "MESSAGE")    return "/dashboard/chat";
    if (t === "UNIVERSITY") return "/dashboard/universities";
    if (t === "TASK")       return "/dashboard/checklist";
    if (t === "DOCUMENT")   return "/dashboard/documents";
    return "/dashboard";
  }

  // Admin routes
  if (t === "MESSAGE")    return "/admin/messages";
  if (t === "UNIVERSITY") return "/admin/universities";
  if (t === "TASK")       return "/admin/tasks";
  if (t === "DOCUMENT")   return "/admin/documents";
  return "/admin";
};

const SidebarHeader = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  // 🔔 Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage] = useState(1);
  const [notifLimit] = useState(10);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // ✅ socket context
  const { latestNotification, refreshTick } = useNotificationSocket();

  useEffect(() => {
    const userData = getUser();
    setUser(userData);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdminView = useMemo(() => {
    if (location.pathname.startsWith('/admin')) return true;
    const role = String(user?.role || '').toLowerCase();
    return role.includes('admin') || role.includes('member');
  }, [location.pathname, user?.role]);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const params = { page: notifPage, limit: notifLimit, sortOrder: 'desc' };

      const res = isAdminView
        ? await getAdminNotifications(params)
        : await getStudentNotifications(params);

      const list = res?.data?.notifications || [];

      const formatted = list.map((n) => ({
        _id: n._id,
        title: n.title || 'Notification',
        message: n.message || '',
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
  }, [isAdminView, notifLimit, notifPage]);

  useEffect(() => {
    // on every socket notification event (even empty payload), refresh from API
    if (!refreshTick) return;
    fetchNotifications();
  }, [refreshTick, fetchNotifications]);

  useEffect(() => {
    // fetch once initially (helps badge count)
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ IMPORTANT: instantly update notifications + badge when socket pushes new notification
  useEffect(() => {
    if (!latestNotification) return;

    // normalize payload (backend might send {data:{...}} or direct object)
    const raw = latestNotification?.data || latestNotification;

    // safety: must have _id
    const newId = raw?._id;
    if (!newId) return;

    const incoming = {
      _id: raw._id,
      title: raw.title || 'Notification',
      message: raw.message || '',
      type: raw.type,
      isRead: !!raw.isRead, // usually false
      createdDate: raw.createdDate || new Date().toISOString(),
      time: timeAgo(raw.createdDate || new Date().toISOString()),
    };

    // prepend if not exists
    setNotifications((prev) => {
      const exists = prev.some((n) => n._id === newId);
      if (exists) return prev;
      return [incoming, ...prev];
    });
  }, [latestNotification]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const markOneAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      if (isAdminView) {
        await markAdminNotificationAsRead(notificationId);
      } else {
        await markStudentNotificationAsRead(notificationId);
      }
    } catch (e) {
      console.error('Mark read failed:', e);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      if (isAdminView) {
        await Promise.all(unreadIds.map((id) => markAdminNotificationAsRead(id)));
      } else {
        await Promise.all(unreadIds.map((id) => markStudentNotificationAsRead(id)));
      }
    } catch (e) {
      console.error('Mark all read failed:', e);
      fetchNotifications();
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/profile') return 'Profile';
    if (path === '/dashboard/eduloan') return 'Education Loan';
    if (path === '/dashboard/order') return 'Timeline';
    if (path === '/dashboard/products') return 'Products';
    if (path === '/dashboard/faq') return 'FAQs';
    if (path === '/dashboard/chat') return 'Messages';
    if (path === '/dashboard/timeline') return 'Timeline';
    if (path === '/dashboard/checklist') return 'CheckList';
    if (path === '/dashboard/documents') return 'Doc Manager';
    if (path === '/dashboard/sales-report') return 'Sales Report';
    if (path === '/dashboard/messages') return 'Messages';
    if (path === '/dashboard/settings') return 'Settings';

    if (path.startsWith('/admin')) {
      const subPath = path.replace('/admin/', '');
      if (path === '/admin') return 'Admin Dashboard';
      if (subPath === 'students') return 'Student Management';
      if (subPath === 'tasks') return 'Task Management';
      if (subPath === 'applications') return 'Applications & Essays';
      if (subPath === 'universities') return 'University Management';
      if (subPath === 'messages') return 'Communication';
      if (subPath === 'forms') return 'Questionnaires';
      if (subPath === 'documents') return 'Document Manager';
      if (subPath === 'faqs') return 'FAQs & Knowledge Base';
      if (subPath === 'activities') return 'Activities';
      if (subPath === 'settings') return 'Settings';
    }

    return 'Go Abroad';
  };

  const getUserName = () => {
    if (!user) return 'User';
    if (user.name) return user.name;
    if (user.email) {
      const emailParts = user.email.split('@');
      return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    }
    return 'User';
  };

  return (
    <header className="bg-white py-4 px-6 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="">
          <SidebarTrigger onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-5 w-5 text-primary" />
          </SidebarTrigger>
        </div>
        <h1 className="text-2xl font-semibold text-primary">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* 🔔 Notification Icon + Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={async () => {
              const next = !showNotifications;
              setShowNotifications(next);
              setShowDropdown(false);
              if (next) await fetchNotifications();
            }}
            className="relative h-10 cursor-pointer w-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition"
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
    absolute mt-2 z-20 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden
    right-0 w-80
    max-sm:fixed max-sm:top-16 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:right-auto
    max-sm:w-[calc(100vw-16px)] max-sm:max-w-[420px]
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
                      onClick={async () => {
                        // Mark as read
                        await markOneAsRead(n._id);
                        // Navigate based on type
                        const route = getRouteByNotificationType(n.type, isAdminView);
                        navigate(route);
                        // Close dropdown
                        setShowNotifications(false);
                      }}
                      className={`w-full text-left cursor-pointer px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                        n.isRead
                          ? 'bg-white'
                          : 'bg-primary/10 border-l-4 border-primary hover:bg-primary/20 rounded-r'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[10px] text-gray-500">{n.time}</span>
                          {!n.isRead && (
                            <span className="text-[10px] mt-2 font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate(isAdminView ? "/admin/notifications" : "/dashboard/notifications");
                  }}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  View all
                </button>

                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="text-xs text-gray-600 hover:underline cursor-pointer"
                  disabled={notifLoading}
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="relative">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
          >
            <Avatar className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={getUserName()}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
              )}
            </Avatar>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{getUserName()}</p>
              <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-gray-700 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </div>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'No email'}</p>
                <p className="text-xs text-gray-500">{user?.phoneNumber || 'No phone number'}</p>
              </div>
              <a
                href="/dashboard/profile"
                className="px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </a>

              <button
                onClick={handleLogout}
                className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

SidebarHeader.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
}

export default SidebarHeader