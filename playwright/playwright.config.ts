import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/specs",
  timeout: 30_000,
  retries: 0,

  use: {
    baseURL: "https://www.alza.cz",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports" }],
  ],
});
