import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import MedalBadge from "../components/MedalBadge";
import { getFlag } from "../utils/flags";
import ConfirmModal from "../components/ConfirmModal";

const statusClass = s => ({
  OPEN: "badge-status-open",
  CLOSED: "badge-status-closed",
  PENDING: "badge-status-pending",
  COMPLETED: "badge-status-completed",
})[s] ?? "";

function fmt(v) { return v != null ? `${v}s` : "—"; }

const dnfBadge = <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>DNF</span>;
function parseErrors(err) {
  const data = err.response?.data;
  if (!data) return "An unexpected error occurred.";
  if (Array.isArray(data.messages) && data.messages.length > 0) return data.messages.join("\n");
  if (Array.isArray(data.errors)   && data.errors.length > 0)   return data.errors.join("\n");
  if (data.message) return data.message;
  return "An unexpected error occurred.";
}

function validateCompetition(form) {
  if (!form.name.trim()) return "Competition name is required.";
  if (form.name.trim().length < 3) return "Competition name must be at least 3 characters.";
  if (!form.minAge || Number(form.minAge) < 10) return "Minimum age must be at least 10.";
  if (Number(form.minAge) > 100) return "Minimum age cannot exceed 100.";
  if (!form.competitionDate) return "Competition date is required.";
  const d = new Date(form.competitionDate);
  const today = new Date(); today.setHours(0,0,0,0);
  if (d < today) return "Competition date must be today or in the future.";
  return null;
}



// ── Create Competition Modal ──────────────────────────────────────────────
function CreateCompModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", type: "SLALOM", gender: "MALE", minAge: 18, competitionDate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    const validationError = validateCompetition(form);
    if (validationError) { setError(validationError); return; }
    setError(""); setLoading(true);
    try {
      await apiClient.post("/competitions", { ...form, minAge: Number(form.minAge) });
      onSaved();
    } catch (err) { setError(parseErrors(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>New Competition</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="msg msg-error" style={{ whiteSpace: "pre-line" }}>{error}</div>}
          <form className="modal-form" onSubmit={submit}>
            <div className="form-grid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Name</label>
                <input className="input" name="name" value={form.name} onChange={handle} required placeholder="Men's Slalom 2026" />
              </div>
              <div className="field">
                <label>Type</label>
                <select className="select" name="type" value={form.type} onChange={handle}>
                  <option value="SLALOM">Slalom</option>
                  <option value="BIATHLON">Biathlon</option>
                </select>
              </div>
              <div className="field">
                <label>Gender</label>
                <select className="select" name="gender" value={form.gender} onChange={handle}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div className="field">
                <label>Min Age</label>
                <input className="input" name="minAge" type="number" min="1" value={form.minAge} onChange={handle} required />
              </div>
              <div className="field">
                <label>Date</label>
                <input className="input" name="competitionDate" type="date" value={form.competitionDate} onChange={handle} required />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Slalom Panel ──────────────────────────────────────────────────────────
function SlalomPanel({ comp, isAdmin }) {
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [fr, setFr] = useState({ athleteId: "", firstRunTime: "", didNotFinish: false });
  const [sr, setSr] = useState({ athleteId: "", secondRunTime: "", didNotFinish: false });
  const [qual, setQual] = useState({ topN: 30 });

  const m = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  useEffect(() => { loadResults(); loadRanking(); }, [comp.id]);

  const loadResults = async () => {
    try { const r = await apiClient.get(`/competitions/${comp.id}/slalom/results`); setResults(r.data); } catch {}
  };
  const loadRanking = async () => {
    try { const r = await apiClient.get(`/competitions/${comp.id}/slalom/ranking`); setRanking(r.data); } catch {}
  };

  const enterFirst = async e => {
    e.preventDefault();
    try {
      await apiClient.post(`/competitions/${comp.id}/slalom/first-run`, {
        athleteId: Number(fr.athleteId),
        firstRunTime: fr.didNotFinish ? null : Number(fr.firstRunTime),
        didNotFinish: fr.didNotFinish,
      });
      m("success", "First run saved.");
      setFr({ athleteId: "", firstRunTime: "", didNotFinish: false });
      loadResults();
    } catch (err) { m("error", parseErrors(err)); }
  };

  const qualify = async e => {
    e.preventDefault();
    try {
      await apiClient.post(`/competitions/${comp.id}/slalom/qualify-second-run`, { topN: Number(qual.topN) });
      m("success", "Second-run start list generated."); loadResults();
    } catch (err) { m("error", parseErrors(err)); }
  };

  const enterSecond = async e => {
    e.preventDefault();
    try {
      await apiClient.post(`/competitions/${comp.id}/slalom/second-run`, {
        athleteId: Number(sr.athleteId),
        secondRunTime: sr.didNotFinish ? null : Number(sr.secondRunTime),
        didNotFinish: sr.didNotFinish,
      });
      m("success", "Second run saved.");
      setSr({ athleteId: "", secondRunTime: "", didNotFinish: false });
      loadResults();
    } catch (err) { m("error", parseErrors(err)); }
  };

  const calcRanking = async () => {
    try {
      await apiClient.post(`/competitions/${comp.id}/slalom/calculate-ranking`);
      m("success", "Ranking calculated!"); loadRanking();
    } catch (err) { m("error", parseErrors(err)); }
  };

  return (
    <div>
      {msg.text && <div className={`msg msg-${msg.type}`} style={{ whiteSpace: "pre-line" }}>{msg.text}</div>}
      <div className="tabs">
        {[
          { id: "results", label: "⛷️ Results" },
          { id: "ranking", label: "🏆 Ranking" },
          ...(isAdmin ? [{ id: "enter", label: "✏️ Enter Data" }] : []),
        ].map(t => (
          <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "results" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Athlete</th><th>Country</th><th>Run 1</th><th>Run 2</th><th>Total</th><th>Qualified</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>No results yet</td></tr>}
                {results.map(r => (
                  <tr key={r.id}>
                    <td className="text-white">{r.athleteFullName}</td>
                    <td className="text-muted">{getFlag(r.country)} {r.country}</td>
                    <td>{r.didNotFinishFirstRun  ? dnfBadge : fmt(r.firstRunTime)}</td>
                    <td>{r.didNotFinishSecondRun ? dnfBadge : fmt(r.secondRunTime)}</td>
                    <td>{fmt(r.totalTime)}</td>
                    <td>{r.qualifiedForSecondRun ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ranking" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Athlete</th><th>Country</th><th>Total Time</th><th>Medal</th></tr></thead>
              <tbody>
                {ranking.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>No ranking yet</td></tr>}
                {ranking.map(r => (
                  <tr key={r.id} className={r.rankPosition <= 3 ? `rank-${r.rankPosition}` : ""}>
                    <td className={`td-rank${r.rankPosition <= 3 ? ` top${r.rankPosition}` : ""}`}>{r.rankPosition ?? "—"}</td>
                    <td className="text-white">{r.athleteFullName}</td>
                    <td className="text-muted">{getFlag(r.country)} {r.country}</td>
                    <td>{fmt(r.totalTime)}</td>
                    <td><MedalBadge medal={r.medal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isAdmin && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
              <button className="btn btn-primary btn-sm" onClick={calcRanking}>Calculate Ranking</button>
            </div>
          )}
        </div>
      )}

      {tab === "enter" && isAdmin && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="card-header"><h3>Enter First Run</h3></div>
            <div className="card-body">
              <form onSubmit={enterFirst} className="form-grid">
                <div className="field">
                  <label>Athlete ID</label>
                  <input className="input" type="number" value={fr.athleteId} onChange={e => setFr({ ...fr, athleteId: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Time (seconds)</label>
                  <input className="input" type="number" step="0.001" placeholder="e.g. 58.423" value={fr.firstRunTime} onChange={e => setFr({ ...fr, firstRunTime: e.target.value })} disabled={fr.didNotFinish} />
                </div>
                <div className="field" style={{ justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={fr.didNotFinish} onChange={e => setFr({ ...fr, didNotFinish: e.target.checked })} />
                    Did Not Finish
                  </label>
                  <button type="submit" className="btn btn-primary mt-8">Save First Run</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Generate Second-Run Start List</h3></div>
            <div className="card-body">
              <form onSubmit={qualify} className="form-grid">
                <div className="field">
                  <label>Top N qualifiers</label>
                  <input className="input" type="number" min="1" value={qual.topN} onChange={e => setQual({ topN: e.target.value })} required />
                </div>
                <div className="field" style={{ justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary mt-8">Generate Start List</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Enter Second Run</h3></div>
            <div className="card-body">
              <form onSubmit={enterSecond} className="form-grid">
                <div className="field">
                  <label>Athlete ID</label>
                  <input className="input" type="number" value={sr.athleteId} onChange={e => setSr({ ...sr, athleteId: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Time (seconds)</label>
                  <input className="input" type="number" step="0.001" placeholder="e.g. 55.180" value={sr.secondRunTime} onChange={e => setSr({ ...sr, secondRunTime: e.target.value })} disabled={sr.didNotFinish} />
                </div>
                <div className="field" style={{ justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="checkbox" checked={sr.didNotFinish} onChange={e => setSr({ ...sr, didNotFinish: e.target.checked })} />
                    Did Not Finish
                  </label>
                  <button type="submit" className="btn btn-primary mt-8">Save Second Run</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Biathlon Panel ────────────────────────────────────────────────────────
function BiathlonPanel({ comp, isAdmin }) {
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({ athleteId: "", skiTime: "", missedShots: 0, didNotFinish: false });

  const m = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  useEffect(() => { loadResults(); loadRanking(); }, [comp.id]);

  const loadResults = async () => {
    try { const r = await apiClient.get(`/competitions/${comp.id}/biathlon/results`); setResults(r.data); } catch {}
  };
  const loadRanking = async () => {
    try { const r = await apiClient.get(`/competitions/${comp.id}/biathlon/ranking`); setRanking(r.data); } catch {}
  };

  const enterResult = async e => {
    e.preventDefault();
    try {
      await apiClient.post(`/competitions/${comp.id}/biathlon/results`, {
        athleteId: Number(form.athleteId),
        skiTime: form.didNotFinish ? null : Number(form.skiTime),
        missedShots: Number(form.missedShots),
        didNotFinish: form.didNotFinish,
      });
      m("success", "Result saved.");
      setForm({ athleteId: "", skiTime: "", missedShots: 0, didNotFinish: false });
      loadResults();
    } catch (err) { m("error", parseErrors(err)); }
  };

  const calcRanking = async () => {
    try {
      await apiClient.post(`/competitions/${comp.id}/biathlon/calculate-ranking`);
      m("success", "Ranking calculated!"); loadRanking();
    } catch (err) { m("error", parseErrors(err)); }
  };

  return (
    <div>
      {msg.text && <div className={`msg msg-${msg.type}`} style={{ whiteSpace: "pre-line" }}>{msg.text}</div>}
      <div className="tabs">
        {[
          { id: "results",  label: "🎿 Results" },
          { id: "ranking",  label: "🏆 Ranking" },
          ...(isAdmin ? [{ id: "enter", label: "✏️ Enter Data" }] : []),
        ].map(t => (
          <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "results" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Athlete</th><th>Country</th><th>Ski Time</th><th>Missed</th><th>Penalty</th><th>Final</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>No results yet</td></tr>}
                {results.map(r => (
                  <tr key={r.id}>
                    <td className="text-white">{r.athleteFullName}</td>
                    <td className="text-muted">{getFlag(r.country)} {r.country}</td>
                    <td>{r.didNotFinish ? dnfBadge : fmt(r.skiTime)}</td>
                    <td style={{ color: r.missedShots > 0 ? "#fca5a5" : "var(--text)" }}>{r.missedShots} 🎯</td>
                    <td style={{ color: r.penaltySeconds > 0 ? "#fbbf24" : "var(--muted)" }}>+{fmt(r.penaltySeconds)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(r.finalTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ranking" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Athlete</th><th>Country</th><th>Final Time</th><th>Medal</th></tr></thead>
              <tbody>
                {ranking.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>No ranking yet</td></tr>}
                {ranking.map(r => (
                  <tr key={r.id} className={r.rankPosition <= 3 ? `rank-${r.rankPosition}` : ""}>
                    <td className={`td-rank${r.rankPosition <= 3 ? ` top${r.rankPosition}` : ""}`}>{r.rankPosition ?? "—"}</td>
                    <td className="text-white">{r.athleteFullName}</td>
                    <td className="text-muted">{getFlag(r.country)} {r.country}</td>
                    <td>{fmt(r.finalTime)}</td>
                    <td><MedalBadge medal={r.medal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isAdmin && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
              <button className="btn btn-primary btn-sm" onClick={calcRanking}>Calculate Ranking</button>
            </div>
          )}
        </div>
      )}

      {tab === "enter" && isAdmin && (
        <div className="card">
          <div className="card-header"><h3>Enter Biathlon Result</h3></div>
          <div className="card-body">
            <form onSubmit={enterResult} className="form-grid">
              <div className="field">
                <label>Athlete ID</label>
                <input className="input" type="number" value={form.athleteId} onChange={e => setForm({ ...form, athleteId: e.target.value })} required />
              </div>
              <div className="field">
                <label>Ski Time (s)</label>
                <input className="input" type="number" step="0.001" placeholder="e.g. 1823.500" value={form.skiTime} onChange={e => setForm({ ...form, skiTime: e.target.value })} disabled={form.didNotFinish} />
              </div>
              <div className="field">
                <label>Missed Shots</label>
                <input className="input" type="number" min="0" value={form.missedShots} onChange={e => setForm({ ...form, missedShots: e.target.value })} />
              </div>
              <div className="field" style={{ justifyContent: "flex-end" }}>
                <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.didNotFinish} onChange={e => setForm({ ...form, didNotFinish: e.target.checked })} />
                  Did Not Finish
                </label>
                <button type="submit" className="btn btn-primary mt-8">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Registration Panel ────────────────────────────────────────────────────
function RegistrationPanel({ comp, isAuthenticated }) {
  const [registrations, setRegistrations] = useState([]);
  const [athleteId, setAthleteId] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => { load(); }, [comp.id]);

  const load = async () => {
    try { const r = await apiClient.get(`/competitions/${comp.id}/registrations`); setRegistrations(r.data); } catch {}
  };

  const register = async e => {
    e.preventDefault();
    try {
      await apiClient.post(`/competitions/${comp.id}/registrations/${athleteId}`);
      setMsg({ type: "success", text: "Registered!" }); setAthleteId(""); load();
    } catch (err) { setMsg({ type: "error", text: parseErrors(err) }); }
  };

  const unregister = async (aId) => {
    try {
      await apiClient.delete(`/competitions/${comp.id}/registrations/${aId}`);
      setMsg({ type: "success", text: "Unregistered." }); load();
    } catch { setMsg({ type: "error", text: "Error." }); }
  };

  return (
    <div>
      {msg.text && <div className={`msg msg-${msg.type}`} style={{ whiteSpace: "pre-line" }}>{msg.text}</div>}
      {isAuthenticated && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-body">
            <form onSubmit={register} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Athlete ID to register</label>
                <input className="input" type="number" value={athleteId} onChange={e => setAthleteId(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">Register</button>
            </form>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-header"><h3>Registered Athletes ({registrations.length})</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Athlete</th><th>Country</th><th>Gender</th>
              {isAuthenticated && <th></th>}
            </tr></thead>
            <tbody>
              {registrations.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>No athletes registered yet</td></tr>}
              {registrations.map(r => (
                <tr key={r.id}>
                  <td className="text-white">{r.athleteFullName}</td>
                  <td className="text-muted">{getFlag(r.country)} {r.country}</td>
                  <td><span className={`badge badge-${r.gender?.toLowerCase()}`}>{r.gender}</span></td>
                  {isAuthenticated && <td><button className="btn btn-danger btn-sm" onClick={() => unregister(r.athleteId)}>Remove</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function CompetitionsPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("results");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [confirmComp, setConfirmComp] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await apiClient.get("/competitions"); setCompetitions(r.data); }
    catch { setError("Failed to load competitions."); }
  };

  const handleDelete = (comp, e) => {
    e.stopPropagation();
    setConfirmComp(comp);
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`/competitions/${confirmComp.id}`);
      if (selected?.id === confirmComp.id) setSelected(null);
      setConfirmComp(null);
      load();
    } catch { setError("Failed to delete competition."); setConfirmComp(null); }
  };

  const select = comp => { setSelected(comp); setActiveTab("results"); };

  return (
    <div>
      {confirmComp && (
        <ConfirmModal
          title="Delete Competition"
          message={`Are you sure you want to delete "${confirmComp.name}"? All results and registrations will be permanently lost.`}
          confirmLabel="Delete Competition"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmComp(null)}
        />
      )}
      {showCreate && <CreateCompModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />}

      <div className="page-head">
        <div>
          <span className="section-label">Events</span>
          <h1 className="page-title">Competitions</h1>
          <p className="page-subtitle">Ski Slalom and Biathlon events at the 2026 Winter Games.</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Competition</button>}
      </div>

      {error && <div className="msg msg-error" style={{ whiteSpace: "pre-line" }}>{error}</div>}

      <div className="grid-2">
        {competitions.length === 0 && (
          <div className="empty" style={{ gridColumn: "1/-1" }}>
            <div className="empty-icon">🏔️</div>No competitions yet.
          </div>
        )}
        {competitions.map(c => (
          <div
            key={c.id}
            className="card card-padded comp-card"
            style={selected?.id === c.id ? { borderColor: "var(--blue)", boxShadow: "var(--glow)" } : {}}
            onClick={() => select(c)}
          >
            <div className="comp-card-top">
              <span className={`badge badge-${c.type?.toLowerCase()}`}>{c.type}</span>
              <span className={`badge ${statusClass(c.status)}`}>{c.status?.replaceAll("_", " ")}</span>
              <span className={`badge badge-${c.gender?.toLowerCase()}`}>{c.gender}</span>
            </div>
            <div className="comp-card-name">{c.name}</div>
            <div className="comp-card-meta">
              <div className="comp-meta-row"><strong>Date:</strong> {c.competitionDate}</div>
              <div className="comp-meta-row"><strong>Min Age:</strong> {c.minAge}</div>
            </div>
            <div className="comp-card-actions">
              <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); select(c); }}>
                View Details →
              </button>
              {isAdmin && <button className="btn btn-danger btn-sm" onClick={e => handleDelete(c, e)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="section-gap">
          <div className="flex-between" style={{ marginBottom: "20px" }}>
            <div>
              <span className="section-label">{selected.type} · {selected.gender}</span>
              <h2 className="page-title" style={{ fontSize: "32px" }}>{selected.name}</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
          </div>

          <div className="tabs">
            {[
              { id: "results",       label: selected.type === "SLALOM" ? "⛷️ Race" : "🎿 Race" },
              { id: "registrations", label: "📋 Athletes" },
            ].map(t => (
              <button key={t.id} className={`tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "results" && selected.type === "SLALOM"   && <SlalomPanel   comp={selected} isAdmin={isAdmin} />}
          {activeTab === "results" && selected.type === "BIATHLON" && <BiathlonPanel comp={selected} isAdmin={isAdmin} />}
          {activeTab === "registrations" && <RegistrationPanel comp={selected} isAuthenticated={isAuthenticated} />}
        </div>
      )}
    </div>
  );
}