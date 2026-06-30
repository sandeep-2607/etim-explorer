"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Global search: routes to the search page with `?q=`. Server does the query.
 * Reads the current `?q` (client-side) so the input reflects the active query
 * even though the header is a cached server component. */
export function SearchBox({
  lang,
  placeholder,
}: {
  lang: string;
  placeholder: string;
}) {
  const router = useRouter();
  const currentQuery = useSearchParams().get("q") ?? "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    const qs = value ? `?q=${encodeURIComponent(value)}` : "";
    router.push(`/${lang}/search${qs}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-md" role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        key={currentQuery}
        name="q"
        type="search"
        defaultValue={currentQuery}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </form>
  );
}
