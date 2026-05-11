import { useState, useEffect } from "react";

export default function ServerSettings({ apiUrl }) {
  const [settings, setSettings] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/server/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSettings(d || {}));
  }, [apiUrl]);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const res = await fetch(`${apiUrl}/api/server/settings`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).then((r) => r.json());
    setMsg(res.success ? "✅ Settings saved!" : `❌ ${res.error}`);
    setTimeout(() => setMsg(""), 3000);
  }

  const input = {
    width: "100%",
    background: "#0d0d0d",
    border: "0.5px solid #222",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 13,
    boxSizing: "border-box",
  };

  const fields = [
    { label: "Welcome channel ID", key: "welcome_channel", placeholder: "e.g. 123456789012345678" },
    { label: "Goodbye channel ID", key: "goodbye_channel", placeholder: "e.g. 123456789012345678" },
    { label: "Log channel ID", key: "log_channel", placeholder: "e.g. 123456789012345678" },
    { label: "Audit log channel ID", key: "audit_log_channel", placeholder: "e.g. 123456789012345678" },
    { label: "Ticket category ID", key: "ticket_category", placeholder: "e.g. 123456789012345678" },
    { label: "Auto-role ID", key: "auto_role", placeholder: "Role to assign on join" },
  ];

  const messages = [
    { label: "Welcome message", key: "welcome_message", placeholder: "Welcome {user} to {server}! We now have {memberCount} members!" },
    { label: "Goodbye message", key: "goodbye_message", placeholder: "{user} has left the server. We now have {memberCount} members." },
  ];

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Server settings</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
        Set channels and messages. Use channel/role IDs — right-click in Discord with Developer Mode on to copy.
      </p>

      <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#2ECC71", marginBottom: 16 }}>Channels & roles</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                style={input}
                placeholder={f.placeholder}
                value={settings[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#2ECC71", marginBottom: 16 }}>Messages</div>
        <div style={{ fontSize: 11, color: "#555", marginBottom: 14 }}>
          Placeholders: <code style={{ color: "#2ECC71" }}>{"{user}"}</code> <code style={{ color: "#2ECC71" }}>{"{server}"}</code> <code style={{ color: "#2ECC71" }}>{"{memberCount}"}</code>
        </div>
        {messages.map((f) => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input style={input} placeholder={f.placeholder} value={settings[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} />
          </div>
        ))}
      </div>

      <button onClick={save} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 500, cursor: "pointer", fontSize: 14 }}>
        Save settings
      </button>
      {msg && <span style={{ marginLeft: 16, fontSize: 13, color: msg.startsWith("✅") ? "#2ECC71" : "#ED4245" }}>{msg}</span>}
    </div>
  );
}
