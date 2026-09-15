import { Platform, type TextStyle } from "react-native";

/**
 * Elav8 design tokens — the single source of truth for the "quiet ledger"
 * language described in design.md.
 *
 * Nothing in the app should hardcode a hex, a radius, a control height, or a
 * type size. Compose screens from these tokens plus the components in
 * components/ui so the visual system stays consistent.
 */

/* ------------------------------------------------------------------ *
 * Families
 * ------------------------------------------------------------------ */

/**
 * Switzer is not distributable through Expo/Google Fonts, so Archivo carries
 * the neo-grotesque UI role (see "Implementation notes" in design.md).
 */
export const fontFamily = {
  /** Fraunces — wordmark, hero numerals, empty-state statements only. */
  display: "Fraunces_400Regular",
  displayEmphasis: "Fraunces_600SemiBold",
  /** Neo-grotesque UI face — labels, body, controls. */
  sans: "Archivo_400Regular",
  sansMedium: "Archivo_500Medium",
  sansSemibold: "Archivo_600SemiBold",
  /** Tabular data — money, OTP digits, quantities, reference numbers. */
  mono: "SplineSansMono_500Medium",
  monoRegular: "SplineSansMono_400Regular",
} as const;

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

export const palette = {
  /* Paper surfaces (onboarding, forms, Inventory, Profile) */
  paper: "#F7F1E7",
  paperRaised: "#FDFAF4",
  paperSunken: "#EFE7DA",
  /* Ink + deep surfaces (Skyline Splash, Verification, Command Center) */
  ink: "#24211D",
  deepLedger: "#1A1714",
  deepRaised: "#232019",
  deepSunken: "#131110",
  /* Accents */
  ochre: "#C28A3D",
  ochreDeep: "#A8752F",
  teal: "#176C6A",
  burgundy: "#7F3F43",
  moss: "#71805A",
  /* Structure */
  sandLine: "#D9CCB8",
  mutedInk: "#766E64",
  white: "#FFFFFF",
  /** @deprecated use paperRaised — kept so older call sites keep compiling. */
  card: "#FDFAF4",
} as const;

export type RampStop = 100 | 300 | 500 | 700 | 900;

/** Depth comes from tone, never from opacity hacks. */
export const ramp: Record<"ochre" | "teal" | "burgundy" | "moss" | "sand", Record<RampStop, string>> = {
  ochre: { 100: "#F0E0C4", 300: "#E0BC80", 500: "#C28A3D", 700: "#8F6229", 900: "#4A3315" },
  teal: { 100: "#C9E0DF", 300: "#6FAFAD", 500: "#176C6A", 700: "#0F4A48", 900: "#072726" },
  burgundy: { 100: "#E8CDCF", 300: "#B77A7E", 500: "#7F3F43", 700: "#5A2A2D", 900: "#2D1416" },
  moss: { 100: "#DDE2D2", 300: "#A8B48F", 500: "#71805A", 700: "#4E5A3C", 900: "#272E1E" },
  sand: { 100: "#F2ECE0", 300: "#E7DECF", 500: "#D9CCB8", 700: "#B9A98F", 900: "#8A7C64" },
};

/** Accents that only exist on Deep Ledger surfaces. */
export const onDark = {
  ochreGlow: "rgba(194,138,61,0.16)",
  tealGlow: "rgba(23,108,106,0.22)",
  hairline: "rgba(247,241,231,0.08)",
  hairlineStrong: "rgba(247,241,231,0.14)",
  lightEdge: "rgba(247,241,231,0.06)",
  text: "#F7F1E7",
  textMuted: "rgba(247,241,231,0.62)",
  textFaint: "rgba(247,241,231,0.38)",
  sparkline: "rgba(247,241,231,0.42)",
} as const;

/** Structure hairlines and edges on Paper surfaces. */
export const onLight = {
  hairline: "rgba(36,33,29,0.08)",
  hairlineSoft: "rgba(36,33,29,0.06)",
  lightEdge: "rgba(255,255,255,0.55)",
  wellTop: "rgba(36,33,29,0.06)",
  wellBottom: "rgba(255,255,255,0.6)",
  focus: "rgba(194,138,61,0.16)",
  scrim: "rgba(26,23,20,0.42)",
} as const;

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

export const radius = {
  pill: 999,
  well: 14,
  card: 20,
  tray: 28,
  /** @deprecated use radius.well / radius.card — legacy call sites only. */
  sm: 6,
  md: 14,
  lg: 20,
} as const;

export const control = {
  primary: 52,
  secondary: 48,
  field: 56,
  rail: 48,
  tabBar: 64,
  minTouch: 48,
} as const;

export const layout = {
  base: 8,
  gutter: 24,
  screen: 24,
  rowInset: 12,
  safeBottom: 24,
  floatingAction: 16,
  /** Right-edge inset for hairline separators. */
  separatorInset: 24,
  /** Max content width on wide (web/tablet) viewports. */
  maxWidth: 520,
} as const;

const token = (style: TextStyle) => style;

/* ------------------------------------------------------------------ *
 * Type scale
 * ------------------------------------------------------------------ */

export const type = {
  wordmark: token({ fontFamily: fontFamily.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.68 }),
  hero: token({
    fontFamily: fontFamily.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"],
  }),
  title: token({ fontFamily: fontFamily.sansMedium, fontSize: 24, lineHeight: 30, letterSpacing: -0.36 }),
  sectionLabel: token({
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.54,
    textTransform: "uppercase",
  }),
  body: token({ fontFamily: fontFamily.sans, fontSize: 15, lineHeight: 22, letterSpacing: -0.075 }),
  button: token({ fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 18, letterSpacing: 0.14 }),
  helper: token({ fontFamily: fontFamily.sans, fontSize: 13, lineHeight: 18 }),
  data: token({
    fontFamily: fontFamily.mono,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
  }),
  dataSmall: token({
    fontFamily: fontFamily.mono,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.26,
    fontVariant: ["tabular-nums"],
  }),
  /* Legacy aliases so existing imports keep working. */
  display: token({ fontFamily: fontFamily.display, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 }),
  header: token({ fontFamily: fontFamily.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.36 }),
  label: token({ fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 18 }),
  input: token({ fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 22 }),
} as const;

/* ------------------------------------------------------------------ *
 * Depth
 * ------------------------------------------------------------------ */

/**
 * Level −1 Ledger Well / level 1 Raised Card. React Native has no inset
 * shadow, so wells read as recessed through fill tone plus hairlines.
 */
export const depth = {
  wellPaper: {
    backgroundColor: palette.paperSunken,
    borderTopWidth: 1,
    borderTopColor: onLight.wellTop,
    borderBottomWidth: 1,
    borderBottomColor: onLight.wellBottom,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: onLight.hairlineSoft,
    borderRightColor: onLight.hairlineSoft,
  },
  wellDeep: {
    backgroundColor: palette.deepSunken,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.35)",
    borderBottomWidth: 1,
    borderBottomColor: onDark.lightEdge,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: onDark.hairline,
    borderRightColor: onDark.hairline,
  },
  cardPaper: {
    backgroundColor: palette.paperRaised,
    borderTopWidth: 1,
    borderTopColor: onLight.lightEdge,
    borderBottomWidth: 1,
    borderBottomColor: onLight.hairline,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: onLight.hairline,
    borderRightColor: onLight.hairline,
  },
  cardDeep: {
    backgroundColor: palette.deepRaised,
    borderTopWidth: 1,
    borderTopColor: onDark.lightEdge,
    borderBottomWidth: 1,
    borderBottomColor: onDark.hairline,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: onDark.hairline,
    borderRightColor: onDark.hairline,
  },
} as const;

/* ------------------------------------------------------------------ *
 * Motion
 * ------------------------------------------------------------------ */

export const motion = {
  /** cubic-bezier(0.2, 0.8, 0.2, 1) */
  standard: { duration: 240, easing: [0.2, 0.8, 0.2, 1] as const },
  /** cubic-bezier(0.16, 1, 0.3, 1) */
  enter: { duration: 420, easing: [0.16, 1, 0.3, 1] as const },
  fadeThrough: 240,
  onboardingStep: 280,
  petalStagger: 36,
  trayPresent: 320,
  trayBackdrop: 200,
  railSlide: 240,
  press: 90,
  ringSweep: 600,
  /** Reduced-motion cross-fade. */
  reduced: 120,
  splashHold: 900,
  splashSlowLoad: 1200,
} as const;

export const pressFeedback = { scale: 0.985 } as const;

/* ------------------------------------------------------------------ *
 * Formatting helpers used with the type scale above
 * ------------------------------------------------------------------ */

/** R 1 250,00 — space thousands, comma decimal, `R` + space. */
export function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return "R 0,00";
  const [whole, decimals] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "-" : ""}R ${grouped},${decimals}`;
}

/** +27 82 123 4567 */
export function formatPhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  const local = digits.startsWith("+27") ? digits.slice(3) : digits.replace(/^0/, "");
  if (local.length < 9) return value;
  return `+27 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`;
}

/* ------------------------------------------------------------------ *
 * Legacy exports — used by hooks/use-colors and older call sites
 * ------------------------------------------------------------------ */

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
  surface: palette.paperRaised,
  primary: palette.ochre,
  tint: palette.ochre,
  icon: palette.mutedInk,
  muted: palette.mutedInk,
  border: palette.sandLine,
  tabIconDefault: palette.mutedInk,
  tabIconSelected: palette.ochre,
};

export const Colors: Record<ColorScheme, RuntimePalette> = { light: runtime, dark: runtime };

export const SchemeColors: Record<ColorScheme, Record<string, string>> = {
  light: { ...palette },
  dark: { ...palette },
};

export type ThemeColorPalette = RuntimePalette;

/** Base-8 spacing scale. */
export const space = {
  1: layout.base,
  2: layout.base * 2,
  3: layout.base * 3,
  4: layout.base * 4,
  6: layout.base * 6,
  8: layout.base * 8,
} as const;

export const spacing = (n: number) => n * layout.base;

export const Fonts = Platform.select({
  ios: { sans: fontFamily.sans, serif: fontFamily.display, rounded: fontFamily.sans, mono: fontFamily.mono },
  default: { sans: fontFamily.sans, serif: fontFamily.display, rounded: fontFamily.sans, mono: fontFamily.mono },
  web: {
    sans: `'Archivo', "Helvetica Neue", Arial, sans-serif`,
    serif: `'Fraunces', Georgia, serif`,
    rounded: `'Archivo', "Helvetica Neue", Arial, sans-serif`,
    mono: `'Spline Sans Mono', ui-monospace, monospace`,
  },
});
