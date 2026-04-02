import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";

export default function Navbar() {
  const location = useLocation();
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="icon">☀️</span>
        <span>SolarPredict</span>
      </Link>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/buildings/0"
            className={location.pathname.startsWith("/buildings") ? "active" : ""}
          >
            History
          </Link>
        </li>
        <li>
          <span>
            <span className={`status-dot ${connected ? "connected" : "disconnected"}`} />
            {connected ? "Live" : "Offline"}
          </span>
        </li>
      </ul>
    </nav>
  );
}
