import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#2B52A8",
          deep: "#1B3A7E",
          darkest: "#122A5E",
        },
        green: {
          DEFAULT: "#1E9E5A",
          deep: "#14693C",
        },
        neon: "#0094FF",
        panel: "#E9E9E7",
        ink: "#0E1320",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        wider2: "0.13em",
      },
    },
  },
  plugins: [],
};

export default config;
