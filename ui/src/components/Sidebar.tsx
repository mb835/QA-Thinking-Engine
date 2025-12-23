import {
  LayoutDashboard,
  ListChecks,
  Play,
  GitBranch,
  Cloud,
  Eye,
  BarChart,
  Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col p-4">
      <h1 className="text-xl font-semibold mb-6">QA AI Agent</h1>

      <nav className="space-y-1 text-sm">
        <Item icon={<LayoutDashboard size={16} />} label="Přehled" />
        <Item icon={<ListChecks size={16} />} label="Testovací scénáře" />
        <Item icon={<Play size={16} />} label="Spuštění testů" />
        <Item icon={<GitBranch size={16} />} label="CI/CD" />
        <Item icon={<Cloud size={16} />} label="Cloud testování" />
        <Item icon={<Eye size={16} />} label="Vizuální testy" />
        <Item icon={<BarChart size={16} />} label="Reporty" />
        <Item icon={<Settings size={16} />} label="Nastavení" />
      </nav>
    </aside>
  );
}

function Item({
  icon,
  label
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-800 transition">
      {icon}
      <span>{label}</span>
    </div>
  );
}
