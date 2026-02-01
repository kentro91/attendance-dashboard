"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const styles = useMemo(() => {
    return {
      page: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background:
          "radial-gradient(1200px 600px at 20% 10%, #eef2ff 0%, transparent 55%), radial-gradient(900px 500px at 90% 30%, #ecfeff 0%, transparent 60%), #f8fafc",
      } as React.CSSProperties,

      shell: {
        width: "100%",
        maxWidth: 980,
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: 18,
        alignItems: "stretch",
      } as React.CSSProperties,

      left: {
        borderRadius: 16,
        padding: 28,
        background: "linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%)",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
      } as React.CSSProperties,

      glow: {
        position: "absolute",
        inset: -120,
        background:
          "radial-gradient(closest-side, rgba(59,130,246,0.28), transparent 60%), radial-gradient(closest-side, rgba(16,185,129,0.22), transparent 55%)",
        filter: "blur(20px)",
        pointerEvents: "none",
      } as React.CSSProperties,

      brand: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative",
      } as React.CSSProperties,

      logo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        fontWeight: 800,
        letterSpacing: 0.5,
      } as React.CSSProperties,

      h1: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.1,
      } as React.CSSProperties,

      sub: {
        margin: "4px 0 0 0",
        fontSize: 13,
        opacity: 0.8,
      } as React.CSSProperties,

      leftBody: {
        marginTop: 18,
        position: "relative",
      } as React.CSSProperties,

      bigTitle: {
        margin: "10px 0 8px 0",
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: -0.3,
      } as React.CSSProperties,

      bullet: {
        margin: "14px 0 0 0",
        paddingLeft: 18,
        lineHeight: 1.7,
        opacity: 0.9,
        fontSize: 14,
      } as React.CSSProperties,

      right: {
        borderRadius: 16,
        padding: 24,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 18px 40px rgba(2,6,23,0.08)",
      } as React.CSSProperties,

      rightTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: -0.2,
        color: "#0f172a",
      } as React.CSSProperties,

      rightSubtitle: {
        margin: "8px 0 0 0",
        color: "#475569",
        fontSize: 13,
      } as React.CSSProperties,

      form: {
        marginTop: 16,
        display: "grid",
        gap: 12,
      } as React.CSSProperties,

      label: {
        display: "grid",
        gap: 6,
        color: "#0f172a",
        fontSize: 13,
        fontWeight: 600,
      } as React.CSSProperties,

      input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: 14,
        background: "#fff",
      } as React.CSSProperties,

      row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 2,
      } as React.CSSProperties,

      checkboxRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#475569",
        fontSize: 12,
        userSelect: "none",
      } as React.CSSProperties,

      btn: {
        marginTop: 6,
        padding: "11px 12px",
        borderRadius: 10,
        border: "1px solid #0f172a",
        background: "#0f172a",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 14,
      } as React.CSSProperties,

      btnDisabled: {
        opacity: 0.7,
        cursor: "not-allowed",
      } as React.CSSProperties,

      linkBtn: {
        border: "none",
        background: "transparent",
        color: "#0f172a",
        cursor: "pointer",
        padding: 0,
        fontSize: 12,
        textDecoration: "underline",
      } as React.CSSProperties,

      errorBox: {
        background: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#9f1239",
        padding: "10px 12px",
        borderRadius: 10,
        fontSize: 13,
        lineHeight: 1.4,
      } as React.CSSProperties,

      footer: {
        marginTop: 14,
        textAlign: "center",
        fontSize: 12,
        color: "#64748b",
      } as React.CSSProperties,

      responsive: {
        gridTemplateColumns: "1fr",
      } as React.CSSProperties,

      rightSlotSpacerBtn: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid transparent",
        background: "transparent",
        color: "transparent",
        cursor: "default",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
      } as React.CSSProperties,

      rightSlotBtn: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
        color: "#0f172a",
        whiteSpace: "nowrap",
      } as React.CSSProperties,
    };
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);

    if (error) {
      const text =
        error.message.toLowerCase().includes("invalid") ||
        error.message.toLowerCase().includes("credentials")
          ? "Invalid email or password. Please try again."
          : error.message;

      setMsg(text);
      return;
    }

    router.replace("/today");
  }

  function onForgotPassword() {
    alert(
      "Password reset is not enabled in this minimal dashboard yet.\n\nAsk the system administrator to reset your password in Supabase Authentication → Users."
    );
  }

  const isNarrow =
    typeof window !== "undefined" ? window.matchMedia("(max-width: 860px)").matches : false;

  return (
    <div style={styles.page}>
      <div style={{ ...styles.shell, ...(isNarrow ? styles.responsive : {}) }}>
        {/* Left brand panel */}
        <div style={styles.left}>
          <div style={styles.glow} />
          <div style={styles.brand}>
            <div style={styles.logo}>NGT</div>
            <div>
              <p style={styles.h1}>Nextrogenesis Attendance</p>
              <p style={styles.sub}>Secure multi-organization reporting dashboard</p>
            </div>
          </div>

          <div style={styles.leftBody}>
            <div style={styles.bigTitle}>Welcome back 👋</div>
            <div style={{ opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
              Sign in to view today’s attendance, check-in/check-out times, and full event history.
            </div>

            <ul style={styles.bullet}>
              <li>Organization-level access (RLS protected)</li>
              <li>Real-time data from your webhook receiver</li>
              <li>Audit trail & downloadable records</li>
            </ul>

            <div style={{ marginTop: 18, opacity: 0.75, fontSize: 12 }}>
              Need access? Contact your administrator to create your account.
            </div>
          </div>
        </div>

        {/* Right login card */}
        <div style={styles.right}>
          <h2 style={styles.rightTitle}>Sign in</h2>
          <p style={styles.rightSubtitle}>Use your assigned email and password to continue.</p>

          <form onSubmit={onLogin} style={styles.form}>
            {/* ✅ Email row now matches Password row width by reserving a right-side slot */}
            <label style={styles.label}>
              Email address
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@organization.com"
                  autoComplete="email"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={styles.rightSlotSpacerBtn}
                >
                  Show
                </button>
              </div>
            </label>

            <label style={styles.label}>
              Password
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={styles.rightSlotBtn}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div style={styles.row}>
              <label style={styles.checkboxRow}>
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button" onClick={onForgotPassword} style={styles.linkBtn}>
                Forgot password?
              </button>
            </div>

            <button disabled={busy} style={{ ...styles.btn, ...(busy ? styles.btnDisabled : {}) }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>

            {msg && <div style={styles.errorBox}>{msg}</div>}

            <div style={styles.footer}>
              © {new Date().getFullYear()} Nextrogenesis Technologies Limited
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
