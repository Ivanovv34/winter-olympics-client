import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form.username, form.password);
      navigate("/competitions");
    } catch {
      setError("Invalid username or password.");
    }
  };

  return (
    <section className="page">
      <div className="card form-card">
        <h2>Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Login</button>
        </form>
      </div>
    </section>
  );
}