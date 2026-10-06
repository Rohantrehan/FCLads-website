import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora, Unbounded } from "next/font/google";
import "./globals.css";

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
    "FC Lads is a community of EA SPORTS FC players, creators and analysts. Free guides, meta players, squads and the FC Lads+ membership.",
};

export const viewport: Viewport = {
  themeColor: "#07090d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} ${unbounded.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
