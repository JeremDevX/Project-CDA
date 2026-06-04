import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "cd ../back && npm run build && PORT=1338 E2E_CLEANUP_ENABLED=true APP_BASE_URL=http://localhost:5174 CORS_ORIGIN=http://localhost:5174 npm run start",
      url: "http://localhost:1338/api/health",
      reuseExistingServer: false,
    },
    {
      command:
        "VITE_API_BASE_URL=http://localhost:1338/api npm run dev -- --host localhost --port 5174",
      url: "http://localhost:5174",
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
