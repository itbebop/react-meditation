import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@ui": "/src/components/ui", // 예시: @ui를 사용하여 ui 폴더를 참조
    },
  },
  plugins: [react()],
});
