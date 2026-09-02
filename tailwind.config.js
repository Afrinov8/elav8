/** Elav8 brand tokens — kept in sync with constants/theme.ts palette. */
const colors = {
  paper: "#F7F1E7",
  card: "#FFFDF9",
  ink: "#24211D",
  "muted-ink": "#766E64",
  "sand-line": "#D9CCB8",
  ochre: "#C28A3D",
  "ochre-deep": "#A8752F",
  teal: "#176C6A",
  burgundy: "#7F3F43",
  moss: "#71805A",
  background: "#F7F1E7",
  foreground: "#24211D",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};
