import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The branded picture shown when a link is shared (Discord, X, Reddit, WhatsApp, iMessage...).
// 1200×630, dark pitch background, crowned shield, a label and a headline.

export const shareImageSize = { width: 1200, height: 630 };

export async function shareImage({ label, title, footer }: { label: string; title: string; footer: string }) {
  const icon = await readFile(join(process.cwd(), "src/app/icon.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;
  const size = title.length > 70 ? 54 : title.length > 40 ? 66 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#ffffff",
          backgroundColor: "#07090d",
          backgroundImage: "radial-gradient(ellipse 80% 70% at 15% 0%, #0e3a2b 0%, #07090d 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
          <img src={iconSrc} width={72} height={72} alt="" style={{ borderRadius: 16 }} />
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>FC LADS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#2bd98b", textTransform: "uppercase", letterSpacing: 3 }}>{label}</span>
          <span style={{ fontSize: size, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>{title}</span>
        </div>
        <span style={{ fontSize: 26, color: "#9aa4b2" }}>{footer}</span>
      </div>
    ),
    shareImageSize,
  );
}
