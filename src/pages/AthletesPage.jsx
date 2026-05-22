import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import { getFlag } from "../utils/flags";

const EMPTY_FORM = { firstName: "", lastName: "", country: "", gender: "MALE", birthDate: "" };

function AthleteModal({ athlete, onClose, onSaved }) {
  const [form, setForm] = useState(athlete
    ? { firstName: athlete.firstName, lastName: athlete.lastName, country: athlete.country, gender: athlete.gender, birthDate: athlete.birthDate }
    : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (athlete) await apiClient.put(`/athletes/${athlete.id}`, form);
      else await apiClient.post("/athletes", form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save athlete.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{athlete ? "Edit Athlete" : "Register Athlete"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="msg msg-error">{error}</div>}
          <form className="modal-form" onSubmit={submit}>
            <div className="form-grid">
              <div className="field">
                <label>First Name</label>
                <input className="input" name="firstName" value={form.firstName} onChange={handle} required />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input className="input" name="lastName" value={form.lastName} onChange={handle} required />
              </div>
              <div className="field">
                <label>Country</label>
                <input className="input" name="country" value={form.country} onChange={handle} required placeholder="e.g. Bulgaria" />
              </div>
              <div className="field">
                <label>Gender</label>
                <select className="select" name="gender" value={form.gender} onChange={handle}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Date of Birth</label>
                <input className="input" name="birthDate" type="date" value={form.birthDate} onChange={handle} required />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving…" : athlete ? "Update" : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function calcAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function AthletesPage() {
  const { isAdmin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await apiClient.get("/athletes");
      setAthletes(r.data);
    } catch { setError("Failed to load athletes."); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this athlete?")) return;
    try {
      await apiClient.delete(`/athletes/${id}`);
      setSuccess("Athlete deleted."); load();
    } catch { setError("Failed to delete athlete."); }
  };

  const canManage = (athlete) =>
    isAdmin || (isAuthenticated && String(user?.id) === String(athlete.userId));

  const initials = (a) => (a.firstName?.[0] ?? "") + (a.lastName?.[0] ?? "");

  const countries = [...new Set(athletes.map(a => a.country).filter(Boolean))].sort();

  const filtered = athletes.filter(a => {
    const name = `${a.firstName} ${a.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || a.country?.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || a.country === filterCountry;
    const matchGender = !filterGender || a.gender === filterGender;
    return matchSearch && matchCountry && matchGender;
  });

  return (
    <div>
      {modal && (
        <AthleteModal
          athlete={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); setSuccess("Saved!"); load(); }}
        />
      )}

      <div className="page-head">
        <div>
          <span className="section-label">Participants</span>
          <h1 className="page-title">Athletes</h1>
          <p className="page-subtitle">{athletes.length} registered athletes in the Winter Games.</p>
        </div>
        {isAuthenticated && (
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            + Register Athlete
          </button>
        )}
      </div>

      {error   && <div className="msg msg-error">{error}</div>}
      {success && <div className="msg msg-success">{success}</div>}

      <div className="card card-padded" style={{ marginBottom: "24px" }}>
        <div className="form-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
          <div className="field">
            <label>Search</label>
            <input
              className="input"
              placeholder="Name or country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Country</label>
            <select className="select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">All countries</option>
              {countries.map(c => <option key={c} value={c}>{getFlag(c)} {c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Gender</label>
            <select className="select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
              <option value="">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
        {(search || filterCountry || filterGender) && (
          <div style={{ marginTop: "12px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(""); setFilterCountry(""); setFilterGender(""); }}>
              ✕ Clear filters
            </button>
            <span className="text-muted text-sm" style={{ marginLeft: "12px" }}>
              {filtered.length} of {athletes.length} athletes
            </span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔍</div>No athletes match your filters.</div>
      ) : (
        <div className="grid-3">
          {filtered.map(a => (
            <div
              key={a.id}
              className="card athlete-card anim-fade-up"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/athletes/${a.id}`)}
            >
              <div className="flex-center gap-12">
                <div className="athlete-avatar">{initials(a)}</div>
                <div>
                  <div className="athlete-name">{a.firstName} {a.lastName}</div>
                  <div className="athlete-country">{getFlag(a.country)} {a.country}</div>
                </div>
              </div>
              <div className="athlete-meta">
                <span className={`badge badge-${a.gender?.toLowerCase()}`}>{a.gender}</span>
                <span className="badge" style={{ background: "var(--glass)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  {calcAge(a.birthDate)} yrs
                </span>
              </div>
              {canManage(a) && (
                <div className="flex gap-8 mt-16" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal(a)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={e => handleDelete(a.id, e)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}