export default function PipelineWidget() {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="font-semibold mb-3">CI / CD Pipeline</h2>

      <div className="flex items-center justify-between text-sm">
        <span>Build</span>
        <span className="text-green-400">Passed</span>
      </div>

      <div className="flex items-center justify-between text-sm mt-2">
        <span>Tests</span>
        <span className="text-red-400">1 Failed</span>
      </div>

      <div className="flex items-center justify-between text-sm mt-2">
        <span>Deploy</span>
        <span className="text-slate-400">Pending</span>
      </div>
    </div>
  );
}
