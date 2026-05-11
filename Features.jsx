import { useState, useEffect } from "react";

const FEATURES = [
  { key: "economy", label: "Economy", desc: "Viper Coins, daily rewards, shop" },
  { key: "leveling", label: "Leveling", desc: "XP and level-up system" },
  { key: "moderation", label: "Moderation", desc: "Warns, kicks, bans, mutes" },
  { key: "logging", label: "Logging", desc: "Action and audit logging" },
  { key: "welcome", label: "Welcome", desc: "Welcome and goodbye messages" },
  { key: "tickets", label: "Tickets", desc: "Support ticket system" },
  { key: "giveaways", label: "Giveaways", desc: "Giveaway hosting and management" },
  { key: "birthday", label: "Birthday", desc: "Birthday announcements and roles" },
  { key: "counter", label: "Counter", desc: "Member count channels" },
  { key: "verification", label: "Verification", desc: "Member verification system" },
  { key: "reactionRoles", label: "Reaction roles", desc: "Role assignment via reactions" },
  { key: "autoRole", label: "Auto-role", desc: "Assign roles on join" },
  { key: "boostRewards", label: "Boost rewards", desc: "Rewards for server boosters" },
  { key: "notes", label: "Notes", desc: "Staff notes on users" },
  { key: "history", label: "History", desc: "User moderation history" },
  { key: "staffHistory", label: "Staff history", desc: "Track staff mod actions" },
  { key: "crossBan", label: "Cross-ban", desc: "Sync bans across all servers" },
  { key: "fun", label: "Fun", desc: "Fun commands and games" },
];

export default function Features({ apiUrl }) {
  const [features, setFeatures] = useState({});
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/features`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setFeatures(d || {}));
  }, [apiUrl]);

  async function toggle(key) {
    const newVal = !features[key];
    setFeatures((prev) => ({ ...prev, [key]: newVal }));
    setSaving(key);
    const res = await fetch(`${apiUrl}/api/features`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: key, enabled: newVal }),
    }).then((r) => r.json());
    setSaving(null);
    if (!res.success) {
      setFeatures((prev) => ({ ...prev, [key]: !newVal }));
      setMsg(`❌ Failed to update ${key}`);
    }
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Feature toggles</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Turn bot features on or off. Changes apply instantly.</p>
      {msg && <div style={{ marginBottom: 16, fontSize: 13, color: "#ED4245" }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {FEATURES.map((f) => {
          const enabled = features[f.key] !== false;
          return (
            <div key={f.key} style={{
              background: "#111",
              border: `0.5px solid ${enabled ? "#2ECC7122" : "#1a1a1a"}`,
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: "#555" }}>{f.desc}</div>
              </div>

              {/* Toggle switch */}
              <div
                onClick={() => toggle(f.key)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: enabled ? "#2ECC71" : "#333",
                  position: "relative", cursor: saving === f.key ? "wait" : "pointer",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 3, left: enabled ? 21 : 3,
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
