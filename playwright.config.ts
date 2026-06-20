import { defineConfig, devices } from "@playwright/test";

const isCi = Object.hasOwn(process.env, "CI");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCi,
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: devices["Pixel 5"],
    },
  ],
});
