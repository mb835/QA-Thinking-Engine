import { NavLink } from "react-router-dom";

const menu = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Test Scenarios", path: "/scenarios" },
  { label: "Test Runs", path: "/runs" },
  { label: "CI / CD", path: "/ci" },
  { label: "Cloud Testing", path: "/cloud" },
  { label: "Visual Tests", path: "/visual" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#0b1220] border-r border-white/10 text-white">
      <div className="px-6 py-5 text-xl font-semibold tracking-wide">
        QA AI Agent
      </div>

      <nav className="px-3 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-sm transition
              ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
