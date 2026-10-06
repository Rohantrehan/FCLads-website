// Site-wide navigation and links. One place to change the menu, footer and socials.

export interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Learn", href: "/learn" },
  { label: "Players", href: "/players" },
  { label: "Squads", href: "/squads" },
  { label: "Feed", href: "/feed" },
  { label: "Trading", href: "/trading" },
  { label: "Creators", href: "/creators" },
  { label: "FC Lads+", href: "/lads-plus", highlight: true },
];

export const footerNav: NavItem[] = [
  { label: "Learn", href: "/learn" },
  { label: "Players", href: "/players" },
  { label: "Trading", href: "/trading" },
  { label: "Creators", href: "/creators" },
  { label: "FC Lads+", href: "/lads-plus", highlight: true },
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
];

// TODO: replace "#" with the real channel URLs from the client.
export const socialLinks = {
  youtube: "#",
  instagram: "#",
  x: "#",
  tiktok: "#",
  discord: "#",
} as const;

/** True when `pathname` is the nav item's page or one of its sub-pages. */
export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
