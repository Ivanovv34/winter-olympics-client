import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { getFlag } from "../utils/flags";
import { medalBadgeStyle } from "../utils/medals";
import MedalBadge from "../components/MedalBadge";

function calcAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fmt(v) { return v != null ? `${v}s` : "—"; }

export default function AthleteProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState(null);
  const [slalomResults, setSlalomResults] = useState([]);
  const [biathlonResults, setBiathlonResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [athleteRes, compsRes] = await Promise.all([
        apiClient.get(`/athletes/${id}`),
        apiClient.get("/competitions"),
      ]);
      setAthlete(athleteRes.data);

      const slalom = [];
      const biathlon = [];

      await Promise.all(compsRes.data.map(async comp => {
        try {
          if (comp.type === "SLALOM") {
            const r = await apiClient.get(`/competitions/${comp.id}/slalom/results`);
            slalom.push(...r.data.filter(x => x.athleteId === Number(id)));
          } else if (comp.type === "BIATHLON") {
            const r = await apiClient.get(`/competitions/${comp.id}/biathlon/results`);
            biathlon.push(...r.data.filter(x => x.athleteId === Number(id)));
          }
        } catch {}
      }));

      setSlalomResults(slalom);
      setBiathlonResults(biathlon);
    } catch {
      navigate("/athletes");
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="empty" style={{ marginTop: "80px" }}>
      <div className="empty-icon">⏳</div>Loading athlete profile…
    </div>
  );

  if (!athlete) return null;

  const initials = (a) => (a.firstName?.[0] ?? "") + (a.lastName?.[0] ?? "");
  const age = calcAge(athlete.birthDate);

  const allResults = [...slalomResults, ...biathlonResults];
  const medals = { GOLD: 0, SILVER: 0, BRONZE: 0 };
  allResults.forEach(r => { if (r.medal) medals[r.medal] = (medals[r.medal] || 0) + 1; });
  const totalMedals = medals.GOLD + medals.SILVER + medals.BRONZE;
  const finishedRaces = allResults.filter(r => !r.didNotFinish && !r.didNotFinishFirstRun).length;

  const dnfBadge = <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>DNF</span>;

  return (
    <div>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "24px" }} onClick={() => navigate("/athletes")}>
        ← Back to Athletes
      </button>

      {/* Profile header */}
      <div className="card card-padded anim-fade-up" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue), var(--frost))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--deep)",
            flexShrink: 0,
          }}>
            {initials(athlete)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span className={`badge badge-${athlete.gender?.toLowerCase()}`}>{athlete.gender}</span>
              {totalMedals > 0 && (
                <span className="badge" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                  🏅 {totalMedals} medal{totalMedals !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h1 className="page-title" style={{ fontSize: "40px", marginBottom: "4px" }}>
              {athlete.firstName} {athlete.lastName}
            </h1>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "8px" }}>
              <span style={{ color: "var(--muted)", fontSize: "15px" }}>
                {getFlag(athlete.country)} {athlete.country}
              </span>
              <span style={{ color: "var(--muted)", fontSize: "15px" }}>
                🎂 {athlete.birthDate} · {age} years old
              </span>
            </div>
          </div>

          {totalMedals > 0 && (
            <div style={{ display: "flex", gap: "16px" }}>
              {medals.GOLD   > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "28px" }}>🥇</div><div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--gold)" }}>{medals.GOLD}</div></div>}
              {medals.SILVER > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "28px" }}>🥈</div><div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--silver)" }}>{medals.SILVER}</div></div>}
              {medals.BRONZE > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "28px" }}>🥉</div><div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--bronze)" }}>{medals.BRONZE}</div></div>}
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4 anim-fade-up anim-delay-1" style={{ marginBottom: "24px" }}>
        <div className="card stat-card">
          <div className="stat-card-icon">🏁</div>
          <div className="stat-card-value">{allResults.length}</div>
          <div className="stat-card-label">Total Races</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">{finishedRaces}</div>
          <div className="stat-card-label">Finished</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">⛷️</div>
          <div className="stat-card-value">{slalomResults.length}</div>
          <div className="stat-card-label">Slalom Races</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🎿</div>
          <div className="stat-card-value">{biathlonResults.length}</div>
          <div className="stat-card-label">Biathlon Races</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs anim-fade-up anim-delay-2">
        <button className={`tab${tab === "overview"  ? " active" : ""}`} onClick={() => setTab("overview")}>📋 Overview</button>
        {slalomResults.length  > 0 && <button className={`tab${tab === "slalom"   ? " active" : ""}`} onClick={() => setTab("slalom")}>⛷️ Slalom</button>}
        {biathlonResults.length > 0 && <button className={`tab${tab === "biathlon" ? " active" : ""}`} onClick={() => setTab("biathlon")}>🎿 Biathlon</button>}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        allResults.length === 0
          ? <div className="empty"><div className="empty-icon">🏔️</div>No race results yet.</div>
          : (
            <div className="card anim-fade-up">
              <div className="card-header"><h3>All Results</h3></div>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Competition</th><th>Type</th><th>Rank</th><th>Time</th><th>Medal</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ...slalomResults.map(r => ({ ...r, _type: "SLALOM" })),
                      ...biathlonResults.map(r => ({ ...r, _type: "BIATHLON" })),
                    ]
                      .sort((a, b) => (a.competitionName ?? "").localeCompare(b.competitionName ?? ""))
                      .map(r => (
                        <tr key={`${r._type}-${r.id}`} className={r.rankPosition <= 3 ? `rank-${r.rankPosition}` : ""}>
                          <td className="text-white">{r.competitionName}</td>
                          <td><span className={`badge badge-${r._type.toLowerCase()}`}>{r._type}</span></td>
                          <td className={`td-rank${r.rankPosition <= 3 ? ` top${r.rankPosition}` : ""}`}>{r.rankPosition ?? "—"}</td>
                          <td>{r._type === "SLALOM" ? fmt(r.totalTime) : fmt(r.finalTime)}</td>
                          <td><MedalBadge medal={r.medal} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}

      {/* Slalom */}
      {tab === "slalom" && (
        <div className="card anim-fade-up">
          <div className="card-header"><h3>⛷️ Slalom Results</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Competition</th><th>Run 1</th><th>Run 2</th><th>Total</th><th>Rank</th><th>Medal</th>
              </tr></thead>
              <tbody>
                {slalomResults.map(r => (
                  <tr key={r.id} className={r.rankPosition <= 3 ? `rank-${r.rankPosition}` : ""}>
                    <td className="text-white">{r.competitionName}</td>
                    <td>{r.didNotFinishFirstRun  ? dnfBadge : fmt(r.firstRunTime)}</td>
                    <td>{r.didNotFinishSecondRun ? dnfBadge : fmt(r.secondRunTime)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(r.totalTime)}</td>
                    <td className={`td-rank${r.rankPosition <= 3 ? ` top${r.rankPosition}` : ""}`}>{r.rankPosition ?? "—"}</td>
                    <td><MedalBadge medal={r.medal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Biathlon */}
      {tab === "biathlon" && (
        <div className="card anim-fade-up">
          <div className="card-header"><h3>🎿 Biathlon Results</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Competition</th><th>Ski Time</th><th>Missed</th><th>Penalty</th><th>Final</th><th>Rank</th><th>Medal</th>
              </tr></thead>
              <tbody>
                {biathlonResults.map(r => (
                  <tr key={r.id} className={r.rankPosition <= 3 ? `rank-${r.rankPosition}` : ""}>
                    <td className="text-white">{r.competitionName}</td>
                    <td>{r.didNotFinish ? dnfBadge : fmt(r.skiTime)}</td>
                    <td style={{ color: r.missedShots > 0 ? "#fca5a5" : "var(--text)" }}>{r.missedShots} 🎯</td>
                    <td style={{ color: r.penaltySeconds > 0 ? "#fbbf24" : "var(--muted)" }}>+{fmt(r.penaltySeconds)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(r.finalTime)}</td>
                    <td className={`td-rank${r.rankPosition <= 3 ? ` top${r.rankPosition}` : ""}`}>{r.rankPosition ?? "—"}</td>
                    <td><MedalBadge medal={r.medal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}