const defaultTheme = require("tailwindcss/defaultTheme");
const { blackA } = require("@radix-ui/colors");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        night: {
          100: "#DADADA",
          200: "#AAAAAA",
          300: "#717171",
          400: "#494949",
          500: "#1E1E20",
          600: "#141414",
          700: "#090909",
        },
        day: {
          100: "#F7F5FF",
          200: "#E4E4FB",
          300: "#DDDDF4",
          400: "#D0D0E8",
          500: "#9696E0",
          600: "#8c6eff",
          700: "#6A44FF",
        },
        accent: {
          purple: "#6A44FF",
          pink: "#F183FF",
          yellow: "#FFBE3F",
          "yellow-muted": "#FFD262",
          red: "#EF5A5A",
        },
        ...blackA,
      },
      fontFamily: {
        sans: ["Nunito Sans", ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        "8xl": "1440px",
      },
      borderWidth: {
        1: "1px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-radix")],
};
