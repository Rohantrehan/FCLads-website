import { buildLegacyTheme } from "sanity";

// FC Lads colours (same as web/src/app/globals.css). The Studio opens in dark mode (components/StudioProvider.tsx).
const colors = {
  canvas: "#07090d",
  surface: "#111722",
  text: "#f0f4fa",
  muted: "#a7b0bc",
  primary: "#2bd98b",
  mint: "#8ff0c9",
  azure: "#1e8bff",
  gold: "#d8b25a",
  danger: "#ff5c6c",
};

export const theme = buildLegacyTheme({
  "--font-family-base": "Manrope, -apple-system, 'Segoe UI', sans-serif",
  "--font-family-monospace": "'JetBrains Mono', ui-monospace, monospace",
  "--black": colors.canvas,
  "--white": colors.text,
  "--gray-base": "#2c3648",
  "--gray": colors.muted,
  "--component-bg": colors.surface,
  "--component-text-color": colors.text,
  "--brand-primary": colors.primary,
  "--default-button-color": colors.muted,
  "--default-button-primary-color": colors.primary,
  "--default-button-success-color": colors.primary,
  "--default-button-warning-color": colors.gold,
  "--default-button-danger-color": colors.danger,
  "--state-info-color": colors.azure,
  "--state-success-color": colors.primary,
  "--state-warning-color": colors.gold,
  "--state-danger-color": colors.danger,
  "--main-navigation-color": colors.canvas,
  "--main-navigation-color--inverted": colors.text,
  "--focus-color": colors.mint,
});
