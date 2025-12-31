import {
  FaClipboardCheck,
  FaChartLine,
  FaChartPie,
} from "react-icons/fa";

import { ScenarioTrendChart, TestTypePieChart } from "./DashboardCharts";

export default function DashboardPage() {
  return (
    <div className="px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold mb-1">QA Dashboard</h1>
          <p className="text-sm text-slate-400">
            Přehled posledních QA analýz a stavu AI QA agenta
          </p>
        </div>

        {/* LAST RUN */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <FaClipboardCheck className="text-indigo-400" />
            Poslední QA běh
          </h3>

          <p className="text-sm text-slate-300">
            <strong>Záměr:</strong> Otestuj první nákup notebooku na Alza.cz
          </p>
          <p className="text-sm text-slate-400">
            <strong>Čas:</strong> 31. 12. 2025 – 18:50
          </p>

          <p className="text-xs text-slate-500 mt-3 italic">
            AI-driven QA reasoning · Acceptance-first approach
          </p>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <FaChartLine />
              Počet QA scénářů v čase
            </h3>
            <ScenarioTrendChart />
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <FaChartPie />
              Typy testů (poslední běh)
            </h3>
            <TestTypePieChart />
          </div>
        </div>

        {/* PLACEHOLDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold mb-2">Kvalita pokrytí</h3>
            <p className="text-xs text-slate-500">
              Rizika, coverage, regresní mapa (coming soon)
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold mb-2">Historie běhů</h3>
            <p className="text-xs text-slate-500">
              Export, CI/CD, trendy (coming soon)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
