import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CompetitionsPage from "./pages/CompetitionsPage";
import AthletesPage from "./pages/AthletesPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/athletes" element={<AthletesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}