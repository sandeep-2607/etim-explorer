import { cacheLife } from "next/cache";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DictionaryProvider } from "@/contexts/dictionary-context";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Cached provider shell: fetches the dictionary inside a `use cache` boundary
 * (so the static shell prerenders under Cache Components) and passes the dynamic
 * page tree through as `children` (pass-through, not introspected).
 */
export async function AppProviders({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  "use cache";
  cacheLife("days");
  const dict = await getDictionary(lang);

  return (
    <DictionaryProvider dict={dict} lang={lang}>
      <TooltipProvider>{children}</TooltipProvider>
    </DictionaryProvider>
  );
}
