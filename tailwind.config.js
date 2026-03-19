/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        // Dark mode surfaces
        base: {
          900: "#0d0d0d",
          800: "#141414",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2a2a2a",
        },
        // Light mode surfaces
        light: {
          50:  "#fafaf9",
          100: "#f4f3f1",
          200: "#eae8e4",
          300: "#d6d3ce",
          400: "#b0ada6",
        },
      },
      keyframes: {
        "fade-in":   { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-up":  { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-in":  { from: { transform: "translateX(-8px)", opacity: 0 }, to: { transform: "translateX(0)", opacity: 1 } },
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
