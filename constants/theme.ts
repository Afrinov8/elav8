import { Platform } from "react-native";

/**
 * Elav8 brand tokens — warm paper, deep ink, ochre/teal/burgundy/moss accents.
 * See design.md for the source spec. Single palette by design (no dark mode
 * variant defined in the brief yet), reused for both color schemes so
 * existing `useColorScheme`-based consumers keep working.
 */
export const palette = {
  paper: "#F7F1E7",
  card: "#FFFDF9",
  ink: "#24211D",
  mutedInk: "#766E64",
  sandLine: "#D9CCB8",
  ochre: "#C28A3D",
  ochreDeep: "#A8752F",
  teal: "#176C6A",
  burgundy: "#7F3F43",
  moss: "#71805A",
  white: "#FFFFFF",
} as const;

export type ColorScheme = "light" | "dark";

type RuntimePalette = {
  text: string;
  background: string;
  surface: string;
  primary: string;
  tint: string;
  icon: string;
  muted: string;
  border: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

const runtime: RuntimePalette = {
  text: palette.ink,
  background: palette.paper,
  surface: palette.card,
  primary: palette.ochre,
  tint: palette.ochre,
  icon: palette.mutedInk,
  muted: palette.mutedInk,
  border: palette.sandLine,
  tabIconDefault: palette.mutedInk,
  tabIconSelected: palette.ochre,
};

export const Colors: Record<ColorScheme, RuntimePalette> = {
  light: runtime,
  dark: runtime,
};

export const SchemeColors: Record<ColorScheme, Record<string, string>> = {
  light: { ...palette },
  dark: { ...palette },
};

export type ThemeColorPalette = RuntimePalette;

export const type = {
  display: { fontFamily: "Fraunces_700Bold", maxSize: 32 },
  header: { fontFamily: "Fraunces_700Bold", size: 24 },
  body: { fontFamily: "SpaceGrotesk_400Regular", size: 15 },
  bodyMedium: { fontFamily: "SpaceGrotesk_500Medium", size: 15 },
  label: { fontFamily: "SpaceGrotesk_500Medium", size: 14 },
  input: { fontFamily: "SpaceGrotesk_400Regular", size: 16 },
};

export const radius = { sm: 6, md: 8, lg: 12, pill: 999 };
export const spacing = (n: number) => n * 4;

export const Fonts = Platform.select({
  ios: { sans: "system-ui", serif: "ui-serif", rounded: "ui-rounded", mono: "ui-monospace" },
  default: { sans: "normal", serif: "serif", rounded: "normal", mono: "monospace" },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
