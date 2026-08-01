import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "var(--color-primary)",
          "primary-hover": "var(--color-primary-hover)",
          secondary: "var(--color-secondary)",
          "secondary-hover": "var(--color-secondary-hover)",
          danger: "var(--color-danger)",
          "danger-hover": "var(--color-danger-hover)",
          success: "var(--color-success)",
          "success-hover": "var(--color-success-hover)",
          heart: "var(--color-heart)",
          "heart-hover": "var(--color-heart-hover)",
          warning: "var(--color-warning)",
          "warning-hover": "var(--color-warning-hover)",
          info: "var(--color-info)",
          "info-hover": "var(--color-info-hover)",
        },
        surface: {
          base: "var(--color-surface-base)",
          muted: "var(--color-surface-muted)",
          card: "var(--color-surface-card)",
          "card-hover": "var(--color-surface-card-hover)",
        },
        focus: {
          ring: "var(--color-focus-ring)" // requires color-mix fallback or raw hex but standard CSS variables handle it in modern browsers
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-jp)", "Arial", "sans-serif"],
      },
      borderRadius: {
        "brand-sm": "0.125rem",
        "brand-md": "0.375rem",
        "brand-lg": "0.5rem",
        "brand-full": "9999px",
      },
      boxShadow: {
        "brand-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "brand-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "brand-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      animation: {
        fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
        normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
        slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
        shimmer: "shimmer 2s infinite linear",
        "spin-custom": "spin 1s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
