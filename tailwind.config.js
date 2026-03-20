/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        mono:    ["Inter", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        base: {
          900: "#0d0d0d",
          800: "#141414",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2a2a2a",
        },
        light: {
          50:  "#f5f0e8",
          100: "#fdf8f2",
          200: "#ede8de",
          300: "#e2dbd0",
          400: "#d4cdc0",
        },
      },
      keyframes: {
        "fade-in":  { from: { opacity: 0, transform: "translateY(4px)" },  to: { opacity: 1, transform: "translateY(0)" } },
        "slide-up": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-in": { from: { transform: "translateX(-8px)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
      },
      animation: {
        "fade-in":  "fade-in 0.2s ease",
        "slide-up": "slide-up 0.25s ease",
        "slide-in": "slide-in 0.15s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}