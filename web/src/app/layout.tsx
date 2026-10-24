import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { JetBrains_Mono, Manrope, Sora, Unbounded } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
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

const description =
  "EA SPORTS FC Ultimate Team guides, meta tactics, trading tips and gameplay reviews from pro FC creators. Free feed and tax calculator; full guides, video series and private Discord with FC Lads+.";

// Defaults for every page. One English site for all countries (UK, US, Canada, Australia...), so
// there are no per-country versions; pages set their own title, description and canonical.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "FC Lads — EA FC Ultimate Team guides, trading & meta tactics",
    template: "%s | FC Lads",
  },
  description,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", alternateLocale: ["en_GB"], description },
  twitter: { card: "summary_large_image" },
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
      <body>
        {children}
        {/* Vercel Web Analytics: page views per page and country (no cookies). */}
        <Analytics />
      </body>
    </html>
  );
}
