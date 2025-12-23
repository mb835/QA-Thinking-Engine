export default function TestSummaryWidget() {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
      <h2 className="font-semibold mb-3">Test Summary</h2>

      <ul className="text-sm space-y-2">
        <li className="flex justify-between">
          <span>Happy paths</span>
          <span className="text-green-400">12</span>
        </li>

        <li className="flex justify-between">
          <span>Edge cases</span>
          <span className="text-yellow-400">5</span>
        </li>

        <li className="flex justify-between">
          <span>Negative</span>
          <span className="text-red-400">3</span>
        </li>
      </ul>
    </div>
  );
}
