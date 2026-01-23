import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socketClient";
import { getUser } from "@/lib/auth";

const NotificationSocketContext = createContext(null);

const log = (...args) => console.log("[NOTIF_SOCKET]", ...args);
const warn = (...args) => console.warn("[NOTIF_SOCKET]", ...args);
const err = (...args) => console.error("[NOTIF_SOCKET]", ...args);

export const NotificationSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // last valid notification (only set when we can parse _id)
    const [latestNotification, setLatestNotification] = useState(null);

    // ✅ IMPORTANT: increments on EVERY notification event (even {} payload)
    const [refreshTick, setRefreshTick] = useState(0);

    const joinedRef = useRef(false);
    const user = getUser();
    useEffect(() => {
        log("🟡 Provider mounted. connecting socket...");

        const s = connectSocket();
        if (!s) {
            err("❌ connectSocket() returned null (check VITE_SERVER_URL).");
            return;
        }

        setSocket(s);
        log("🟢 connectSocket() returned socket =>", s);

        const onConnect = () => {
            setIsConnected(true);
            log("✅ connected:", s.id);


            const userId = user?._id || user?.id;

            if (!userId) {
                warn("⚠️ No userId found from getUser(). Join skipped.");
            } else if (!joinedRef.current) {
                joinedRef.current = true;
                log("🚪 attempting join for userId:", userId, "socketId:", s.id);

                // Try common join event names (backend dependent). Harmless if not used.
                try {
                    s.emit("notification:join", { userId });
                    s.emit("join", { userId });
                    s.emit("register", { userId });
                    // console.log("register", userId)
                    s.emit("user:join", { userId });
                    s.emit("room:join", { room: `user:${userId}` });
                } catch (e) {
                    warn("⚠️ join emit failed:", e);
                    // console.log("Error", e)
                }
            }
        };

        const onDisconnect = (reason) => {
            setIsConnected(false);
            joinedRef.current = false;
            warn("⚠️ disconnected:", reason);
        };

        const onConnectError = (e) => {
            setIsConnected(false);
            err("❌ connect_error:", e?.message || e);
        };

        // ✅ exact listener
        const onNewNotification = (payload) => {
            log("🔔 notification:new received =>", payload);

            // ✅ ALWAYS trigger API refresh for consumers
            setRefreshTick((t) => t + 1);

            // Only set latestNotification if payload has real _id
            const raw = normalizeNotification(payload);
            if (!raw?._id) return;

            log("🧩 normalized notification =>", raw);
            setLatestNotification(raw);
        };

        // ✅ global debug listener (also triggers refresh)
        const onAny = (event, ...args) => {
            // (console.warn shows stacktrace; switch to log if you want quieter console)
            log("📡 event:", event, args);

            const isNotificationEvent =
                event === "notification:new" ||
                event === "newNotification" ||
                event === "notification" ||
                event === "notification:created" ||
                event === "notifications:new" ||
                event === "sendNotification";

            if (!isNotificationEvent) return;

            // ✅ ALWAYS trigger API refresh
            setRefreshTick((t) => t + 1);

            // try to parse a real notification (optional)
            const payload = args?.[0];
            const raw = normalizeNotification(payload);
            if (!raw?._id) return;

            log("🔔 onAny normalized notification =>", raw);
            setLatestNotification(raw);
        };

        // Attach
        s.on("connect", onConnect);
        s.on("disconnect", onDisconnect);
        s.on("connect_error", onConnectError);

        s.on("notification:new", onNewNotification);
        s.onAny(onAny);

        if (s.connected) onConnect();

        return () => {
            log("🛑 Provider unmount. removing listeners & disconnecting...");

            try {
                s.off("connect", onConnect);
                s.off("disconnect", onDisconnect);
                s.off("connect_error", onConnectError);
                s.off("notification:new", onNewNotification);
                s.offAny(onAny);
            } catch (_) { }

            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
            joinedRef.current = false;
        };
    }, [user?._id]);

    const value = useMemo(
        () => ({
            socket,
            isConnected,
            latestNotification,
            setLatestNotification,
            refreshTick, // ✅ expose
        }),
        [socket, isConnected, latestNotification, refreshTick]
    );

    useEffect(() => {
        log("📦 ctx state =>", { isConnected, refreshTick, latestNotification });
    }, [isConnected, refreshTick, latestNotification]);

    return (
        <NotificationSocketContext.Provider value={value}>
            {children}
        </NotificationSocketContext.Provider>
    );
};

// Handles payload shapes:
// - { notification: {...} }
// - { data: {...} }
// - {...}
// - [{...}] or [{ notification: {...} }]
// - {} -> returns null
function normalizeNotification(payload) {
    if (!payload) return null;

    // unwrap array payload
    let p = payload;
    if (Array.isArray(p)) p = p[0] || null;
    if (!p || typeof p !== "object") return null;

    // unwrap common wrappers
    let raw = p.notification || p.data || p.payload || p;

    // unwrap if raw is array too
    if (Array.isArray(raw)) raw = raw[0] || null;
    if (!raw || typeof raw !== "object") return null;

    const id = raw._id || raw.id;
    if (!id) return null;

    return {
        ...raw,
        _id: id,
        title: raw.title || "Notification",
        message: raw.message || raw.body || "",
        createdDate: raw.createdDate || raw.createdAt || raw.timestamp || new Date().toISOString(),
        isRead: !!raw.isRead,
    };
}

export const useNotificationSocket = () => {
    const ctx = useContext(NotificationSocketContext);
    if (!ctx) throw new Error("useNotificationSocket must be used inside NotificationSocketProvider");
    return ctx;
};
