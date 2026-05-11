import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Moderation from "./pages/Moderation";
import Economy from "./pages/Economy";
import ServerSettings from "./pages/ServerSettings";
import Features from "./pages/Features";
import Sidebar from "./components/Sidebar";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");

  // Check if the user is already logged in when the page loads
  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.discord_id) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🐍 ViperGuard</div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!user) return <Login apiUrl={API} />;

  // Logged in — show the dashboard
  const pages = {
    dashboard: <Dashboard apiUrl={API} />,
    moderation: <Moderation apiUrl={API} />,
    economy: <Economy apiUrl={API} />,
    server: <ServerSettings apiUrl={API} />,
    features: <Features apiUrl={API} />,
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} apiUrl={API} />
      <main className="app-main">
        {pages[page] || <Dashboard apiUrl={API} />}
      </main>
    </div>
  );
}
