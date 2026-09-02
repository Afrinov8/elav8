// Elav8 ships a single warm palette (see design.md) — no dark-mode variant
// is defined yet, so this always resolves to "light".
export function useColorScheme(): "light" {
  return "light";
}
