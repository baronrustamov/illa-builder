import typescript from "@rollup/plugin-typescript"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const path = require("path")

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      jsxRuntime: "automatic",
      babel: {
        plugins: ["@emotion/babel-plugin"],
        compact: false,
      },
      // Exclude storybook stories
      exclude: [
        /\.stories\.([tj])sx?$/,
        /\.e2e\.([tj])sx?$/,
        /\.test\.([tj])sx?$/,
      ],
      // Only .tsx files
      include: ["**/*.tsx", "**/*.ts"],
    }),
  ],
  build: {
    sourcemap: true,
    minify: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "@illa-design/modal",
      fileName: (format) => `${format}/index.js`,
    },
    rollupOptions: {
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "tsconfig.json"),
          rootDir: path.resolve(__dirname, "src"),
          declaration: true,
          declarationDir: path.resolve(__dirname, "dist/types"),
          exclude: path.resolve(__dirname, "node_modules/**"),
        }),
      ],
      external: [
        "react",
        "react-dom",
        "@illa-design/system",
        "@illa-design/theme",
        "@illa-design/button",
        "@illa-design/config-provider",
        "@illa-design/icon",
        "react-hotkeys-hook",
        "react-focus-lock",
        "@illa-design/trigger",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDom",
          "@illa-design/system": "@illa-design/system",
          "@illa-design/theme": "@illa-design/theme",
          "@illa-design/button": "@illa-design/button",
          "@illa-design/config-provider": "@illa-design/config-provider",
          "@illa-design/icon": "@illa-design/icon",
          "react-hotkeys-hook": "react-hotkeys-hook",
          "react-focus-lock": "react-focus-lock",
          "@illa-design/trigger": "@illa-design/trigger",
        },
      },
    },
  },
})
