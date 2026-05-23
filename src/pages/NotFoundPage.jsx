import { Link } from "react-router-dom";
import SnowParticles from "../components/SnowParticles";

export default function NotFoundPage() {
  return (
    <>
      <SnowParticles />
      <div className="hero-section" style={{ minHeight: "70vh", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "80px", marginBottom: "16px" }}>🏔️</div>
          <h1 className="page-title" style={{ fontSize: "100px", color: "var(--frost)", lineHeight: 1 }}>
            404
          </h1>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--white)", marginTop: "12px", letterSpacing: "2px" }}>
            THIS SLOPE DOESN'T EXIST
          </p>
          <p className="page-subtitle" style={{ fontSize: "16px", marginTop: "12px" }}>
            The page you're looking for has gone off-piste.
          </p>
          <div style={{ marginTop: "36px", display: "flex", gap: "14px", justifyContent: "center" }}>
            <Link to="/"            className="btn btn-primary btn-lg">🏠 Home</Link>
            <Link to="/competitions" className="btn btn-secondary btn-lg">🏅 Competitions</Link>
          </div>
        </div>
      </div>
    </>
  );
}