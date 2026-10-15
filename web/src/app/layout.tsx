import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora, Unbounded } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import { themeCss } from "@/lib/theme";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "FC Lads — Play Better. Together.",
    template: "%s | FC Lads",
  },
  description:
    "FC Lads is a community of EA SPORTS FC players, creators and analysts. A free feed and trading tools, plus in-depth guides and video series with the FC Lads+ membership.",
};

export const viewport: Viewport = {
  themeColor: "#07090d",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Site colour chosen on the posting board (Site settings). Empty for the default green.
  const theme = themeCss((await getContent()).settings.themeColor);
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} ${unbounded.variable}`}>
      <head>{theme ? <style id="site-theme">{theme}</style> : null}</head>
      <body>{children}</body>
    </html>
  );
}
