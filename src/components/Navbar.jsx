import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">❄️</span>
        Winter Games
      </Link>

      <nav className="navbar-links">
        <NavLink to="/competitions">Competitions</NavLink>
        <NavLink to="/athletes">Athletes</NavLink>
        <NavLink to="/statistics">Statistics</NavLink>

        {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
        {!isAuthenticated && <NavLink to="/register">Register</NavLink>}

        {isAuthenticated && (
          <>
            <span className="navbar-user">
              {user.username} ({user.role})
            </span>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}