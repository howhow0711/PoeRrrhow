import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const [repositoryOwner = "", repositoryName = ""] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const isRootGithubPagesSite = repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
const githubPagesBase = process.env.GITHUB_ACTIONS
  ? (isRootGithubPagesSite ? "/" : `/${repositoryName}/`)
  : "/";

// https://vite.dev/config/
export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
  },
});
