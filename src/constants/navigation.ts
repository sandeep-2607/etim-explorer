import {
  Home,
  Boxes,
  SlidersHorizontal,
  Tags,
  Ruler,
  FolderTree,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface NavItem {
  /** Path relative to `/[lang]` ("" = home). */
  href: string;
  title: string;
  icon: LucideIcon;
}

/** Sidebar navigation, localized from the active dictionary. */
export function getNavigation(dict: Dictionary): NavItem[] {
  return [
    { href: "", title: dict.nav.home, icon: Home },
    { href: "classes", title: dict.nav.classes, icon: Boxes },
    { href: "features", title: dict.nav.features, icon: SlidersHorizontal },
    { href: "values", title: dict.nav.values, icon: Tags },
    { href: "units", title: dict.nav.units, icon: Ruler },
    { href: "groups", title: dict.nav.groups, icon: FolderTree },
    { href: "search", title: dict.nav.search, icon: Search },
  ];
}
