import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          100: "#d4d2ff",
          200: "#a8a6ff",
          300: "#918efa",
          400: "#807dfa",
        },
        violet: {
          100: "#d4d2ff",
          200: "#a8a6ff",
          300: "#918efa",
          400: "#807dfa",
        },
        pink: {
          200: "#ffa6f6",
          300: "#fa8cef",
          400: "#fa7fee",
        },
        red: {
          200: "#ff9f9f",
          300: "#fa7a7a",
          400: "#f76363",
        },
        orange: {
          200: "#ffc29f",
          300: "#ff965b",
          400: "#fa8543",
        },
        yellow: {
          200: "#fff59f",
          300: "#fff066",
          400: "#ffe500",
        },
        lime: {
          200: "#b8ff9f",
          300: "#9dfc7c",
          400: "#7df752",
        },
        cyan: {
          200: "#a6faff",
          300: "#79f7ff",
          400: "#53f2fc",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        "neo-sm": "2px 2px 0 0 #111111",
        "neo-md": "4px 4px 0 0 #111111",
        "neo-lg": "8px 8px 0 0 #111111",
      },
      backgroundImage: {
        "neo-grid":
          "linear-gradient(to right, rgba(17,17,17,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
