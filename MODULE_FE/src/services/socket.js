import { io } from "socket.io-client";

// Singleton — toàn bộ app dùng chung 1 connection
// Server socket chạy cùng port với BE HTTP server
const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["polling", "websocket"],
});

// ── Debug logs ──────────────────────────────────────────────
socket.on("connect", () => {
  console.log(`[Socket] ✅ Connected | id=${socket.id} | transport=${socket.io.engine.transport.name} | timestamp=${new Date().toISOString()}`);

  // Phải đặt trong connect vì engine chỉ tồn tại sau khi kết nối
  socket.io.engine.on("upgrade", (transport) => {
    console.log("[Socket] Transport upgraded →", transport.name);
  });
});

socket.on("disconnect", (reason) => {
  console.warn(`[Socket] ❌ Disconnected | reason=${reason} | timestamp=${new Date().toISOString()}`);
});

socket.on("connect_error", (err) => {
  console.error(`[Socket] ❌ Connection error | message=${err.message} | timestamp=${new Date().toISOString()}`);
});

socket.onAny((event, ...args) => {
  console.log(`[Socket] 📨 Event received | event="${event}" | data=`, args, `| timestamp=${new Date().toISOString()}`);
});

// TEST: Track when join_location is emitted
const originalEmit = socket.emit.bind(socket);
socket.emit = function(event, ...args) {
  if (event === 'join_location') {
    console.log(`[Socket] 🚀 EMITTING join_location | socketConnected=${socket.connected} | timestamp=${new Date().toISOString()}`);
  }
  return originalEmit(event, ...args);
};
// ────────────────────────────────────────────────────────────

export default socket;
