export default function SkeletonPanel() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-panel to-[#0b1220] border border-panel-border shadow-panel p-6 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-slate-100">
        Playwright Test Script
      </h3>

      <pre className="flex-1 bg-[#020617] rounded-lg p-4 text-xs text-emerald-400 overflow-auto">
{`test('login works', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'user@test.com');
  await page.fill('#password', 'password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});`}
      </pre>

      <div className="flex gap-2 mt-4">
        <button className="px-4 py-1.5 rounded-md bg-background-soft text-slate-300 hover:bg-background-hover transition">
          Copy Code
        </button>
        <button className="px-4 py-1.5 rounded-md bg-background-soft text-slate-300 hover:bg-background-hover transition">
          Export
        </button>
        <button className="px-4 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white shadow transition">
          Run Tests
        </button>
      </div>
    </div>
  );
}
