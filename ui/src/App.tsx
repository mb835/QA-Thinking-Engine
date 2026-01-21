import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layout/Shell";
import DashboardPage from "./pages/DashboardPage";
import TestScenariosPage from "./pages/TestScenariosPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scenarios" element={<TestScenariosPage />} />
        <Route path="/runs" element={<PlaceholderPage title="Test Runs" />} />
        <Route path="/cicd" element={<PlaceholderPage title="CI / CD" />} />
        <Route path="/cloud" element={<PlaceholderPage title="Cloud Testing" />} />
        <Route path="/visual" element={<PlaceholderPage title="Visual Tests" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}
