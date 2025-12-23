export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0b1220",
          soft: "#111a2e",
          hover: "#16213d",
        },
        panel: {
          DEFAULT: "#0f172a",
          border: "rgba(255,255,255,0.08)",
        },
        primary: {
          DEFAULT: "#4f46e5",
          hover: "#6366f1",
          soft: "rgba(79,70,229,0.15)",
        },
        accent: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0,0,0,0.35)",
        soft: "0 4px 20px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
