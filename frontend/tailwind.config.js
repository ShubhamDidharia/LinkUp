import daisyui from "daisyui"
import daisyUIThemes from "daisyui/src/theming/themes"
import defaultConfig from "shadcn/ui/tailwind.config"

/** @type {import('tailwindcss').Config} */
export default {
  ...defaultConfig,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      ...defaultConfig.theme.extend,
      // Add custom animations for the notification page
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideIn: {
          "0%": {
            opacity: "0",
            transform: "translateX(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      // Add custom backdrop blur utilities
      backdropBlur: {
        xs: "2px",
      },
      // Add custom spacing for notification layout
      spacing: {
        13: "3.25rem", // For the ml-13 class used in notifications
      },
      // Add custom colors that complement your existing theme
      colors: {
        ...defaultConfig.theme.extend.colors,
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      // Add custom box shadows for modern cards
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, daisyui],
  daisyui: {
    themes: [
      "light",
      {
        black: {
          ...daisyUIThemes["black"],
          primary: "rgb(29, 155, 240)",
          secondary: "rgb(24, 24, 24)",
          // Override background colors to remove black
          "base-100": "#ffffff", // Main background - white
          "base-200": "#f8fafc", // Secondary background - very light gray
          "base-300": "#f1f5f9", // Tertiary background - light gray
          "base-content": "#1e293b", // Text color - dark gray instead of white
          // Keep other colors but make them work with light background
          neutral: "#64748b",
          "neutral-content": "#ffffff",
        },
      },
    ],
  },
}
