import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "light" : "dark"
    );
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 rounded-md bg-background-soft hover:bg-background-hover transition text-sm"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
