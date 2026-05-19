import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const response = await apiClient.get("/competitions");
      setCompetitions(response.data);
    } catch {
      setError("Failed to load competitions.");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Competitions</h2>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="grid">
        {competitions.map((competition) => (
          <article key={competition.id} className="card">
            <h3>{competition.name}</h3>
            <p>Type: {competition.type}</p>
            <p>Gender: {competition.gender}</p>
            <p>Minimum age: {competition.minAge}</p>
            <p>Date: {competition.competitionDate}</p>
            <p>Status: {competition.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}