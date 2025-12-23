import { Bell, Settings, User } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Header() {
  return (
    <header className="h-14 bg-panel border-b border-panel-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6 text-sm">
        <span className="text-green-400">✔ Build: Passed</span>
        <span className="text-blue-400">☁ Cloud Tests: Running</span>
        <span className="text-yellow-400">⚠ Visual Checks: 2 Issues</span>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <ThemeToggle />
        <Bell size={18} />
        <Settings size={18} />
        <User size={18} />
      </div>
    </header>
  );
}
