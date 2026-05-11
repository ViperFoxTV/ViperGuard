const NAV = [
  { section: "Overview" },
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
  { section: "Moderation" },
  { id: "moderation", label: "Mod actions", icon: "ti-shield" },
  { id: "crossban", label: "Cross-ban", icon: "ti-ban" },
  { id: "notes", label: "User notes", icon: "ti-notes" },
  { id: "history", label: "History", icon: "ti-history" },
  { id: "staffhistory", label: "Staff history", icon: "ti-users" },
  { section: "Server" },
  { id: "server", label: "Channels & roles", icon: "ti-settings" },
  { id: "economy", label: "Economy", icon: "ti-coin" },
  { id: "shop", label: "Shop", icon: "ti-shopping-cart" },
  { section: "System" },
  { id: "features", label: "Features", icon: "ti-toggle-left" },
];

export default function Sidebar({ user, page, setPage, apiUrl }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`
    : null;

  async function handleLogout() {
    await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.reload();
  }

  return (
    <aside style={{
      width: 210,
      minWidth: 210,
      background: "#111",
      borderRight: "0.5px solid #2ECC7122",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "0.5px solid #2ECC7122" }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>🐍 ViperGuard</div>
        <div style={{ fontSize: 11, color: "#2ECC71" }}>Staff Dashboard</div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} style={{
              fontSize: 10,
              color: "#555",
              padding: "12px 16px 4px",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}>
              {item.section}
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 16px",
                background: page === item.id ? "#2ECC7111" : "transparent",
                borderLeft: `2px solid ${page === item.id ? "#2ECC71" : "transparent"}`,
                border: "none",
                borderLeftWidth: 2,
                borderLeftStyle: "solid",
                borderLeftColor: page === item.id ? "#2ECC71" : "transparent",
                color: page === item.id ? "#2ECC71" : "#99AAB5",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} />
              {item.label}
            </button>
          )
        )}
      </nav>

      {/* User footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "0.5px solid #2ECC7122",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 30, height: 30, borderRadius: "50%" }} />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#2ECC7122", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#2ECC71", fontWeight: 500,
          }}>
            {user.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.username}
          </div>
          <div style={{ fontSize: 10, color: "#2ECC71" }}>Staff</div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}
        >
          <i className="ti ti-logout" />
        </button>
      </div>
    </aside>
  );
}
