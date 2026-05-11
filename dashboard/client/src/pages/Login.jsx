export default function Login({ apiUrl }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0D0D0D",
    }}>
      <div style={{
        background: "#1A1A1A",
        border: "0.5px solid #2ECC7133",
        borderRadius: 16,
        padding: "40px 48px",
        textAlign: "center",
        maxWidth: 380,
        width: "100%",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐍</div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
          ViperGuard
        </h1>
        <p style={{ color: "#99AAB5", fontSize: 14, marginBottom: 32 }}>
          Staff Dashboard — Login with your Discord account to continue.
        </p>

        {/* Clicking this sends the user to Discord to log in */}
        <a
          href={`${apiUrl}/auth/discord`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "#5865F2",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          <svg width="22" height="16" viewBox="0 0 127 96" fill="white">
            <path d="M107.7 8.07A105.2 105.2 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/>
          </svg>
          Login with Discord
        </a>

        <p style={{ color: "#555", fontSize: 12, marginTop: 20 }}>
          Only authorized staff members can access this panel.
        </p>
      </div>
    </div>
  );
}
