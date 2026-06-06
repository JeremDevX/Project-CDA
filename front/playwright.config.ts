import { defineConfig, devices } from "@playwright/test";

const e2eMockExternalServices = process.env.E2E_MOCK_EXTERNALS ?? "true";
process.env.E2E_MOCK_EXTERNALS = e2eMockExternalServices;

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
        `cd ../back && npm run build && PORT=1338 E2E_CLEANUP_ENABLED=true E2E_MOCK_EXTERNALS=${e2eMockExternalServices} APP_BASE_URL=http://localhost:5174 CORS_ORIGIN=http://localhost:5174 npm run start`,
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
