// Socket.io client singleton — connects to Express API gateway.
import { io } from "socket.io-client";

// In production (Docker), the frontend is served by nginx which proxies to Express.
// In dev, Vite proxy handles it. Either way, connect to same origin.
const API_URL = import.meta.env.VITE_API_URL || "";

const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

socket.on("connect", () => {
  console.log("🔌 Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

export default socket;
