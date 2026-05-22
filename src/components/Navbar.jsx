import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-rings">
          <span /><span /><span /><span /><span />
        </div>
        WINTER GAMES
      </Link>

      <nav className="navbar-links">
        <NavLink to="/competitions" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          Competitions
        </NavLink>
        <NavLink to="/athletes" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          Athletes
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          Statistics
        </NavLink>

        {!isAuthenticated && (
          <>
            <NavLink to="/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Register</NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            <span className="nav-user">{user.username} · {user.role}</span>
            <button className="btn-logout" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}