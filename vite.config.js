import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "src/components/ui"), // 절대 경로 사용
    },
  },
  plugins: [react()],
});
