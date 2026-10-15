// Site colour: one hex colour chosen on the posting board (Site settings) becomes the set of accent
// tokens in globals.css (primary, mint, pitch-green…). Shades are worked out in OKLCH so any hue
// keeps the same lightness steps as the original green. Pure functions: used on the server and in the
// board's live preview.

export const DEFAULT_THEME_COLOR = "#2bd98b";

/** Ready-made colours on the board. */
export const themePresets = [
  { name: "Green", color: "#2bd98b" },
  { name: "Red", color: "#ff4d5e" },
  { name: "Orange", color: "#ff8a3d" },
  { name: "Gold", color: "#f2c94c" },
  { name: "Purple", color: "#a970ff" },
  { name: "Pink", color: "#ff5fae" },
  { name: "Blue", color: "#3d8bff" },
  { name: "Cyan", color: "#22d3ee" },
] as const;

/** The accent tokens a theme sets (names without the --color- prefix). */
export interface ThemeTokens {
  primary: string;
  "primary-bright": string;
  "on-primary": string;
  mint: string;
  secondary: string;
  "pitch-green": string;
  "teal-deep": string;
}

/** The original green tokens from globals.css, kept exactly. */
const GREEN: ThemeTokens = {
  primary: "#2bd98b",
  "primary-bright": "#38e192",
  "on-primary": "#003920",
  mint: "#8ff0c9",
  secondary: "#78d9b3",
  "pitch-green": "#0e2a22",
  "teal-deep": "#0a1f1c",
};

export const isHexColor = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

// ---- sRGB ↔ OKLCH (https://bottosson.github.io/posts/oklab/)

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function oklchToHex(L: number, C: number, h: number) {
  // Lower the chroma until the colour fits in sRGB, so very saturated picks don't clip oddly.
  for (let chroma = C; chroma >= 0; chroma -= 0.005) {
    const A = chroma * Math.cos(h);
    const B = chroma * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    if (rgb.every((v) => v >= -0.0001 && v <= 1.0001)) {
      return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(v))) * 255).toString(16).padStart(2, "0")).join("")}`;
    }
  }
  return "#000000";
}

/** All accent tokens for one main colour. Too-dark or too-light picks are nudged so text stays readable. */
export function themeTokens(color: string): ThemeTokens {
  if (!isHexColor(color) || color.toLowerCase() === DEFAULT_THEME_COLOR) return GREEN;
  const { l, c, h } = hexToOklch(color.toLowerCase());
  // Greys (no hue) stay grey; everything else keeps at least some colour.
  const chroma = c < 0.02 ? 0 : Math.max(c, 0.09);
  const L = Math.min(Math.max(l, 0.66), 0.86);
  return {
    primary: oklchToHex(L, chroma, h),
    "primary-bright": oklchToHex(Math.min(L + 0.03, 0.9), chroma, h),
    "on-primary": oklchToHex(0.26, chroma * 0.45, h),
    mint: oklchToHex(0.9, chroma * 0.55, h),
    secondary: oklchToHex(0.82, chroma * 0.5, h),
    "pitch-green": oklchToHex(0.25, Math.min(chroma * 0.3, 0.045), h),
    "teal-deep": oklchToHex(0.21, Math.min(chroma * 0.22, 0.03), h),
  };
}

/** CSS that overrides the accent tokens, or "" for the default green. */
export function themeCss(color: string) {
  if (!isHexColor(color) || color.toLowerCase() === DEFAULT_THEME_COLOR) return "";
  const tokens = themeTokens(color);
  const vars = Object.entries(tokens)
    .map(([name, value]) => `--color-${name}:${value};`)
    .join("");
  return `html:root{${vars}}`;
}
