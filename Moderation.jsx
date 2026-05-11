import { useState } from "react";

export default function Moderation({ apiUrl }) {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("actions");
  const [msg, setMsg] = useState("");

  async function lookupUser() {
    if (!userId) return;
    const [h, n] = await Promise.all([
      fetch(`${apiUrl}/api/moderation/history/${userId}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${apiUrl}/api/moderation/notes/${userId}`, { credentials: "include" }).then((r) => r.json()),
    ]);
    setHistory(Array.isArray(h) ? h : []);
    setNotes(Array.isArray(n) ? n : []);
  }

  async function doAction(action) {
    if (!userId || !reason) return setMsg("Please enter a User ID and reason.");
    const res = await fetch(`${apiUrl}/api/moderation/${action}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    }).then((r) => r.json());
    setMsg(res.success ? `✅ ${action} issued successfully.` : `❌ Error: ${res.error}`);
    lookupUser();
  }

  async function addNote() {
    if (!userId || !note) return;
    await fetch(`${apiUrl}/api/moderation/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, note }),
    });
    setNote("");
    lookupUser();
  }

  const actionBtns = [
    { label: "Warn", action: "warn", color: "#FEE75C", text: "#000" },
    { label: "Kick", action: "kick", color: "#FAA61A", text: "#000" },
    { label: "Mute", action: "mute", color: "#5865F2", text: "#fff" },
    { label: "Ban", action: "ban", color: "#ED4245", text: "#fff" },
    { label: "Unban", action: "unban", color: "#2ECC71", text: "#000" },
  ];

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Moderation</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Look up a user, view history, issue actions and add notes.</p>

      {/* User lookup */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Discord User ID (e.g. 123456789012345678)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1, background: "#111", border: "0.5px solid #222", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 }}
        />
        <button onClick={lookupUser} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>
          Look up
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["actions", "history", "notes"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "#2ECC7122" : "transparent",
            border: `0.5px solid ${tab === t ? "#2ECC71" : "#222"}`,
            color: tab === t ? "#2ECC71" : "#555",
            borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* Actions tab */}
      {tab === "actions" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          <input
            placeholder="Reason for action"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", background: "#0d0d0d", border: "0.5px solid #222", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, marginBottom: 16, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actionBtns.map((btn) => (
              <button key={btn.action} onClick={() => doAction(btn.action)} style={{
                background: btn.color, color: btn.text, border: "none", borderRadius: 8,
                padding: "8px 20px", fontWeight: 500, cursor: "pointer", fontSize: 13,
              }}>{btn.label}</button>
            ))}
          </div>
          {msg && <div style={{ marginTop: 14, fontSize: 13, color: msg.startsWith("✅") ? "#2ECC71" : "#ED4245" }}>{msg}</div>}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          {history.length === 0
            ? <div style={{ color: "#555", fontSize: 13 }}>No history found. Look up a user first.</div>
            : history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #1a1a1a", fontSize: 13 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: "#2ECC7122", color: "#2ECC71", padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>{h.action}</span>
                  <span style={{ color: "#fff" }}>{h.reason || "No reason provided"}</span>
                </div>
                <span style={{ color: "#555" }}>{new Date(h.created_at).toLocaleDateString()}</span>
              </div>
            ))}
        </div>
      )}

      {/* Notes tab */}
      {tab === "notes" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              placeholder="Add a note about this user..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ flex: 1, background: "#0d0d0d", border: "0.5px solid #222", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 }}
            />
            <button onClick={addNote} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>Add</button>
          </div>
          {notes.length === 0
            ? <div style={{ color: "#555", fontSize: 13 }}>No notes yet.</div>
            : notes.map((n, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "0.5px solid #1a1a1a", fontSize: 13 }}>
                <div style={{ color: "#fff", marginBottom: 4 }}>{n.note}</div>
                <div style={{ color: "#555", fontSize: 11 }}>{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
