export const ADMIN_NAV_ITEMS = [
  { href: "/admin/piwoyi", label: "Overview", icon: "🏠" },
  { href: "/admin/piwoyi/map", label: "Piwoyi Map", icon: "📍" },
  { href: "/admin/piwoyi/businesses", label: "Businesses", icon: "🏪" },
  { href: "/admin/piwoyi/jobs", label: "Jobs", icon: "🚶" },
  { href: "/admin/piwoyi/walkers", label: "Walkers", icon: "🚶‍♂️" },
  { href: "/admin/sales", label: "Sales", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/admin/messages", label: "Messages", icon: "💬" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/support", label: "Support", icon: "❓" },
];

export function isAdminNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/community") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
