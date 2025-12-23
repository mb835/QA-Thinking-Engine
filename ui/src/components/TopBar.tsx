export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 text-sm">
      <div className="flex gap-6">
        <span className="text-green-600">✔ Sestavení: Úspěšné</span>
        <span className="text-blue-600">☁ Cloud testy: Běží</span>
        <span className="text-red-500">⚠ Vizuální chyby: 2</span>
      </div>

      <div className="font-medium">Martin</div>
    </header>
  );
}
