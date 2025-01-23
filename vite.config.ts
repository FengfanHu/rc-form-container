import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  root: "./demo",
  plugins: [react()],
  build: {
    lib: {
      entry: ["src/index.ts"], // 包的入口文件
      name: "rc-form-container", // 包的全局变量名
      fileName: (format) => `rc-form-container.${format}.js`, // 输出文件名
      formats: ["es", "cjs", "umd"], // 输出格式
    },
    outDir: path.resolve(__dirname, "./lib"),
    rollupOptions: {
      input: "src/index.ts",
    },
  },
});
