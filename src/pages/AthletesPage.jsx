import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function AthletesPage() {
  const [athletes, setAthletes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      const response = await apiClient.get("/athletes");
      setAthletes(response.data);
    } catch {
      setError("Failed to load athletes.");
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Athletes</h2>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="grid">
        {athletes.map((athlete) => (
          <article key={athlete.id} className="card">
            <h3>
              {athlete.firstName} {athlete.lastName}
            </h3>
            <p>Country: {athlete.country}</p>
            <p>Gender: {athlete.gender}</p>
            <p>Birth date: {athlete.birthDate}</p>
          </article>
        ))}
      </div>
    </section>
  );
}