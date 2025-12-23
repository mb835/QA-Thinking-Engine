export default function CloudWidget() {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="font-semibold mb-3">Cloud Test Execution</h2>

      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[var(--primary)] h-2"
          style={{ width: "70%" }}
        />
      </div>

      <p className="text-xs text-slate-400 mt-2">
        7 / 10 testů dokončeno
      </p>
    </div>
  );
}
