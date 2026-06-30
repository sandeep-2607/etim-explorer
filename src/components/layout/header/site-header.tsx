import { cacheLife } from "next/cache";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { HeaderBreadcrumb } from "./header-breadcrumb";
import { SearchBox } from "./search-box";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAvailableLocales } from "@/lib/i18n/locales";

/**
 * Slim top header for the sidebar shell: sidebar trigger + global search +
 * language switcher + theme toggle. Cached (depends only on `lang`).
 */
export async function SiteHeader({ lang }: { lang: string }) {
  "use cache";
  cacheLife("days");

  const [dict, locales] = await Promise.all([
    getDictionary(lang),
    getAvailableLocales(),
  ]);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <HeaderBreadcrumb />
      <div className="flex-1">
        <div className="ml-auto max-w-md">
          <SearchBox lang={lang} placeholder={dict.common.search_placeholder} />
        </div>
      </div>
      <LanguageSwitcher
        locales={locales}
        current={lang}
        label={dict.common.language}
      />
      <ThemeToggle label="Toggle theme" />
    </header>
  );
}
