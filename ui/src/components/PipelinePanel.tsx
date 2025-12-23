export default function PipelinePanel() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-panel to-[#0b1220] border border-panel-border shadow-panel p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-100">
        Pipeline Status
      </h3>

      <div className="flex items-center gap-4 text-sm mb-4">
        <span className="px-3 py-1 rounded bg-background-soft">Commit</span>
        <span>→</span>
        <span className="px-3 py-1 rounded bg-background-soft">CI</span>
        <span>→</span>
        <span className="px-3 py-1 rounded bg-success text-white shadow">Tests</span>
        <span>→</span>
        <span className="px-3 py-1 rounded bg-background-soft">Deploy</span>
      </div>

      <div className="text-sm text-slate-400">
        ✔ Last build: Success &nbsp; ❌ Failed tests: 1
      </div>
    </div>
  );
}
