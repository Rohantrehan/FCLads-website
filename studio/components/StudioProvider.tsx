import { useEffect, type ReactNode } from "react";
import { useColorSchemeSetValue } from "sanity";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap";
const SCHEME_CHOSEN = "fclads:scheme-set";

/** Loads the site's fonts and opens the Studio in dark mode, like the website. People can still switch it. */
export function StudioProvider({ children }: { children: ReactNode }) {
  const setScheme = useColorSchemeSetValue();

  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_URL}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_URL;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!setScheme) return;
    try {
      if (localStorage.getItem(SCHEME_CHOSEN)) return;
      localStorage.setItem(SCHEME_CHOSEN, "1");
    } catch {
      // Storage blocked: still default to dark.
    }
    setScheme("dark");
  }, [setScheme]);

  return <>{children}</>;
}
