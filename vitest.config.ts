import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: [
      { find: "@/modules", replacement: path.resolve(__dirname, "src/modules") },
      { find: "@/app", replacement: path.resolve(__dirname, "src/app") },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
