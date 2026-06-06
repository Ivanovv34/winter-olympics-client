import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function parseErrors(err) {
  const data = err.response?.data;
  if (!data) return "An unexpected error occurred.";
  if (Array.isArray(data.messages) && data.messages.length > 0) return data.messages.join("\n");
  if (Array.isArray(data.errors)   && data.errors.length > 0)   return data.errors.join("\n");
  if (data.message) return data.message;
  return "An unexpected error occurred.";
}

function validate(form) {
  if (!form.username.trim()) return "Username is required.";
  if (form.username.trim().length < 3) return "Username must be at least 3 characters.";
  if (form.username.trim().length > 100) return "Username must be at most 100 characters.";
  if (!form.password) return "Password is required.";
  if (form.password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", role: "ATHLETE" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async e => {
    e.preventDefault();
    const validationError = validate(form);
    if (validationError) { setError(validationError); return; }
    setError(""); setLoading(true);
    try {
      await register(form.username.trim(), form.password, form.role);
      navigate("/login");
    } catch (err) {
      setError(parseErrors(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card anim-fade-up">
        <div className="card-body">
          <div className="auth-title">Create account</div>
          <div className="auth-sub">Join the Winter Games platform</div>

          {error && <div className="msg msg-error" style={{ whiteSpace: "pre-line" }}>{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            <div className="field">
              <label>Username</label>
              <input
                className="input" name="username"
                value={form.username} onChange={handle}
                required autoFocus autoComplete="username"
                placeholder="3–100 characters"
              />
              {form.username.length > 0 && form.username.length < 3 && (
                <span style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px" }}>
                  At least 3 characters required
                </span>
              )}
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input" name="password" type="password"
                value={form.password} onChange={handle}
                required autoComplete="new-password"
                placeholder="At least 6 characters"
              />
              {form.password.length > 0 && form.password.length < 6 && (
                <span style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px" }}>
                  At least 6 characters required
                </span>
              )}
            </div>
            <div className="field">
              <label>Role</label>
              <select className="select" name="role" value={form.role} onChange={handle}>
                <option value="ATHLETE">Athlete</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}