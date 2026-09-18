import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // mesmo alias do tsconfig, pra teste importar módulo que usa "@/..."
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
