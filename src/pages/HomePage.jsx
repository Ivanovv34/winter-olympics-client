export default function HomePage() {
  return (
    <section className="home-page">
      <div className="hero olympic-hero">
        <div className="hero-badge">Winter Games 2026</div>

        <h1>Winter Olympics Management System</h1>

        <p>
          A modern platform for managing winter competitions, athletes,
          registrations, results, rankings and Olympic statistics.
        </p>

        <div className="hero-actions">
          <a href="/competitions" className="primary-link">
            View Competitions
          </a>
          <a href="/statistics" className="secondary-link">
            View Statistics
          </a>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <span className="feature-icon">⛷️</span>
          <h3>Slalom</h3>
          <p>
            Manage first runs, second runs, qualification and final rankings.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">🎿</span>
          <h3>Biathlon</h3>
          <p>
            Track ski time, missed shots, penalties and final result positions.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">🏅</span>
          <h3>Medals</h3>
          <p>
            Calculate gold, silver and bronze medals by country and athlete.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>Statistics</h3>
          <p>
            View country medal tables, average age and medalist information.
          </p>
        </article>
      </div>
    </section>
  );
}