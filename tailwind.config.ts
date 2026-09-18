import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        med: {
          dark: "#0a0f1d",
          card: "#111827",
          border: "#1f293d",
          accent: "#0ea5e9",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
          cyan: "#06b6d4",
        }
      },
    },
  },
  plugins: [],
};
export default config;
