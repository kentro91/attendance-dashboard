"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { requireAuthOrRedirect } from "../../lib/auth";
import { formatDateTime, todayISODate } from "../../lib/format";

type AttendanceRecord = {
  organization_id: string;
  user_id: string;
  day: string;

  check_in_ts: string | null;
  check_out_ts: string | null;

  last_status: string;
  last_ts: string;

  full_name: string | null;
  user_type: string | null;
  role: string | null;
  score: number | null;
};

function formatDuration(checkInIso: string | null, checkOutIso: string | null) {
  if (!checkInIso || !checkOutIso) return "";
  const a = new Date(checkInIso).getTime();
  const b = new Date(checkOutIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return "";
  const diffMs = Math.max(0, b - a);
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs <= 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function badgeStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  if (s === "present") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid #bbf7d0",
      background: "#f0fdf4",
      color: "#166534",
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
    };
  }
  if (s === "checkout") {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid #bae6fd",
      background: "#f0f9ff",
      color: "#075985",
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
    };
  }
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

export default function TodayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const day = useMemo(() => todayISODate(), []);

  const total = rows.length;
  const checkedIn = rows.filter((r) => !!r.check_in_ts).length;
  const checkedOut = rows.filter((r) => !!r.check_out_ts).length;

  async function load() {
    setLoading(true);
    setError(null);

    const session = await requireAuthOrRedirect(router.replace);
    if (!session) return;

    const { data, error } = await supabase
      .from("attendance_records")
      .select(
        "organization_id,user_id,day,check_in_ts,check_out_ts,last_status,last_ts,full_name,user_type,role,score"
      )
      .eq("day", day)
      .order("last_ts", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as AttendanceRecord[]);
    }
    setLoading(false);
  }

  async function deleteRecord(r: AttendanceRecord) {
    const label = r.full_name ? `${r.full_name} (${r.user_id})` : `User ${r.user_id}`;
    const ok = confirm(`Delete today's attendance record for ${label}?`);
    if (!ok) return;

    const key = `${r.organization_id}|${r.user_id}|${r.day}`;
    setBusyKey(key);

    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("organization_id", r.organization_id)
      .eq("user_id", r.user_id)
      .eq("day", r.day);

    setBusyKey(null);

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

  const actions: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
  };

  const btn: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    color: "#0f172a",
  };

  const primaryBtn: React.CSSProperties = {
    ...btn,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
  };

  const statWrap: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    background: "#fcfdff",
  };

  const stat: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    padding: 12,
  };

  const statLabel: React.CSSProperties = { fontSize: 12, color: "#64748b", margin: 0 };
  const statValue: React.CSSProperties = { fontSize: 18, fontWeight: 900, margin: "6px 0 0 0" };

  const errorBox: React.CSSProperties = {
    marginTop: 12,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
  };

  const tableWrap: React.CSSProperties = { overflowX: "auto" };

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
              <div style={{ fontSize: 12, color: "#64748b" }}>Today’s activity • {day}</div>
            </div>
          </div>

          <div style={nav}>
            <Link href="/today" style={{ ...navLink, background: "#eef2ff", borderColor: "#e0e7ff" }}>
              Today
            </Link>
            <Link href="/history" style={navLink}>
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
              <h2 style={title}>Today Attendance</h2>
              <p style={sub}>Check-in/check-out times and latest status for {day}.</p>
            </div>

            <div style={actions}>
              <button onClick={load} style={btn}>
                Refresh
              </button>
              <Link href="/history" style={{ ...primaryBtn, textDecoration: "none" }}>
                View history
              </Link>
            </div>
          </div>

          <div style={statWrap}>
            <div style={stat}>
              <p style={statLabel}>Total records</p>
              <p style={statValue}>{total}</p>
            </div>
            <div style={stat}>
              <p style={statLabel}>Checked in</p>
              <p style={statValue}>{checkedIn}</p>
            </div>
            <div style={stat}>
              <p style={statLabel}>Checked out</p>
              <p style={statValue}>{checkedOut}</p>
            </div>
          </div>

          {error && <div style={errorBox}>{error}</div>}
          {loading && <div style={ghost}>Loading today’s records…</div>}

          {!loading && !error && (
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>User ID</th>
                    <th style={th}>Check-in</th>
                    <th style={th}>Check-out</th>
                    <th style={th}>Duration</th>
                    <th style={th}>Last status</th>
                    <th style={th}>Last time</th>
                    <th style={th}>Role</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const key = `${r.organization_id}|${r.user_id}|${r.day}`;
                    const isBusy = busyKey === key;

                    return (
                      <tr key={`${r.user_id}-${idx}`}>
                        <td style={{ ...td, fontWeight: 700 }}>{r.full_name ?? ""}</td>
                        <td style={td}>{r.user_id}</td>
                        <td style={td}>{formatDateTime(r.check_in_ts)}</td>
                        <td style={td}>{formatDateTime(r.check_out_ts)}</td>
                        <td style={td}>{formatDuration(r.check_in_ts, r.check_out_ts)}</td>
                        <td style={td}>
                          <span style={badgeStyle(r.last_status)}>{r.last_status || "unknown"}</span>
                        </td>
                        <td style={td}>{formatDateTime(r.last_ts)}</td>
                        <td style={td}>{r.role ?? ""}</td>
                        <td style={td}>
                          <button
                            onClick={() => deleteRecord(r)}
                            disabled={isBusy}
                            style={{ ...deleteBtn, opacity: isBusy ? 0.7 : 1 }}
                            title="Delete daily record"
                          >
                            {isBusy ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} style={ghost}>
                        No attendance records for today yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                RLS security is active — users can only see data from their organization.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
