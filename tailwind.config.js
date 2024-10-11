/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: { preflight: false },
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};
