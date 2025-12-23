export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--bg)",
          soft: "var(--bg-soft)",
          hover: "var(--bg-hover)",
        },
        panel: {
          DEFAULT: "var(--panel)",
          border: "var(--panel-border)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
