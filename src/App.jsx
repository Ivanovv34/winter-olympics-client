import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CompetitionsPage from "./pages/CompetitionsPage";
import AthletesPage from "./pages/AthletesPage";
import AthleteProfilePage from "./pages/AthleteProfilePage";
import StatisticsPage from "./pages/StatisticsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />
          <main style={{ position: "relative", zIndex: 1 }}>
            <Routes>
              <Route path="/"                element={<HomePage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/competitions"    element={<CompetitionsPage />} />
              <Route path="/athletes"        element={<AthletesPage />} />
              <Route path="/athletes/:id"    element={<AthleteProfilePage />} />
              <Route path="/statistics"      element={<StatisticsPage />} />
              <Route path="*"               element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}