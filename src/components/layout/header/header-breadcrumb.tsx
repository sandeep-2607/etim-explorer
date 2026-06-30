"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDictionary } from "@/contexts/dictionary-context";

const SECTIONS = ["classes", "features", "values", "units", "groups", "search"] as const;
type Section = (typeof SECTIONS)[number];

/** Path-derived breadcrumb shown in the header (Home › Section › Code). */
export function HeaderBreadcrumb() {
  const dict = useDictionary();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // [lang, section?, code?]
  const lang = segments[0] ?? "EN";
  const section = segments[1] as Section | undefined;
  const code = segments[2];

  const sectionLabel = (s: Section) => dict.nav[s];

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          {section ? (
            <BreadcrumbLink render={<Link href={`/${lang}`} />}>
              {dict.nav.home}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{dict.nav.home}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {section && SECTIONS.includes(section) && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {code ? (
                <BreadcrumbLink render={<Link href={`/${lang}/${section}`} />}>
                  {sectionLabel(section)}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{sectionLabel(section)}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {code && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono">{code}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
