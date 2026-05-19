import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

export default function StatisticsPage() {
  const [medals, setMedals] = useState([]);
  const [averageAge, setAverageAge] = useState(null);
  const [youngest, setYoungest] = useState(null);
  const [oldest, setOldest] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const medalsResponse = await apiClient.get("/statistics/medals-by-country");
    const averageAgeResponse = await apiClient.get("/statistics/average-age");

    setMedals(medalsResponse.data);
    setAverageAge(averageAgeResponse.data);

    try {
      const youngestResponse = await apiClient.get(
        "/statistics/youngest-medalist"
      );
      setYoungest(youngestResponse.data);
    } catch {
      setYoungest(null);
    }

    try {
      const oldestResponse = await apiClient.get("/statistics/oldest-medalist");
      setOldest(oldestResponse.data);
    } catch {
      setOldest(null);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <h2>Statistics</h2>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Average Age</h3>
          <p>
            {averageAge
              ? `${averageAge.averageAge} years (${averageAge.participantsCount} participants)`
              : "No data"}
          </p>
        </article>

        <article className="card">
          <h3>Youngest Medalist</h3>
          <p>{youngest ? youngest.athleteFullName : "No medalists yet"}</p>
        </article>

        <article className="card">
          <h3>Oldest Medalist</h3>
          <p>{oldest ? oldest.athleteFullName : "No medalists yet"}</p>
        </article>
      </div>

      <div className="card table-card">
        <h3>Medals by Country</h3>

        <table>
          <thead>
            <tr>
              <th>Country</th>
              <th>Gold</th>
              <th>Silver</th>
              <th>Bronze</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {medals.map((row) => (
              <tr key={row.country}>
                <td>{row.country}</td>
                <td>{row.goldMedals}</td>
                <td>{row.silverMedals}</td>
                <td>{row.bronzeMedals}</td>
                <td>{row.totalMedals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}