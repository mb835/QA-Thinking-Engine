import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCheckSquare,
  FaPlay,
  FaCogs,
  FaCloud,
  FaEye,
  FaChartBar,
  FaSlidersH,
} from "react-icons/fa";

const menu = [
  { label: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
  { label: "Testovací scénáře", icon: <FaCheckSquare />, path: "/scenarios" },
  { label: "Spuštění testů", icon: <FaPlay />, path: "/runs" },
  { label: "CI / CD", icon: <FaCogs />, path: "/cicd" },
  { label: "Cloud testing", icon: <FaCloud />, path: "/cloud" },
  { label: "Vizuální testy", icon: <FaEye />, path: "/visual" },
  { label: "Reporty", icon: <FaChartBar />, path: "/reports" },
  { label: "Nastavení", icon: <FaSlidersH />, path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#0b1220] to-[#060b18] text-white border-r border-white/10">
      <div className="px-6 py-5 text-xl font-bold tracking-wide">
        QA Thinking Engine
      </div>

      <nav className="mt-6 flex flex-col gap-1 px-3">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm
              transition-all duration-200
              ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }
            `
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
