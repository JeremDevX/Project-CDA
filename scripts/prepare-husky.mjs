import { spawnSync } from "node:child_process";

if (process.env.CI) {
  process.exit(0);
}

const result = spawnSync("npx", ["husky"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.warn("Skipping Husky install:", result.error.message);
  process.exit(0);
}

process.exit(result.status ?? 0);
