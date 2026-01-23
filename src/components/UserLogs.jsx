import { Clock, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    getStudentNotifications,
    getAdminNotifications,
    markStudentNotificationAsRead,
    markAdminNotificationAsRead,
} from "@/services/notificationService";
import { getUser } from "@/lib/auth";
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

const getRouteByNotificationType = (type, isAdminView) => {
    const t = String(type || "").toUpperCase();

    if (!isAdminView) {
        if (t === "MESSAGE") return "/dashboard/chat";
        if (t === "UNIVERSITY") return "/dashboard/universities";
        if (t === "TASK") return "/dashboard/checklist";
        if (t === "DOCUMENT") return "/dashboard/documents";
        return "/dashboard";
    }

    if (t === "MESSAGE") return "/admin/messages";
    if (t === "UNIVERSITY") return "/admin/universities";
    if (t === "TASK") return "/admin/tasks";
    if (t === "DOCUMENT") return "/admin/documents";
    return "/admin";
};

/**
 * Props:
 * - limit: number (default 8)
 * - enablePagination: boolean (default false)
 * - showViewAll: boolean (default false)
 * - viewAllPath: string (optional)
 */
const UserLogs = ({
    limit = 8,
    enablePagination = false,
    showViewAll = false,
    viewAllPath,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const user = useMemo(() => getUser(), []);

    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);

    // ✅ split loading into 2 states
    const [initialLoading, setInitialLoading] = useState(true); // only first time when logs are empty
    const [isFetching, setIsFetching] = useState(false); // for refresh/page changes (NO BLINK)
    const [errorMsg, setErrorMsg] = useState("");

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const { latestNotification: socketNotification, refreshTick } = useNotificationSocket();

    const isAdminView = useMemo(() => {
        if (location.pathname.startsWith("/admin")) return true;
        const role = String(user?.role || "").toLowerCase();
        return role.includes("admin") || role.includes("member");
    }, [location.pathname, user?.role]);

    const resolvedViewAllPath = useMemo(() => {
        if (viewAllPath) return viewAllPath;
        return isAdminView ? "/admin/notifications" : "/dashboard/notifications";
    }, [viewAllPath, isAdminView]);

    const unreadCount = useMemo(
        () => logs.filter((l) => !l.isRead).length,
        [logs]
    );

    // ✅ prevent out-of-order responses from making UI flicker
    const reqIdRef = useRef(0);

    const formatLogs = (list = []) =>
        list.map((n) => ({
            id: n._id,
            type: n.type,
            title: n.title || "Notification",
            message: n.message || "",
            text: n.title
                ? `${n.title}${n.message ? `: ${n.message}` : ""}`
                : n.message || "Notification",
            time: timeAgo(n.createdDate),
            createdDate: n.createdDate,
            isRead: !!n.isRead,
        }));

    const fetchLogs = async (pageToFetch = page, { silent = false } = {}) => {
        const reqId = ++reqIdRef.current;
        setErrorMsg("");

        // ✅ only show big loader if we have no logs yet
        if (!silent) {
            if (logs.length === 0) setInitialLoading(true);
            else setIsFetching(true);
        }

        try {
            const params = { page: pageToFetch, limit, sortOrder: "desc" };

            const res = isAdminView
                ? await getAdminNotifications(params)
                : await getStudentNotifications(params);

            if (reqId !== reqIdRef.current) return;

            const list = res?.data?.notifications || [];
            const pag = res?.data?.pagination || null;

            setLogs(formatLogs(list));

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
                setPagination((p) => ({
                    ...p,
                    page: pageToFetch,
                    limit,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: pageToFetch > 1,
                }));
                setPage(pageToFetch);
            }
        } catch (e) {
            if (reqId !== reqIdRef.current) return;

            console.error("Error fetching user logs:", e);

            // ✅ DO NOT clear logs here (no blink / no empty)
            setErrorMsg(
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load notifications"
            );
        } finally {
            if (reqId !== reqIdRef.current) return;

            if (!silent) {
                setInitialLoading(false);
                setIsFetching(false);
            }
        }
    };

    // initial load / role switch / limit change
    useEffect(() => {
        setPage(1);
        fetchLogs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdminView, limit]);

    // refresh tick from socket (silent refresh: no loader, no blink)
    useEffect(() => {
        if (!refreshTick) return;
        const p = enablePagination ? page : 1;
        fetchLogs(p, { silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTick]);

    // pagination fetch (no blink)
    useEffect(() => {
        if (!enablePagination) return;
        fetchLogs(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, enablePagination]);

    // add new notification to top without blinking
    useEffect(() => {
        if (!socketNotification?._id) return;

        setLogs((prev) => {
            const exists = prev.some((l) => l.id === socketNotification._id);
            if (exists) return prev;

            const formatted = {
                id: socketNotification._id,
                type: socketNotification.type,
                title: socketNotification.title || "Notification",
                message: socketNotification.message || "",
                text: socketNotification.title
                    ? `${socketNotification.title}${socketNotification.message ? `: ${socketNotification.message}` : ""
                    }`
                    : socketNotification.message || "Notification",
                time: timeAgo(socketNotification.createdDate),
                createdDate: socketNotification.createdDate,
                isRead: !!socketNotification.isRead,
            };

            const next = [formatted, ...prev];
            return enablePagination ? next : next.slice(0, limit);
        });
    }, [socketNotification, enablePagination, limit]);
    // your existing effects...
    // useEffect(() => {
    //     fetchLogs(1);
    // }, []);

    // useEffect(() => {
    //     if (refreshTick > 0) fetchLogs(1, { silent: true });
    // }, [refreshTick]);

    // useEffect(() => {
    //   if (latestNotification) fetchLogs(1, { silent: true });
    // }, [latestNotification]);

    // ✅ ADD THIS HERE (fallback auto-refresh when logs are empty)
    useEffect(() => {
        if (initialLoading) return;
        if (logs.length > 0) return;

        let tries = 0;
        const maxTries = 12;
        const intervalMs = 5000;

        const id = setInterval(() => {
            tries += 1;
            fetchLogs(1, { silent: true });

            if (tries >= maxTries) clearInterval(id);
        }, intervalMs);

        return () => clearInterval(id);
    }, [initialLoading, logs.length]);



    const markReadAndNavigate = async (log) => {
        try {
            // optimistic
            setLogs((prev) =>
                prev.map((l) => (l.id === log.id ? { ...l, isRead: true } : l))
            );

            if (isAdminView) await markAdminNotificationAsRead(log.id);
            else await markStudentNotificationAsRead(log.id);

            navigate(getRouteByNotificationType(log.type, isAdminView));
        } catch (e) {
            console.error("Error marking log as read:", e);
            // soft refresh (no blink)
            fetchLogs(page, { silent: true });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-base md:text-lg font-semibold text-gray-900">
                        Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                        {unreadCount ? `• ${unreadCount} unread` : ""}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* ✅ small spinner, list stays visible */}
                    {isFetching && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => fetchLogs(page)}
                        className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                        disabled={initialLoading || isFetching}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {/* ✅ only show big loader if nothing is on screen */}
                {initialLoading && logs.length === 0 ? (
                    <div className="rounded-md border border-gray-100 p-4 text-sm text-gray-600">
                        Loading activity...
                    </div>
                ) : logs?.length ? (
                    logs.map((log) => (
                        <button
                            key={log.id}
                            type="button"
                            onClick={() => markReadAndNavigate(log)}
                            className={`w-full cursor-pointer text-left flex items-start gap-3 rounded-md border border-gray-100 p-3 transition
                ${log.isRead
                                    ? "bg-white hover:bg-gray-50"
                                    : "bg-primary/10 border-l-4 border-primary hover:bg-primary/20 rounded-r"
                                }`}
                        >
                            <div className="mt-0.5 h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-gray-700" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-800 leading-snug line-clamp-2">
                                    {log.text}
                                </p>

                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500">{log.time}</p>

                                    {!log.isRead && (
                                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            NEW
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="rounded-md border border-dashed border-gray-200 p-6 text-center">
                        <p className="text-sm text-gray-600">No activity yet.</p>
                    </div>
                )}

                {/* ✅ show error without clearing list */}
                {!!errorMsg && (
                    <div className="rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Dashboard: View all button (ONLY when pagination is disabled) */}
            {showViewAll && !enablePagination && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(resolvedViewAllPath)}
                        className="w-full py-3 text-sm font-medium text-primary hover:bg-gray-50 rounded-md text-center"
                    >
                        View all notifications
                    </button>
                </div>
            )}

            {/* Notifications page: Pagination (ONLY when enabled) */}
            {enablePagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        className="px-3 py-2 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        disabled={initialLoading || isFetching || !pagination.hasPrevPage}
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
                        className="px-3 py-2 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        disabled={initialLoading || isFetching || !pagination.hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserLogs;
