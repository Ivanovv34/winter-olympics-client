import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/competitions");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card anim-fade-up">
        <div className="card-body">
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Sign in to your Winter Games account</div>

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
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}