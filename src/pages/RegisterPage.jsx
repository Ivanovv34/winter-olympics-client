import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", role: "ATHLETE" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form.username, form.password, form.role);
      navigate("/login");
    } catch {
      setError("Registration failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card anim-fade-up">
        <div className="card-body">
          <div className="auth-title">Create account</div>
          <div className="auth-sub">Join the Winter Games platform</div>

          {error && <div className="msg msg-error">{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            <div className="field">
              <label>Username</label>
              <input className="input" name="username" value={form.username} onChange={handle} required autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handle} required />
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