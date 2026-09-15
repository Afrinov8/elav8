/**
 * Elav8 brand tokens — kept in sync with constants/theme.ts (see design.md).
 * This is the class-name mirror; StyleSheet consumers should import from
 * constants/theme instead of duplicating values here.
 */
const colors = {
  paper: { DEFAULT: "#F7F1E7", raised: "#FDFAF4", sunken: "#EFE7DA" },
  deep: { DEFAULT: "#1A1714", ledger: "#1A1714", raised: "#232019", sunken: "#131110" },
  ink: { DEFAULT: "#24211D", muted: "#766E64" },
  ochre: { DEFAULT: "#C28A3D", 100: "#F0E0C4", 300: "#E0BC80", 500: "#C28A3D", 700: "#8F6229", 900: "#4A3315", deep: "#A8752F" },
  teal: { DEFAULT: "#176C6A", 100: "#C9E0DF", 300: "#6FAFAD", 500: "#176C6A", 700: "#0F4A48", 900: "#072726" },
  burgundy: { DEFAULT: "#7F3F43", 100: "#E8CDCF", 300: "#B77A7E", 500: "#7F3F43", 700: "#5A2A2D", 900: "#2D1416" },
  moss: { DEFAULT: "#71805A", 100: "#DDE2D2", 300: "#A8B48F", 500: "#71805A", 700: "#4E5A3C", 900: "#272E1E" },
  sand: { DEFAULT: "#D9CCB8", 100: "#F2ECE0", 300: "#E7DECF", 500: "#D9CCB8", 700: "#B9A98F", 900: "#8A7C64" },
  line: "#D9CCB8",
  background: "#F7F1E7",
  foreground: "#24211D",
};

const borderRadius = { well: 14, card: 20, tray: 28, pill: 999 };

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius,
      minHeight: { touch: 48, primary: 52, field: 56 },
    },
  },
  plugins: [],
};
