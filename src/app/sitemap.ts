import type { MetadataRoute } from "next";
import { getAvailableLocales } from "@/lib/i18n/locales";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SECTIONS = ["", "classes", "features", "values", "units", "groups", "search"];

/**
 * Sitemap of the main routes per locale. Entity detail pages (thousands per
 * type) are intentionally omitted here to keep generation fast; add a paged
 * sitemap index later if needed for deep SEO.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = await getAvailableLocales();
  const entries: MetadataRoute.Sitemap = [];
  for (const { code } of locales) {
    for (const section of SECTIONS) {
      entries.push({
        url: `${BASE}/${code}${section ? `/${section}` : ""}`,
        changeFrequency: "monthly",
        priority: section === "" ? 1 : 0.7,
      });
    }
  }
  return entries;
}
