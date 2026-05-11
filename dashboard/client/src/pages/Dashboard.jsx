import { useState, useEffect } from "react";

export default function Dashboard({ apiUrl }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}/api/server/stats`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiUrl]);

  const statCards = [
    { label: "Active bans", value: stats?.activeBans ?? "—", sub: "across this server" },
    { label: "Open tickets", value: stats?.openTickets ?? "—", sub: "awaiting response" },
    { label: "Cross-bans", value: stats?.crossBans ?? "—", sub: "synced globally" },
    { label: "🐍 Coins out", value: stats?.coinsInCirculation?.toLocaleString() ?? "—", sub: "in circulation" },
  ];

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 28 }}>Welcome back to ViperGuard.</p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: "#111",
            border: "0.5px solid #2ECC7122",
            borderRadius: 12,
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: "#fff" }}>
              {loading ? "..." : card.value}
            </div>
            <div style={{ fontSize: 11, color: "#2ECC71", marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Mod actions", desc: "Issue warns, kicks, bans and view history.", page: "moderation" },
          { title: "Cross-ban", desc: "Sync bans across all servers instantly.", page: "crossban" },
          { title: "Economy", desc: "Manage Viper Coins and the shop.", page: "economy" },
          { title: "Server settings", desc: "Set channels, roles, and welcome messages.", page: "server" },
          { title: "User notes", desc: "Add and view staff notes on users.", page: "notes" },
          { title: "Feature toggles", desc: "Turn bot features on or off.", page: "features" },
        ].map((item) => (
          <div key={item.title} style={{
            background: "#111",
            border: "0.5px solid #1a1a1a",
            borderRadius: 12,
            padding: "16px 20px",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2ECC7144"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1a1a1a"}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
