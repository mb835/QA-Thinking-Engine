import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layout/Shell";
import DashboardPage from "./pages/DashboardPage";
import TestScenariosPage from "./pages/TestScenariosPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scenarios" element={<TestScenariosPage />} />
      </Routes>
    </Shell>
  );
}
