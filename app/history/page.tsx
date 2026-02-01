"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { requireAuthOrRedirect } from "../../lib/auth";
import { formatDateTime, todayISODate } from "../../lib/format";

type AttendanceEvent = {
  id: number;
  organization_id: string;
  user_id: string;
  event_type: string;
  status: string;
  score: number | null;
  full_name: string | null;
  user_type: string | null;
  role: string | null;
  event_ts: string;
  received_at: string;
};

function badgeStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  if (s === "present") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid #bbf7d0",
      background: "#f0fdf4",
      color: "#166534",
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: "nowrap",
    };
  }
  if (s === "checkout") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid #bae6fd",
      background: "#f0f9ff",
      color: "#075985",
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: "nowrap",
    };
  }
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttendanceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState(todayISODate());
  const [toDate, setToDate] = useState(todayISODate());
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");

  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const session = await requireAuthOrRedirect(router.replace);
    if (!session) return;

    const fromISO = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
    const toISO = new Date(`${toDate}T23:59:59.999Z`).toISOString();

    let q = supabase
      .from("attendance_events")
      .select("*")
      .gte("event_ts", fromISO)
      .lte("event_ts", toISO)
      .order("event_ts", { ascending: false })
      .limit(500);

    if (status.trim()) q = q.eq("status", status.trim());
    if (userId.trim()) q = q.eq("user_id", userId.trim());

    const { data, error } = await q;

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as AttendanceEvent[]);
    }
    setLoading(false);
  }

  async function deleteEvent(ev: AttendanceEvent) {
    const label = ev.full_name ? `${ev.full_name} (${ev.user_id})` : `User ${ev.user_id}`;
    const ok = confirm(`Delete this event for ${label} at ${formatDateTime(ev.event_ts)}?`);
    if (!ok) return;

    setBusyId(ev.id);

    const { error } = await supabase.from("attendance_events").delete().eq("id", ev.id);

    setBusyId(null);

    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }

    await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f8fafc",
    paddingBottom: 30,
  };

  const container: React.CSSProperties = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "18px 14px",
  };

  const topbar: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(2,6,23,0.06)",
  };

  const brand: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const logo: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#0f172a",
    background: "#eef2ff",
    border: "1px solid #e0e7ff",
  };

  const nav: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
  };

  const navLink: React.CSSProperties = {
    textDecoration: "none",
    color: "#0f172a",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  const card: React.CSSProperties = {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(2,6,23,0.06)",
    overflow: "hidden",
  };

  const cardHeader: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  };

  const title: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
  };

  const sub: React.CSSProperties = {
    margin: "4px 0 0 0",
    fontSize: 13,
    color: "#64748b",
  };

  const toolbar: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "end",
    background: "#fcfdff",
  };

  const label: React.CSSProperties = {
    display: "grid",
    gap: 6,
    fontSize: 12,
    color: "#475569",
    fontWeight: 700,
  };

  const input: React.CSSProperties = {
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    outline: "none",
    background: "#fff",
    minWidth: 160,
  };

  const btn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  };

  const errorBox: React.CSSProperties = {
    marginTop: 12,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
  };

  const th: React.CSSProperties = {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 12px",
    fontSize: 12,
    color: "#475569",
    background: "#ffffff",
    whiteSpace: "nowrap",
  };

  const td: React.CSSProperties = {
    padding: "12px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#0f172a",
    whiteSpace: "nowrap",
  };

  const ghost: React.CSSProperties = {
    padding: "18px 16px",
    color: "#64748b",
    fontSize: 14,
  };

  const deleteBtn: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid #fecdd3",
    background: "#fff1f2",
    color: "#9f1239",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  };

  const summaryText = useMemo(() => {
    const parts = [];
    if (status.trim()) parts.push(`status = ${status.trim()}`);
    if (userId.trim()) parts.push(`user_id = ${userId.trim()}`);
    if (!parts.length) return "All events (filtered by your organization via RLS).";
    return `Filters: ${parts.join(", ")} (RLS still applies).`;
  }, [status, userId]);

  return (
    <div style={page}>
      <div style={container}>
        <div style={topbar}>
          <div style={brand}>
            <div style={logo}>NGT</div>
            <div>
              <div style={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                Attendance Dashboard
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>History & audit trail</div>
            </div>
          </div>

          <div style={nav}>
            <Link href="/today" style={navLink}>
              Today
            </Link>
            <Link href="/history" style={{ ...navLink, background: "#eef2ff", borderColor: "#e0e7ff" }}>
              History
            </Link>
            <Link href="/logout" style={navLink}>
              Logout
            </Link>
          </div>
        </div>

        <div style={card}>
          <div style={cardHeader}>
            <div>
              <h2 style={title}>Attendance History</h2>
              <p style={sub}>
                View audit events and filter by date, status, or user ID.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={load} style={secondaryBtn}>
                Refresh
              </button>
              <Link href="/today" style={{ ...btn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                Back to Today
              </Link>
            </div>
          </div>

          <div style={toolbar}>
            <label style={label}>
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={input}
              />
            </label>

            <label style={label}>
              To
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={input}
              />
            </label>

            <label style={label}>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={input}
              >
                <option value="">All</option>
                <option value="present">present</option>
                <option value="checkout">checkout</option>
              </select>
            </label>

            <label style={label}>
              User ID
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 38"
                style={input}
              />
            </label>

            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <button onClick={load} style={btn}>
                Apply filters
              </button>
            </div>

            <div style={{ width: "100%", fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {summaryText}
            </div>
          </div>

          {error && <div style={errorBox}>{error}</div>}
          {loading && <div style={ghost}>Loading events…</div>}

          {!loading && !error && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Time</th>
                    <th style={th}>Name</th>
                    <th style={th}>User ID</th>
                    <th style={th}>Status</th>
                    <th style={th}>Role</th>
                    <th style={th}>Score</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isBusy = busyId === r.id;
                    return (
                      <tr key={r.id}>
                        <td style={td}>{formatDateTime(r.event_ts)}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{r.full_name ?? ""}</td>
                        <td style={td}>{r.user_id}</td>
                        <td style={td}>
                          <span style={badgeStyle(r.status)}>{r.status}</span>
                        </td>
                        <td style={td}>{r.role ?? ""}</td>
                        <td style={td}>{r.score ?? ""}</td>
                        <td style={td}>
                          <button
                            onClick={() => deleteEvent(r)}
                            disabled={isBusy}
                            style={{ ...deleteBtn, opacity: isBusy ? 0.7 : 1 }}
                            title="Delete event"
                          >
                            {isBusy ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={ghost}>
                        No events found for that filter range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                Showing up to 500 events. RLS security is active.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
