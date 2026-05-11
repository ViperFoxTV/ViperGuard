import { useState, useEffect } from "react";

export default function Economy({ apiUrl }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [userBal, setUserBal] = useState(null);
  const [msg, setMsg] = useState("");
  const [shop, setShop] = useState([]);
  const [tab, setTab] = useState("leaderboard");

  // New shop item form
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/economy/leaderboard`, { credentials: "include" })
      .then((r) => r.json()).then((d) => setLeaderboard(Array.isArray(d) ? d : []));
    fetch(`${apiUrl}/api/economy/shop`, { credentials: "include" })
      .then((r) => r.json()).then((d) => setShop(Array.isArray(d) ? d : []));
  }, [apiUrl]);

  async function lookupUser() {
    if (!userId) return;
    const d = await fetch(`${apiUrl}/api/economy/user/${userId}`, { credentials: "include" }).then((r) => r.json());
    setUserBal(d);
  }

  async function adjustBalance() {
    if (!userId || !amount) return setMsg("Enter a User ID and amount.");
    const res = await fetch(`${apiUrl}/api/economy/user/${userId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseInt(amount), reason }),
    }).then((r) => r.json());
    setMsg(res.success ? "✅ Balance updated!" : `❌ ${res.error}`);
    lookupUser();
  }

  async function addShopItem() {
    if (!itemName || !itemPrice) return;
    await fetch(`${apiUrl}/api/economy/shop`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: itemName, description: itemDesc, price: parseInt(itemPrice), type: "item" }),
    });
    setItemName(""); setItemDesc(""); setItemPrice("");
    const d = await fetch(`${apiUrl}/api/economy/shop`, { credentials: "include" }).then((r) => r.json());
    setShop(Array.isArray(d) ? d : []);
  }

  async function deleteItem(id) {
    await fetch(`${apiUrl}/api/economy/shop/${id}`, { method: "DELETE", credentials: "include" });
    setShop(shop.filter((i) => i.id !== id));
  }

  const input = { background: "#111", border: "0.5px solid #222", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13 };

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", marginBottom: 4 }}>Economy</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Manage 🐍 Viper Coins, balances, and the shop.</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["leaderboard", "adjust", "shop"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "#2ECC7122" : "transparent",
            border: `0.5px solid ${tab === t ? "#2ECC71" : "#222"}`,
            color: tab === t ? "#2ECC71" : "#555",
            borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          {leaderboard.length === 0
            ? <div style={{ color: "#555", fontSize: 13 }}>No economy data yet.</div>
            : leaderboard.map((u, i) => (
              <div key={u.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid #1a1a1a", fontSize: 13 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ color: i < 3 ? "#2ECC71" : "#555", fontWeight: 500, width: 20 }}>#{i + 1}</span>
                  <span style={{ color: "#fff" }}>{u.user_id}</span>
                </div>
                <span style={{ color: "#2ECC71" }}>🐍 {parseInt(u.total).toLocaleString()}</span>
              </div>
            ))}
        </div>
      )}

      {/* Adjust balance */}
      {tab === "adjust" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} style={{ ...input, flex: 1 }} />
            <button onClick={lookupUser} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>Look up</button>
          </div>
          {userBal && (
            <div style={{ background: "#0d0d0d", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#fff" }}>
              Wallet: 🐍 {parseInt(userBal.balance).toLocaleString()} &nbsp;|&nbsp; Bank: 🐍 {parseInt(userBal.bank).toLocaleString()}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input placeholder="Amount (use - to remove, e.g. -500)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...input, flex: 1 }} />
            <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ...input, flex: 2 }} />
          </div>
          <button onClick={adjustBalance} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>
            Update Balance
          </button>
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg.startsWith("✅") ? "#2ECC71" : "#ED4245" }}>{msg}</div>}
        </div>
      )}

      {/* Shop */}
      {tab === "shop" && (
        <div style={{ background: "#111", border: "0.5px solid #1a1a1a", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} style={{ ...input, flex: 1 }} />
            <input placeholder="Description" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} style={{ ...input, flex: 2 }} />
            <input placeholder="Price" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} style={{ ...input, width: 100 }} />
            <button onClick={addShopItem} style={{ background: "#2ECC71", color: "#000", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 500, cursor: "pointer", fontSize: 13 }}>Add</button>
          </div>
          {shop.length === 0
            ? <div style={{ color: "#555", fontSize: 13 }}>No shop items yet.</div>
            : shop.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid #1a1a1a", fontSize: 13 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{item.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#2ECC71" }}>🐍 {parseInt(item.price).toLocaleString()}</span>
                  <button onClick={() => deleteItem(item.id)} style={{ background: "#ED424522", color: "#ED4245", border: "0.5px solid #ED424544", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
