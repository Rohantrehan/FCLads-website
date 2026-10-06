---
name: Apex Pitch UI
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#191c20'
  surface-container: '#1d2024'
  surface-container-high: '#282a2f'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#bbcbbd'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2e3035'
  outline: '#859488'
  outline-variant: '#3c4a40'
  surface-tint: '#38e192'
  primary: '#54f6a5'
  on-primary: '#003920'
  primary-container: '#2bd98b'
  on-primary-container: '#005935'
  inverse-primary: '#006d41'
  secondary: '#78d9b3'
  on-secondary: '#003828'
  secondary-container: '#007a5a'
  on-secondary-container: '#9fffd8'
  tertiary: '#c9dbff'
  on-tertiary: '#003061'
  tertiary-container: '#9bc0ff'
  on-tertiary-container: '#004d95'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#5efeac'
  primary-fixed-dim: '#38e192'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#005230'
  secondary-fixed: '#94f5ce'
  secondary-fixed-dim: '#78d9b3'
  on-secondary-fixed: '#002116'
  on-secondary-fixed-variant: '#00513b'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a8c8ff'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#004689'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  hero-display:
    fontFamily: Sora
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 84px
    letterSpacing: 0.06em
  hero-display-mobile:
    fontFamily: Sora
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: 0.04em
  headline-xl:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: 0.03em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Sora
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.5rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the high-voltage atmosphere of next-generation console sports simulation, specifically catering to the prestige, anticipation, and data-dense thrill of competitive team building. Targeted at modern football gamers and esports competitors, the experience strikes a balance between hyper-premium luxury and aggressive athletic technology. 

Drawing from modern dark glassmorphism, dynamic sports broadcast design, and tactical luxury gaming interfaces, the visual narrative evokes the visceral feeling of stepping onto an illuminated stadium pitch at night: razor-sharp focus, pitch-black depth, gleaming iridescent trophies, and glowing tactile hardware. Interfaces behave like physical glass and holographic carbon slabs floating above atmospheric stadium voids, accented by sharp kinetic slants, high-gloss foils, and hyper-responsive controller focus states.

## Colors

The palette is engineered around pure atmospheric contrast, relying on deep near-black fields illuminated by vibrant athletic neons and metallic foil treatments:

- **Canvas & Voids**: The base canvas is `#07090D` (Pitch Black). Background depth layers weave through `#0B1220` (Deep Stadium Navy) and `#0A1F1C` (Deep Tactical Teal).
- **Glass Surfaces**: Container panels employ `rgba(15, 20, 27, 0.80)` with subtle specular highlight strokes of `rgba(255, 255, 255, 0.08)`.
- **Primary Athletic Green (`#2BD98B`) & Mint Accent (`#8FF0C9`)**: The core pulse of the brand. Mint acts as the high-energy focal point for active controller selections, player ratings, and kinetic energy pulses.
- **Azure Pulse (`#1E8BFF`)**: Used exclusively for strategic tactical tags, positional chips (e.g., CAM, CB), competitive rank emblems, and active matchmaking status.
- **Gold & Promo Radiance (`#D8B25A`)**: Reserved for apex rewards, legendary collectible tier assets, pack opening sequences, and promotional glass gradients (`linear-gradient(135deg, #0E2A22 0%, #08160F 100%)` infused with metallic gold striations).
- **Iridescent CTA Gradient**: High-priority interactive triggers use a distinct triple-spectrum sheen transitioning from `#FFFFFF` through `#E4DCFF` to `#C9F5E6`, paired with dark obsidian text for maximum press-down affordance.

## Typography

The typographic hierarchy separates high-impact visual commands from analytical sports intelligence:

- **Display & Section Titles (Sora)**: Rendered in aggressive, wide, all-caps treatments (`text-transform: uppercase`). Extended kerning reinforces the wide-aspect broadcast aesthetic found in premium sports titles.
- **Body & Editorial (Manrope)**: Delivers geometric clarity and neutral readability for squad descriptions, tactical directives, and transfer market summaries.
- **Analytical & Stat Tiers (JetBrains Mono)**: Numbers dictate the pitch. All player attributes (PAC, SHO, PAS, DRI, DEF, PHY), coin balances, match clocks, and overall ratings (OVR) are set in monospaced/tabular figures to avoid layout jitter during live-tick recalculations.

## Layout & Spacing

The layout is built for 1440px+ widescreen displays, optimized for console gamepad snap-navigation and high-end desktop web control:

- **Canvas Grid**: A 12-column structured layout with wide horizontal safe gutters (`gutter-desktop: 2rem`) and dynamic lateral gutters to account for edge-pinned menu tickers and gamepad trigger indicators (L1/R1).
- **Rhythm**: Spacing follows an absolute 4px/8px geometric cadence. Content density is optimized to keep player cards, active squad formations, and sub-panels within a single viewport without requiring scrolling.
- **Reflow & Responsive Adaptations**:
  - *Desktop (1440px+)*: Multi-panel horizontal carousels with 16:9 contextual overlays and tall 3:4 content panes.
  - *Tablet / Small Screen (1024px)*: 8-column layout; player stats panel morphs into an anchored bottom sheet.
  - *Mobile (375px - 768px)*: Single-column continuous snap-scroll, cards adopt horizontal compact rows with tabular numbers pinned right.

## Elevation & Depth

Visual hierarchy does not use soft natural shadows; it is driven by light refraction, physical glass density, and directional luminescence:

- **Layer 0 (Stadium Void)**: Canvas base (`#07090D`) with atmospheric radial gradients originating from the screen corners (`#0B1220` navy top-left, `#0A1F1C` deep teal bottom-right).
- **Layer 1 (Glass Substrates)**: Floating panels with `background: rgba(15, 20, 27, 0.80)`, `backdrop-filter: blur(20px)`, and a structural 1px outer stroke of `rgba(255, 255, 255, 0.08)`.
- **Layer 2 (Raised Tiles & Pack Podiums)**: Interactive cards feature subtle top-edge rim lighting via an inner highlight: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15)`.
- **Layer 3 (Gamepad Focus & Selection Glow)**: Selected or focused elements expand slightly (`scale(1.03)`) and emit an electric mint aura: `box-shadow: 0 0 0 2px #8FF0C9, 0 8px 30px rgba(143, 240, 201, 0.35)`.

## Shapes

The geometric signature is precise, technical, and kinetic. Roundedness is strictly constrained to Level 1 (`roundedness: 1`), keeping radii between 4px (`0.25rem`) and 8px (`0.5rem`) to maintain an engineered, tactical console aesthetic.

- **Dynamic Parallelogram Accents**: Section tags, category banners, and active tab indicators leverage a `-12deg` CSS `transform: skewX(-12deg)` shear to express forward momentum.
- **Cut Corners & Shield Silhouettes**: Collectible player cards ditch standard rounded rectangles for custom hexagonal and shield silhouettes, sporting angled 45-degree chamfered shoulders.
- **Azure Corner Tags**: Triangular corner clips pinned to card headers indicate dynamic live-form status, loan match counts, or team chemistry links.

## Components

### Action Triggers & Buttons
- **Iridescent Master CTA**: Pill or angled-edge chassis filled with `linear-gradient(90deg, #FFFFFF 0%, #E4DCFF 48%, #C9F5E6 100%)`. Typography is deep black `#07090D`, heavy Sora uppercase. Interactive states: scale up by 2%, interior shimmer shift.
- **Secondary Glass Action**: Semi-translucent base (`rgba(255, 255, 255, 0.06)`), 1px border `rgba(255, 255, 255, 0.12)`, text in pure white. On focus: border turns solid `#8FF0C9` with ambient mint glow.

### Collectible Shield Cards (Player Items)
- **Geometry**: Tall vertical aspect ratio (roughly 1:1.45) with top cut shoulders and tapered bottom chevron shield.
- **Surface**: Tiered materials. Gold rare features diagonal micro-lines with gold foil streaks; promo items transition from `#0E2A22` to `#08160F`.
- **HUD Overlays**: Top-left vertical stack holds large tabular OVR (80-99) above primary position label (e.g., ST, RW). Bottom third carries dynamic stats grid in 2x3 monospaced tabular columns.

### Content Cards & Match Tiles
- **Glass Tiles**: 80% opacity `#0F141B`, with faint stadium photography or dynamic player renders bleeding beneath.
- **Corner Notches**: Pinned top-right azure badge (`#1E8BFF`) for competition categorization (e.g., "CHAMPIONS PLAY-OFFS").

### Lists & Transfer Market Rows
- **Tactical Rows**: Flat glassy ribbons with alternating 4% opacity zebra striping. 
- **Data Points**: Player name, nation flag icon, club badge, chemistry rating, and monospaced coin pricing (`1,450,000` in `#D8B25A` gold). Hover or d-pad selection triggers an instant mint left-border highlight bar.

### Progress Gauges & Chemistry Indicators
- **Thin Track Bars**: 2px to 4px track height, dark obsidian background with full-bleed `#2BD98B` fill.
- **Segmented Pips**: Squad chemistry uses 3-stage diamond or parallelogram segments that illuminate from dull gray to vivid azure (`#1E8BFF`) when links are active.

### Form Inputs & Search Filters
- **Input Fields**: Matte dark fill (`#090D14`), 1px muted border (`rgba(255,255,255,0.1)`), embedded search icons, and active state bounding border in `#8FF0C9`.