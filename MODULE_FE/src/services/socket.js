import { io } from "socket.io-client";

// Singleton — toàn bộ app dùng chung 1 connection
// Server socket chạy cùng port với BE HTTP server
const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["polling", "websocket"],
});

// ── Debug logs ──────────────────────────────────────────────
socket.on("connect", () => {
  console.log("[Socket] Connected | id=", socket.id, "| transport=", socket.io.engine.transport.name);

  // Phải đặt trong connect vì engine chỉ tồn tại sau khi kết nối
  socket.io.engine.on("upgrade", (transport) => {
    console.log("[Socket] Transport upgraded →", transport.name);
  });
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket] Disconnected | reason=", reason);
});

socket.on("connect_error", (err) => {
  console.error("[Socket] Connection error |", err.message);
});

socket.onAny((event, ...args) => {
  console.log(`[Socket] Event received | event="${event}" | data=`, args);
});
// ────────────────────────────────────────────────────────────

export default socket;
