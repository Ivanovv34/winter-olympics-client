import { Link } from "react-router-dom";
import SnowParticles from "../components/SnowParticles";

const FEATURES = [
  { icon: "⛷️", title: "Ski Slalom", desc: "Two-run format with automatic second-run start list, qualification, and final ranking." },
  { icon: "🎿", title: "Biathlon", desc: "Lap-based racing with shooting penalties calculated automatically into final times." },
  { icon: "🏅", title: "Medals", desc: "Gold, silver, and bronze awarded automatically based on final standings." },
  { icon: "📊", title: "Statistics", desc: "Country medal tables, average athlete age, and youngest/oldest medalist tracking." },
];

export default function HomePage() {
  return (
    <>
      <SnowParticles />
      <div className="hero-section" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-rings anim-fade-up">
          {[0,1,2,3,4].map(i => <div key={i} className="hero-ring" />)}
        </div>

        <p className="hero-label anim-fade-up anim-delay-1">Winter Olympics 2026</p>

        <h1 className="hero-title anim-fade-up anim-delay-2">
          <span className="shimmer-text">WINTER</span>
          <br />GAMES
        </h1>

        <p className="hero-desc anim-fade-up anim-delay-3">
          A complete management platform for alpine ski slalom and biathlon competitions.
          Register athletes, enter results, and track the medal table in real time.
        </p>

        <div className="hero-actions anim-fade-up anim-delay-4">
          <Link to="/competitions" className="btn btn-primary btn-lg">View Competitions</Link>
          <Link to="/statistics" className="btn btn-secondary btn-lg">Medal Table</Link>
        </div>

        <div className="hero-features anim-fade-up anim-delay-4">
          {FEATURES.map(f => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}