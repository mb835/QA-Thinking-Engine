import { NavLink, Outlet } from "react-router-dom";

export default function Shell() {
  return (
    <div className="flex h-screen bg-[var(--bg)] text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[var(--border)] p-4">
        <h1 className="text-xl font-bold mb-6">QA AI Agent</h1>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/scenarios"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`
            }
          >
            Test Scenarios
          </NavLink>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
