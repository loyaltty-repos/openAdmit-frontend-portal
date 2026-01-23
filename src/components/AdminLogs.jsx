import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
} from "@/services/notificationService";

// Socket refresh support
import { useNotificationSocket } from "@/hooks/NotificationSocketContext";

const timeAgo = (dateValue) => {
  if (!dateValue) return "";
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
  return d.toLocaleDateString("en-GB");
};

/**
 * Admin Notifications / Logs component
 * 
 * @param {Object} props
 * @param {number} [props.limit=8] - Number of items per page
 * @param {boolean} [props.enablePagination=false] - Show pagination controls
 * @param {boolean} [props.showViewAll=false] - Show "View all" button (widget mode)
 */
const AdminLogs = ({ limit = 8, enablePagination = false, showViewAll = false }) => {
  const navigate = useNavigate();
  const { refreshTick } = useNotificationSocket();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const unreadCount = useMemo(() => logs.filter((l) => !l.isRead).length, [logs]);

  const fetchLogs = async (pageToFetch = 1) => {
    try {
      setLoading(true);

      const params = {
        page: pageToFetch,
        limit,
        sortOrder: "desc",
      };

      const res = await getAdminNotifications(params);
      const list = res?.data?.notifications || [];
      const pag = res?.data?.pagination || null;

      setLogs(
        list.map((n) => ({
          id: n._id,
          title: n.title || "Notification",
          message: n.message || "",
          createdDate: n.createdDate,
          time: timeAgo(n.createdDate),
          isRead: !!n.isRead,
        }))
      );

      if (pag) {
        setPagination({
          total: pag.total ?? 0,
          page: pag.page ?? pageToFetch,
          limit: pag.limit ?? limit,
          totalPages: pag.totalPages ?? 1,
          hasNextPage: !!pag.hasNextPage,
          hasPrevPage: !!pag.hasPrevPage,
        });
        setPage(pag.page ?? pageToFetch);
      } else {
        // Fallback when API doesn't return pagination metadata
        setPagination((prev) => ({
          ...prev,
          page: pageToFetch,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: pageToFetch > 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLogs(1);
    setPage(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when page changes (manual pagination)
  useEffect(() => {
    // Prevent double fetch on initial mount
    if (page === 1) return;
    fetchLogs(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket refresh – always uses the current page
  useEffect(() => {
    if (!refreshTick) return;
    fetchLogs(page);
  }, [refreshTick, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    try {
      // Optimistic update
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isRead: true } : l))
      );

      await markAdminNotificationAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on failure
      fetchLogs(page);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base md:text-lg font-semibold text-gray-900">
            Notifications
          </p>
          <p className="text-xs text-gray-500">
            {unreadCount > 0 ? `• ${unreadCount} unread` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(page)}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3 flex-1 overflow-auto">
        {loading ? (
          <div className="rounded-md border border-gray-100 p-4 text-sm text-gray-600">
            Loading notifications...
          </div>
        ) : logs.length > 0 ? (
          logs.map((logItem) => (
            <button
              key={logItem.id}
              type="button"
              onClick={() => markRead(logItem.id)}
              className={`w-full cursor-pointer text-left flex items-start gap-3 rounded-md border border-gray-100 p-3 transition 
                ${
                  logItem.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-primary/10 border-l-4 border-primary hover:bg-primary/20 rounded-r"
                }`}
            >
              <div className="mt-0.5 h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-gray-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {logItem.title}
                </p>

                {logItem.message && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {logItem.message}
                  </p>
                )}

                <p className="text-[11px] text-gray-500 mt-2">
                  {logItem.time}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-md border border-gray-100 p-4 text-sm text-gray-600 text-center">
            No notifications yet 🎉
          </div>
        )}
      </div>

      {/* View All button – shown in widget/small mode */}
      {showViewAll && !enablePagination && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/notifications")}
            className="w-full py-3 text-sm font-medium text-primary hover:bg-gray-50 rounded-md text-center transition"
          >
            View all notifications
          </button>
        </div>
      )}

      {/* Pagination controls – shown in full-page mode */}
      {enablePagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            className="px-3 py-2 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            disabled={loading || !pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>

          <p className="text-xs text-gray-600">
            Page <span className="font-semibold">{pagination.page}</span> of{" "}
            <span className="font-semibold">{pagination.totalPages}</span>
          </p>

          <button
            type="button"
            className="px-3 py-2 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
            disabled={loading || !pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;