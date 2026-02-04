import { defineConfig } from "@rspack/cli";
import path from "path";
import { config } from "dotenv";

config();

export default defineConfig({
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    popup: "./src/popup.tsx",
    "service-worker": "./src/service-worker.ts",
    "content-script": "./src/content-script.ts",
    "onboarding-entry": "./src/onboarding-entry.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "./"),
      components: path.resolve(__dirname, "./components"),
      lib: path.resolve(__dirname, "./lib"),
      contexts: path.resolve(__dirname, "./contexts"),
    },
    fallback: {
      buffer: require.resolve("buffer"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "builtin:swc-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: "postcss-loader",
        type: "css",
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new (require("@rspack/core").ProvidePlugin)({
      React: "react",
    }),
    new (require("@rspack/core").ProvidePlugin)({
      Buffer: ["buffer", "Buffer"],
    }),
    new (require("@rspack/core").DefinePlugin)({
      "process.env.RPC_URL": JSON.stringify(process.env.RPC_URL),
    }),
    new (require("@rspack/core").HtmlRspackPlugin)({
      template: "./src/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
      inject: "body",
    }),
    new (require("@rspack/core").CopyRspackPlugin)({
      patterns: [
        { from: "public/manifest.json", to: "manifest.json" },
        { from: "public/*.png", to: "[name][ext]" },
        { from: "public/*.svg", to: "[name][ext]" },
        { from: "public/assets/tokens/*.svg", to: "assets/tokens/[name][ext]" },
        {
          from: "public/wasm/settler_wasm_bg.wasm",
          to: "wasm/settler_wasm_bg.wasm",
        },
      ],
    }),
    new (require("@rspack/core").HtmlRspackPlugin)({
      template: "./src/onboarding.html",
      filename: "onboarding.html",
      chunks: ["onboarding-entry"],
      inject: "body",
    }),
  ],
  experiments: {
    css: true,
    asyncWebAssembly: true,
  },
});
