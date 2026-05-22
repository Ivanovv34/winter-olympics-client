import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function StatisticsPage() {
  const [medals, setMedals] = useState([]);
  const [averageAge, setAverageAge] = useState(null);
  const [youngest, setYoungest] = useState(null);
  const [oldest, setOldest] = useState(null);
  const [loading, setLoading] = useState(true);

  function medalBadgeStyle(medal) {
  if (medal === "GOLD")   return { background: "rgba(251,191,36,0.15)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)"  };
  if (medal === "SILVER") return { background: "rgba(148,163,184,0.15)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.4)" };
  if (medal === "BRONZE") return { background: "rgba(180,83,9,0.2)",     color: "#d97706", border: "1px solid rgba(180,83,9,0.4)"    };
  return {};
}

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        apiClient.get("/statistics/medals-by-country"),
        apiClient.get("/statistics/average-age"),
      ]);
      setMedals(mRes.data);
      setAverageAge(aRes.data);
    } catch {}

    try { const r = await apiClient.get("/statistics/youngest-medalist"); setYoungest(r.data); } catch {}
    try { const r = await apiClient.get("/statistics/oldest-medalist");   setOldest(r.data);   } catch {}
    setLoading(false);
  };

  const total = medals.reduce((s, r) => s + r.totalMedals, 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="section-label">Olympic Overview</span>
          <h1 className="page-title">Statistics</h1>
          <p className="page-subtitle">Live medal table and athlete statistics.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4 anim-fade-up">
        <div className="card stat-card">
          <div className="stat-card-icon">🏅</div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Total Medals</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🌍</div>
          <div className="stat-card-value">{medals.length}</div>
          <div className="stat-card-label">Countries</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-value">{averageAge ? Number(averageAge.averageAge).toFixed(1) : "—"}</div>
          <div className="stat-card-label">Avg Age ({averageAge?.participantsCount ?? 0} athletes)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🥇</div>
          <div className="stat-card-value">{medals[0]?.country ?? "—"}</div>
          <div className="stat-card-label">Medal Leader</div>
        </div>
      </div>

      {/* Medalists */}
      <div className="grid-2 section-gap anim-fade-up anim-delay-1">
        <div className="card card-padded">
          <div className="section-label">🏃 Youngest Medalist</div>
          {youngest ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--white)", marginTop: "8px" }}>{youngest.athleteFullName}</div>
              <div className="text-muted text-sm mt-8">{youngest.country} · {youngest.competitionName}</div>
             <span className="badge" style={medalBadgeStyle(youngest.medal)}>{youngest.medal}</span>
            </>
          ) : <div className="text-muted mt-8">No medalists yet</div>}
        </div>

        <div className="card card-padded">
          <div className="section-label">🏆 Oldest Medalist</div>
          {oldest ? (
            <>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--white)", marginTop: "8px" }}>{oldest.athleteFullName}</div>
              <div className="text-muted text-sm mt-8">{oldest.country} · {oldest.competitionName}</div>
              <span className="badge" style={medalBadgeStyle(oldest.medal)}>{oldest.medal}</span>
            </>
          ) : <div className="text-muted mt-8">No medalists yet</div>}
        </div>
      </div>

      {/* Medal table */}
      <div className="card section-gap anim-fade-up anim-delay-2">
        <div className="card-header">
          <h3>🌍 Medal Table by Country</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Country</th>
                <th>🥇 Gold</th>
                <th>🥈 Silver</th>
                <th>🥉 Bronze</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>Loading…</td></tr>}
              {!loading && medals.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>No medals awarded yet</td></tr>
              )}
              {medals.map((row, i) => (
                <tr key={row.country} className={i < 3 ? `rank-${i + 1}` : ""}>
                  <td className={`td-rank${i < 3 ? ` top${i + 1}` : ""}`}>{i + 1}</td>
                  <td className="text-white" style={{ fontWeight: 700 }}>{row.country}</td>
                  <td style={{ color: "var(--gold)", fontWeight: 700 }}>{row.goldMedals}</td>
                  <td style={{ color: "var(--silver)", fontWeight: 700 }}>{row.silverMedals}</td>
                  <td style={{ color: "var(--bronze)", fontWeight: 700 }}>{row.bronzeMedals}</td>
                  <td style={{ fontWeight: 800 }}>{row.totalMedals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}