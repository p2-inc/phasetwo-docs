/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: { preflight: false },
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      /**
       * Responsive breakpoints (site-wide)
       * Matches the breakpoint tokens in `src/css/custom.css`
       * (`--breakpoint-small-down` / `--breakpoint-medium-down`).
       */
      screens: {
        "bp-600": { max: "600px" },
        "bp-767": { max: "767px" },
      },
      colors: {
        p2blue: {
          200: "#ebf5fc",
          300: "#58ade7",
          400: "#65b4e9",
          500: "#3fa1e3",
          600: "#2695df",
          700: "#1f8dd7",
          800: "#1a74b1",
        },
        secondary: {
          400: "#d252b5",
          500: "#d252b5",
          600: "#c03da3",
        },
      },
      fontFamily: {
        sans: ['"Manrope"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
      },
    },
  },
  plugins: [
    plugin(function({ addComponents, theme }) {
      addComponents({
        // Link styles
        '.link-primary': {
          lineHeight: '1.5',
          fontWeight: '500',
          fontFamily: theme('fontFamily.sans'),
          color: theme('colors.white'),
          '&:hover': {
            color: theme('colors.p2blue.400'),
          },
        },
        '.link-secondary': {
          fontSize: '14px',
          lineHeight: '1.5',
          fontWeight: '500',
          fontFamily: theme('fontFamily.sans'),
          color: theme('colors.white'),
          '&:hover': {
            color: theme('colors.secondary.400'),
          },
        },
      });
    }),
  ],
};
