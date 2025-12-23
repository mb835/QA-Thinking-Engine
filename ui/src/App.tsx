import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layout/Shell";
import DashboardPage from "./dashboard/DashboardPage";
import TestScenariosPage from "./pages/TestScenariospage";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scenarios" element={<TestScenariosPage />} />
      </Route>
    </Routes>
  );
}
