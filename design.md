# Elav8 Mobile Interface Design

## Product direction

Elav8 is a compact **Business Command Center** for South African informal-business owners who work primarily from a phone. The interface should feel calm, practical, trustworthy, and quietly premium — never corporate, never surveillance-flavoured.

The visual language is a **quiet ledger**: warm paper, hairline precision, editorial numerals, tonal depth instead of drop shadows, and glass trays that float above the surface when something needs attention. Every screen assumes portrait orientation and one-handed use, with the primary action inside the lower reach zone and a minimum touch target of 48dp.

---

## Visual DNA

Six techniques carry the premium feel. They are applied consistently, never decoratively.

1. **Hairline structure.** Layout is organised by 1px lines and tonal shifts, not boxes and shadows.
2. **Recessed wells.** Inputs, OTP boxes, and inventory rows sit *below* the surface (inset), like a ledger printed into the page.
3. **Light edge.** Raised cards earn their lift from a 1px top highlight (`rgba(255,255,255,0.55)`) rather than a shadow.
4. **Editorial numerals.** Money and counts are set in a soft serif with tabular figures — the one place the interface raises its voice.
5. **Radial calm.** Circular gauges, rings, and the petal action cluster replace grids of heavy buttons.
6. **Frosted trays.** Bottom sheets blur the surface beneath them, so context is never fully lost.

---

## Typography

No system defaults. No Inter, Roboto, or Helvetica as primary. Three families, disciplined use.

| Role | Family | Size / Line | Weight | Tracking |
|---|---|---|---|---|
| Wordmark, splash mark | **Fraunces** (variable, SOFT 0, WONK 0) | 34 / 38 | 400 | −0.02em |
| Hero numeral (revenue, day's takings) | **Fraunces** tabular | 40 / 44 | 360 | −0.03em |
| Screen title | **Switzer** | 24 / 30 | 500 | −0.015em |
| Section label | **Switzer** | 11 / 14 | 600 | +0.14em, uppercase |
| Body | **Switzer** | 15 / 22 | 400 | −0.005em |
| Button label | **Switzer** | 14 / 18 | 500 | +0.01em |
| Helper / caption | **Switzer** | 13 / 18 | 400 | 0 |
| Data, OTP, reference numbers | **Spline Sans Mono** tabular | 15 / 20 | 500 | +0.02em |

**Families**
- **Switzer** — neo-grotesque UI face. Carries all labels, body, and controls. Fallback: `"Helvetica Neue", Arial, sans-serif`.
- **Fraunces** — variable serif used only for the wordmark, hero numerals, and empty-state statements. Sets Elav8 apart from every generic fintech UI.
- **Spline Sans Mono** — tabular data, OTP digits, invoice and reference numbers. Guarantees digits never shift width.

**Rules**
- Maximum two weights per screen.
- Hero numeral is the only type above 32pt, and only on Command Center.
- Never letterspace lowercase body copy.
- All currency and quantity figures are tabular and right-aligned.

---

## Brand colours

### Core tokens

| Token | Hex | Intended use |
|---|---|---|
| Paper | `#F7F1E7` | Main warm background, splash negative space |
| Paper Raised | `#FDFAF4` | Cards, trays, elevated paper surfaces |
| Paper Sunken | `#EFE7DA` | Ledger wells, input fills, recessed rows |
| Ink | `#24211D` | Primary text, icon strokes |
| Deep Ledger | `#1A1714` | Splash, Command Center focus surface |
| Deep Raised | `#232019` | Cards on dark surfaces |
| Deep Sunken | `#131110` | Wells on dark surfaces |
| Ochre | `#C28A3D` | Primary actions, revenue card, active indicators |
| Teal | `#176C6A` | Secondary actions, verification, positive states |
| Burgundy | `#7F3F43` | Invoice / send accent, important callouts |
| Moss | `#71805A` | Optional success and supportive accent |
| Sand Line | `#D9CCB8` | Hairline borders and separators |
| Muted Ink | `#766E64` | Secondary text, helper copy |

### Tonal ramps

Depth is built from tone, not opacity hacks. Each family has five stops.

| Family | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| Ochre | `#F0E0C4` | `#E0BC80` | `#C28A3D` | `#8F6229` | `#4A3315` |
| Teal | `#C9E0DF` | `#6FAFAD` | `#176C6A` | `#0F4A48` | `#072726` |
| Burgundy | `#E8CDCF` | `#B77A7E` | `#7F3F43` | `#5A2A2D` | `#2D1416` |
| Moss | `#DDE2D2` | `#A8B48F` | `#71805A` | `#4E5A3C` | `#272E1E` |
| Sand | `#F2ECE0` | `#E7DECF` | `#D9CCB8` | `#B9A98F` | `#8A7C64` |

### Dark-surface accents

| Token | Value | Use |
|---|---|---|
| Ochre glow | `rgba(194,138,61,0.16)` | Active petal fill, focus halo |
| Teal glow | `rgba(23,108,106,0.22)` | Verification ring on Deep Ledger |
| Hairline light | `rgba(247,241,231,0.08)` | Borders on dark surfaces |
| Light edge | `rgba(247,241,231,0.06)` | Top highlight on dark cards |

---

## Layout, grid, and rhythm

- **Base unit:** 8dp. **Gutter rhythm:** 24dp. Screen padding is 24dp horizontal.
- **Grid:** 4-column, 24dp gutters, 12dp inner margins for dense rows.
- **Safe areas:** content never enters the bottom 24dp beyond the home indicator; primary action floats 16dp above it.
- **One-handed reach:** primary action centre-of-mass sits at 68–78% of screen height. Destructive or rare actions sit in the top third.
- **Touch targets:** 48dp minimum, always. Icon-only controls get a 48dp invisible hit area even when the glyph is 20dp.

### Radii

| Element | Radius |
|---|---|
| Primary button | 999 (pill) |
| Secondary button | 999 (pill) |
| Input well | 14dp |
| Card | 20dp |
| Frosted tray | 28dp top corners |
| Petal / chip | 999 |

### Control heights

| Control | Height |
|---|---|
| Primary action | 52dp |
| Secondary action | 48dp |
| Field well | 56dp |
| Segmented rail | 48dp |
| Tab bar | 64dp + safe area |

---

## Depth and surface system

Four levels. Shadows appear at exactly one of them.

| Level | Name | Treatment |
|---|---|---|
| −1 | **Ledger Well** | Fill one ramp step darker than parent. Inset `0 1px 2px rgba(36,33,29,0.08)`. Hairline border `rgba(36,33,29,0.06)`. |
| 0 | **Paper / Deep Ledger** | Flat base surface. No shadow, no border. |
| 1 | **Raised Card** | Fill `Paper Raised` or `Deep Raised`. 1px top light edge. Hairline border `rgba(36,33,29,0.08)` or `rgba(247,241,231,0.08)`. **No shadow.** |
| 2 | **Frosted Tray** | `backdrop-filter: blur(24px) saturate(140%)`. Fill `rgba(253,250,244,0.82)`. Hairline border. Single ambient shadow `0 24px 48px −24px rgba(36,33,29,0.28)`. |

**Surface pairing rules**
- Onboarding, forms, and Inventory live on **Paper**.
- Skyline Splash, Verification, and Command Center live on **Deep Ledger**.
- A screen never mixes both base surfaces. Trays and sheets may cross over.

---

## Component vocabulary

Each component is named so it can be referenced consistently across design and build.

**Ledger Well** — recessed container for inputs, OTP boxes, and inventory rows. Label sits *above* the well, never inside it. Focus state raises the well to a 1.5px Ochre border with a 3dp Ochre glow at 16% — the only place a glow is permitted.

**Segmented Rail** — pill segmented control. Track is a Ledger Well; the selected segment is a Raised Card with a 1px light edge that slides on a 240ms spring. Used for Login/Register, module choice, and inventory filters.

**Field Well** — 56dp input. Label 11pt uppercase Switzer above, helper text 13pt Muted Ink below. Keyboard type is always correct: `tel` for phone, `emailAddress` for email, `decimalPad` for money, `numberPad` for OTP.

**Petal Constellation** — the Command Center quick-action cluster. Six to eight radial petals around a central Ochre core, each petal a soft rounded wedge. Unselected petals sit at `Paper Sunken` equivalent on dark; selected petals fill with Ochre glow. Micro-labels orbit at the outer edge in 11pt uppercase Switzer. Replaces the original "radar actions".

**Aperture Ring** — circular progress ring, 3dp stroke, used for verification status, pending approval, and the day's takings gauge. Track is a hairline; progress is Teal or Ochre. Numerals sit centred in Fraunces tabular.

**Hairline Ledger Row** — inventory row. Left: item name (Switzer 15). Right: selling price (Spline Sans Mono tabular 15) and cost price beneath in Muted Ink 13. Low-stock rows carry a 3dp Ochre or Burgundy bar flush to the left edge, inset from the card radius. Row separators are 1px Sand Line, never full-bleed — they stop 24dp from the right edge.

**Signal Pill** — status chip. Examples: Weekend Free, Low stock, Pending. 28dp tall, 999 radius, tonal fill at ramp 100 with text at ramp 700.

**Frosted Tray** — bottom sheet used for Customize columns, the AI reminder draft, and reorder confirmation. Drag handle is a 36×4dp Sand Line capsule, 12dp from the top edge. Content scrolls beneath a fixed action row.

**Quiet Tab Bar** — 64dp, hairline top border, no drop shadow. Four tabs: Command Center, Inventory, Money, Profile. Active tab is marked by a 4dp Ochre dot above the label plus an Ink label; inactive labels are Muted Ink at 90% opacity. Icons are 20dp, 1.5dp stroke, no fills.

**Ghost Action** — 48dp secondary text button, no fill, Teal label, hairline border only on hover-equivalent pressed state. Used for *Do this later*, *Check Status*, *Forgot password*.

---

## Motion and haptics

Motion is added only after the functional flow is stable. Nothing animates on first render except the splash.

| Event | Motion | Duration / Easing |
|---|---|---|
| Screen transition | Fade-through | 240ms · `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Onboarding step change | Shared-axis X, +26dp | 280ms · same easing |
| Petal unfold (Command Center entry) | Scale 0.92 → 1, opacity 0 → 1, staggered | 420ms · 36ms stagger · `cubic-bezier(0.16, 1, 0.3, 1)` |
| Frosted Tray present | TranslateY 100% → 0, backdrop fade | 320ms / 200ms |
| Segmented Rail selection | Spring slide | 240ms |
| Press feedback | Scale 0.985 + tonal shift | 90ms |
| Success (verification, reorder) | Aperture Ring sweep 0 → 100% | 600ms |

**Haptics map**

| Action | Haptic |
|---|---|
| Segment change | Selection tick |
| OTP digit entered | Light impact |
| Validation error | Rigid impact |
| Reorder confirmed | Soft medium impact |
| Verification success | Success notification |

No sound. Ever.

---

## Screen list

| Screen | Composition and behaviour |
|---|---|
| **Skyline Splash** | Deep Ledger base. Three-plane portrait skyline silhouette — deep ledger, muted ochre, sand — lower third richest, centre third quiet. Centred Elav8 wordmark in Fraunces 34pt. A single 2dp Ochre progress hairline beneath the mark. Fades to Login at 900ms. |
| **Login** | Paper base. Fraunces greeting ("Welcome back"), Segmented Rail for Log In / Register. Two Field Wells: phone-or-email, password. Ochre pill primary. Ghost Actions for *Forgot password* and *Create a Business Account*. |
| **Forgot Password** | Paper base. Single Field Well for phone. Teal pill for *Send recovery code*. Ghost Action back to Login. Helper copy confirms the number the code was sent to. |
| **Verify and Reset** | Deep Ledger base. Four Ledger Well OTP boxes in Spline Sans Mono. New-password Field Wells reveal only after all four digits are entered, with a 180ms fade-through. Aperture Ring shows code validity. |
| **Welcome** | Paper base. Fraunces statement headline, then R10/day and trial copy in Switzer body. Compact two-plane skyline/spaza illustration bleeding off the right edge. Ochre pill *Start*. |
| **Identity and Contact** | Paper base. Stack of Field Wells: full name, date of birth, phone, email, physical address, optional website. Correct keyboard per field. Continue sits in the lower reach zone and stays disabled until required fields validate. |
| **Industry** | Paper base. Two-column tile grid, 20dp radius cards, 1.5dp stroke. Selected tile fills Ochre 100 with an Ochre 700 label and a 1px Ochre border. Includes *Other*. |
| **Business Setup** | Paper base. Business name Field Well. Registration toggle with a conditional registration-number Field Well that expands in place. Address toggle with conditional address Field Well. Segmented Rail for module choice: Jobs & Invoices / Stock & Prices / Both. |
| **Inventory Setup** | Paper base. Ledger Well rows with item name, selling price, cost price. Hairline separators. *Add More* appends one row at a time with a 180ms shared-axis push. *Customize* opens the Frosted Tray for renaming visible column labels. *Done* stays hidden until every field in every visible row is populated. *Do this later* is always available as a Ghost Action. |
| **Consent** | Paper base. Four stacked consent cards, each a Raised Card with a 20dp checkbox. EULA and acknowledgement are required; SMS consent and data-sharing opt-in are optional and visually identical until checked. Ochre pill *Submit & Verify*. |
| **Verification** | Deep Ledger base. Aperture Ring centred, four OTP Ledger Wells beneath. Teal pill *Verify*. Ghost Action *Verify via WhatsApp*. Ring fills Teal on success. |
| **Pending Approval** | Deep Ledger base. Bronze shield rendered as a three-plane shield with a hairline edge, centred. Vetting message in Switzer body. Ochre pill *Notify Me*. Ghost Action *Check Status*. |
| **Command Center** | Deep Ledger base. Top bar with business name and a Signal Pill for Weekend Free. Revenue card is the single hero: Fraunces tabular numeral, Ochre glow behind it, 7-day sparkline hairline beneath. Petal Constellation for Add Sale, Add Stock, Send Invoice, Draft WhatsApp. Local AI reminder draft module as a Raised Card on deep surface. Quiet Tab Bar. |
| **Inventory Tab** | Paper base. Segmented Rail filter pills across the top. Hairline Ledger Rows with low-stock left accent bars. Swipe reveals *Reorder*; tap opens a Frosted Tray confirmation. Local confirmation state only. |
| **Profile Tab** | Paper base. Raised Cards grouped as Business Settings and Privacy Preferences. *Download my data* and *Delete my data* render as local prototype feedback, clearly labelled as such. |

---

## Navigation and key flows

### Returning business owner
Open → Skyline Splash → Login → phone/email + password → **Log In** → Command Center.

### New business owner
Open → Login → **Create a Business Account** → Welcome → Identity and Contact → Industry → Business Setup → Inventory Setup *(only when Stock & Prices or Both is selected)* → Consent → Verification → Pending Approval.

### Conditional inventory flow
- **Jobs & Invoices** → Inventory Setup is skipped entirely.
- **Stock & Prices** → three initial rows.
- **Both** → two initial rows.
- **Add More** reveals exactly one additional row per tap.
- **Customize** opens the Frosted Tray to rename visible column labels.
- **Done** remains hidden until every field in every visible row is populated.
- **Do this later** is always available and routes straight to Consent.

### Dashboard quick action
Command Center → tap a petal (Add Sale, Add Stock, Send Invoice) → petal fills with Ochre glow → local prototype confirmation toast in a Raised Card on deep surface.

*Draft WhatsApp* → Frosted Tray opens with a clearly labelled **example payment-reminder draft**. Copy states plainly that nothing is sent. No provider integration is implied.

### Inventory reorder
Inventory → optional Segmented Rail filter → tap or swipe a low-stock row → Frosted Tray confirmation → *Reorder* → soft medium haptic and a local confirmation state. Stock level decrements locally.

---

## Splash screen direction

A **portrait, stylised skyline illustration**, not a photograph and not a vector cliché.

- **Three planes only.** Foreground in Deep Ledger, midground in Ochre 700 at 40%, background in Sand 500 at 25%. No gradients between planes.
- **Blended South African urban silhouette.** Restrained references to Johannesburg high-rise density, Cape Town mountain geometry, and Durban coastal atmosphere. Never labelled, never a specific skyline.
- **Composition.** Lower third visually richest. Centre third deliberately quiet so the Elav8 mark and loading hairline stay legible. Upper third is near-empty Deep Ledger.
- **Mark.** Elav8 wordmark centred in Fraunces 34pt, Paper colour, with a 2dp Ochre loading hairline 24dp beneath it.
- **Forbidden.** No baked-in text, no flags, no clichés, no photographic texture, no heavy detail, no more than three colours.
- **Exit.** Fades to Login at 900ms. If load exceeds 1200ms, the hairline loops with a 40% → 100% opacity breath, 1600ms ease-in-out.

---

## Content standards

No chunky grey placeholder blocks anywhere in the prototype. Every surface renders real, plausible content.

**Sample inventory items**
> Airtime R5 · Brown bread · 2L cold drink · Paraffin 1L · Cool drink crate · Maize meal 5kg · Snack pack · Phone charger

**Currency formatting**
> `R 1 250,00` — space as thousands separator, comma as decimal, `R` followed by a space. Always tabular.

**Phone formatting**
> `+27 82 123 4567`

**Micro-copy tone**
Plain, warm, second person. "Your takings today." Not "Total revenue metrics."

**Empty states**
A Fraunces single-line statement plus one Switzer sentence and one Ghost Action. Never an illustration plus a shrug.

**Prototype honesty**
Any action that would require a real provider says so in the component itself, in Muted Ink 13pt. The prototype never claims to send, verify, or sync.

---

## Accessibility

- Body and helper text meet 4.5:1 against their surface. Muted Ink on Paper is 4.6:1 — never lighten it further.
- Ochre on Paper is used for fills and strokes, not for small text. Ochre 700 is the text-safe stop.
- Focus states are always visible: 1.5px Ochre border plus a 3dp glow at 16%.
- All controls are operable at 48dp with one thumb.
- Reduced-motion preference collapses petal unfold, tray translate, and screen transitions to a 120ms cross-fade.
- Validation is never colour-only. Every error carries an icon and a sentence.

---

## MVP data model

Local-only prototype state. No cloud synchronisation and no real provider integration in this build.

`authMode` · `onboardingStep` · `profile` · `industry` · `moduleChoice` · `registrationDetails` · `businessLocation` · `inventoryRows` · `inventoryHeaders` · `consents` · `verificationStatus` · `approvalStatus` · `inventoryItems` · `lastActionMessage`

**Supporting view state**
`activeTab` · `inventoryFilter` · `trayOpen` · `trayMode` · `reducedMotion` · `hapticEnabled`

---

## Implementation notes (this codebase)

Where the build necessarily differs from the brief, the substitution is deliberate and reversible.

**Font files.** Fraunces ships as static instances via `@expo-google-fonts/fraunces`, so the variable axes (`SOFT`, `WONK`) and the 360 hero weight are not selectable. The build uses `Fraunces_400Regular` for the wordmark, hero numerals, and empty states — the closest static cut. `Switzer` is not distributable through Expo/Google Fonts, so `Archivo` (`@expo-google-fonts/archivo`) stands in for it as the neo-grotesque UI face; `SplineSansMono_500Medium` covers tabular data. Every role maps through `fontFamily` in `constants/theme.ts`, so swapping in licensed Switzer files is a one-line change per role.

**Inset shadows.** React Native has no `box-shadow: inset`. A Ledger Well is built from a one-ramp-darker fill plus a top hairline (`rgba(36,33,29,0.06)`) and a 1px bottom light hairline, which reads as recessed without a shadow.

**Frosted tray.** `blur(24px)` is `expo-blur`'s `BlurView` with `intensity` ≈ 60 and `tint="light"`, layered over an `rgba(253,250,244,0.82)` fill so the result matches the spec on both web and native.

**Backend.** The brief specifies local-only prototype state; this project already has a Neon-backed tRPC/Drizzle API, so persisted things (sales, inventory, invoices) use the real API and are labelled honestly. Provider-dependent actions (WhatsApp drafts, data export, deletion, verification) stay local and say so in the component copy.

**Reduced motion.** `reducedMotion` and `hapticEnabled` persist through AsyncStorage (`lib/prefs.tsx`) and collapse petal unfold, tray translate, and screen transitions to a 120ms cross-fade.
