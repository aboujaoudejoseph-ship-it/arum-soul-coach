import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fdf2f6",
          100: "#fbe4ed",
          200: "#f6c9dc",
          300: "#f0a7c4",
          400: "#e783aa",
          500: "#d9628f",
          600: "#bf4a74",
        },
        lavender: {
          50: "#f6f4fd",
          100: "#ece7fa",
          200: "#d9cff4",
          300: "#c0b0ec",
          400: "#a48ee1",
          500: "#8a6fd3",
          600: "#7057b8",
        },
        cream: {
          50: "#fffdf9",
          100: "#fdf8f0",
          200: "#f9f0e0",
        },
        navy: {
          400: "#3c4266",
          500: "#2a2e4a",
          600: "#1e2138",
          700: "#151729",
          800: "#0e0f1c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 40px -8px rgba(217, 98, 143, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
