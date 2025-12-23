import CloudWidget from "./widgets/CloudWidget";
import PipelineWidget from "./widgets/PipelineWidget";
import TestSummaryWidget from "./widgets/TestSummaryWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">
          Stav systému, pipeline a cloud testů.
        </p>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <PipelineWidget />
        <CloudWidget />
        <TestSummaryWidget />
      </div>
    </div>
  );
}
