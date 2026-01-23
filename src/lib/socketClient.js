// src/lib/socketClient.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;

  const SOCKET_URL = import.meta.env.VITE_SERVER_URL;

  if (!SOCKET_URL) {
    console.error("❌ [SOCKET] VITE_SERVER_URL missing in .env");
    return null;
  }

  console.log("🟡 [SOCKET] Trying to connect =>", SOCKET_URL);

 socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("token") || localStorage.getItem("accessToken") || "",
  },
});

  socket.on("connect", () => {
    console.log("✅ [SOCKET] Connected:", socket.id, "URL:", SOCKET_URL);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ [SOCKET] connect_error:", err?.message || err);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ [SOCKET] Disconnected:", reason);
  });

  // ⭐ MOST IMPORTANT DEBUG LINE:
  socket.onAny((event, ...args) => {
    console.log("📡 [SOCKET] Event received:", event, args);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  console.log("🛑 [SOCKET] Disconnecting...");
  socket.disconnect();
  socket = null;
};
