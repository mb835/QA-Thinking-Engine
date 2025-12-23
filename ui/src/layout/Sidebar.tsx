import {
  LayoutDashboard,
  ListChecks,
  Play,
  GitBranch,
  Cloud,
  Image,
  FileText,
  Settings
} from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Test Scenarios", icon: ListChecks },
  { label: "Test Runs", icon: Play },
  { label: "CI/CD", icon: GitBranch },
  { label: "Cloud Testing", icon: Cloud },
  { label: "Visual Tests", icon: Image },
  { label: "Reports", icon: FileText },
  { label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-panel border-r border-panel-border p-6">
      <div className="mb-8 text-xl font-bold text-slate-100">
        QA AI Agent
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
              ${
                item.active
                  ? "bg-primary-soft text-primary"
                  : "text-slate-400 hover:bg-background-hover hover:text-white"
              }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
