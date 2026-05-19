import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ATHLETE",
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
      await register(form.username, form.password, form.role);
      navigate("/login");
    } catch {
      setError("Registration failed.");
    }
  };

  return (
    <section className="page">
      <div className="card form-card">
        <h2>Register</h2>

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

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="ATHLETE">ATHLETE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <button type="submit">Register</button>
        </form>
      </div>
    </section>
  );
}