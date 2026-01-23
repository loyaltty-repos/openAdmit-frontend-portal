import { BarChart3, FileText, MessageSquare, Users } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import StatCard from '@/components/StackCard';
import TasksList from '@/components/TaskList';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import SidebarHeader from '@/components/SidebarHeader';
import { getStudentDashboardStats } from '@/services/dashboardService';
import UserLogs from '@/components/UserLogs';
import { useNavigate } from 'react-router-dom';

// ✅ notifications API
import {
  getStudentNotifications,
  markStudentNotificationAsRead,
} from '@/services/notificationService';

// ✅ socket refresh tick
import { useNotificationSocket } from '@/hooks/NotificationSocketContext';

// ✅ smooth count animation (1 -> 2) without flicker
const useAnimatedNumber = (value, duration = 220) => {
  const [display, setDisplay] = useState(Number(value) || 0);
  const displayRef = useRef(display);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const end = Number(value) || 0;
    const start = Number(displayRef.current) || 0;
    if (start === end) return;

    const startTime = performance.now();
    let raf;

    const step = (t) => {
      const progress = Math.min((t - startTime) / duration, 1);
      const next = Math.round(start + (end - start) * progress);
      setDisplay(next);

      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ socket event tick increments on every notification event
  const { refreshTick } = useNotificationSocket();

  const [isOpen, setIsOpen] = useState(false);

  // keep old values visible; never set these to null/...
  const [dashboardStats, setDashboardStats] = useState({
    totalPendingTasks: 0,
    totalCompletedTasks: 0,
    totalUniversityAssigned: 0,
    totalNewMessages: 0,
  });

  // show loader ONLY on first load
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // store message-notification ids so we can mark as read on click
  const [unreadMessageNotifIds, setUnreadMessageNotifIds] = useState([]);

  // ---------------------------
  // Dashboard stats fetch (initial + on socket event) WITHOUT flashing to null
  // ---------------------------
  const fetchDashboardStats = useCallback(
    async ({ silent = false } = {}) => {
      try {
        // ✅ only show loading on first load
        if (!silent && isFirstLoad) setIsLoading(true);

        const response = await getStudentDashboardStats();

        if (response?.success) {
          setDashboardStats((prev) => ({
            ...prev,
            // ✅ update only if backend returns a value, else keep previous
            totalPendingTasks:
              response?.data?.totalPendingTasks ?? prev.totalPendingTasks,
            totalCompletedTasks:
              response?.data?.totalCompletedTasks ?? prev.totalCompletedTasks,
            totalUniversityAssigned:
              response?.data?.totalUniversityAssigned ?? prev.totalUniversityAssigned,
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        if (!silent && isFirstLoad) {
          setIsLoading(false);
          setIsFirstLoad(false);
        }
      }
    },
    [isFirstLoad]
  );

  // initial stats load
  useEffect(() => {
    fetchDashboardStats({ silent: false });
  }, [fetchDashboardStats]);

  // ✅ refresh stats whenever socket event happens (debounced, silent)
  const statsDebounceRef = useRef(null);
  useEffect(() => {
    if (!refreshTick) return;

    clearTimeout(statsDebounceRef.current);
    statsDebounceRef.current = setTimeout(() => {
      fetchDashboardStats({ silent: true }); // ✅ NO loading flash
    }, 250);

    return () => clearTimeout(statsDebounceRef.current);
  }, [refreshTick, fetchDashboardStats]);

  // ---------------------------
  // Compute "New Messages" from notifications API WITHOUT resetting to 0 while loading
  // ---------------------------
  const computeNewMessages = useCallback(async () => {
    try {
      const res = await getStudentNotifications({ page: 1, limit: 50, sortOrder: 'desc' });
      const list = res?.data?.notifications;

      // ✅ if API shape is wrong or missing, keep previous value
      if (!Array.isArray(list)) return;

      const unreadMsg = list.filter((n) => {
        if (!n) return false;
        const isUnread = !n.isRead;

        const type = String(n.type || '').toLowerCase();
        const title = String(n.title || '').toLowerCase();

        // treat "message" notifications as new messages
        const isMessageType = type.includes('message') || title.includes('message');

        return isUnread && isMessageType;
      });

      setUnreadMessageNotifIds(unreadMsg.map((n) => n._id).filter(Boolean));

      setDashboardStats((prev) => ({
        ...prev,
        totalNewMessages: unreadMsg.length,
      }));
    } catch (e) {
      console.error('Error computing New Messages from notifications:', e);
      // ✅ keep previous count, no ugly reset
    }
  }, []);

  // initial compute
  useEffect(() => {
    computeNewMessages();
  }, [computeNewMessages]);

  // ✅ recompute New Messages on socket event (debounced)
  const msgDebounceRef = useRef(null);
  useEffect(() => {
    if (!refreshTick) return;

    clearTimeout(msgDebounceRef.current);
    msgDebounceRef.current = setTimeout(() => {
      computeNewMessages();
    }, 250);

    return () => clearTimeout(msgDebounceRef.current);
  }, [refreshTick, computeNewMessages]);

  // ---------------------------
  // Click handlers for StatCards
  // ---------------------------
  const handlePendingTasksClick = () => {
    navigate('/dashboard/checklist');
  };

  const handleCompletedTasksClick = () => {
    navigate('/dashboard/checklist');
  };

  const handleUniversitiesClick = () => {
    navigate('/dashboard/universities');
  };

  const handleNewMessagesClick = async () => {
    try {
      const ids = unreadMessageNotifIds || [];
      if (ids.length) {
        await Promise.all(ids.map((id) => markStudentNotificationAsRead(id)));
      }

      // optimistic UI update
      setUnreadMessageNotifIds([]);
      setDashboardStats((prev) => ({ ...prev, totalNewMessages: 0 }));
    } catch (e) {
      console.error('Error marking unread message notifications as read:', e);
    } finally {
      navigate('/dashboard/chat');
    }
  };

  // ---------------------------
  // Animated numbers (1 -> 2)
  // ---------------------------
  const pendingAnimated = useAnimatedNumber(dashboardStats.totalPendingTasks);
  const completedAnimated = useAnimatedNumber(dashboardStats.totalCompletedTasks);
  const msgAnimated = useAnimatedNumber(dashboardStats.totalNewMessages);
  const uniAnimated = useAnimatedNumber(dashboardStats.totalUniversityAssigned);

  const stats = useMemo(
    () => [
      {
        id: 1,
        icon: <BarChart3 className="text-white" />,
        iconBg: 'bg-[#FA5A7D]',
        count: isLoading ? '...' : String(pendingAnimated),
        title: 'My Pending Tasks',
        bgColor: 'bg-[#FFE2E5]',
        onClick: handlePendingTasksClick,
      },
      {
        id: 2,
        icon: <FileText className="text-white" />,
        iconBg: 'bg-[#FF947A]',
        count: isLoading ? '...' : String(completedAnimated),
        title: 'Completed Tasks',
        bgColor: 'bg-[#FFF4DE]',
        onClick: handleCompletedTasksClick,
      },
      {
        id: 3,
        icon: <MessageSquare className="text-white" />,
        iconBg: 'bg-[#3CD856]',
        count: isLoading ? '...' : String(msgAnimated),
        title: 'New Messages',
        bgColor: 'bg-[#DCFCE7]',
        onClick: handleNewMessagesClick,
      },
      {
        id: 4,
        icon: <Users className="text-white" />,
        iconBg: 'bg-[#BF83FF]',
        count: isLoading ? '...' : String(uniAnimated),
        title: 'Universities Shortlisted',
        bgColor: 'bg-[#F3E8FF]',
        onClick: handleUniversitiesClick,
      },
    ],
    [
      pendingAnimated,
      completedAnimated,
      msgAnimated,
      uniAnimated,
      isLoading,
      unreadMessageNotifIds,
    ]
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-screen">
        <AppSidebar isSidebarOpen={isOpen} />
        <SidebarInset>
          <SidebarHeader isOpen={isOpen} setIsOpen={setIsOpen} />

          <main className="p-3 md:p-6 bg-gray-50 min-w-0 overflow-x-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8 bg-white p-4 sm:p-6 md:p-8 rounded-md">
              {stats.map((stat) => (
                <StatCard
                  key={stat.id}
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  count={stat.count}
                  title={stat.title}
                  bgColor={stat.bgColor}
                  onClick={stat.onClick}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-3">
              {/* Left: Task List */}
              <section className="lg:col-span-3 bg-white rounded-md p-4 sm:p-6 md:p-8">
                <TasksList />
              </section>

              {/* Right: User Logs */}
              <section className="lg:col-span-2 bg-white rounded-md p-4 sm:p-6 md:p-8">
                <UserLogs limit={5} showViewAll />
              </section>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
