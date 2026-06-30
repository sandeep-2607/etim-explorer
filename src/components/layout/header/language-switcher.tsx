"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LocaleOption } from "@/lib/i18n/config";

function persistLocale(code: string) {
  document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LanguageSwitcher({
  locales,
  current,
  label,
}: {
  locales: LocaleOption[];
  current: string;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchTo(code: string) {
    if (code === current) return;
    // Replace the first path segment (the locale), keeping the rest of the path
    // AND the current query string (filters/sort/page/q) intact.
    const segments = pathname.split("/");
    segments[1] = code;
    const path = segments.join("/") || `/${code}`;
    const qs = searchParams.toString();
    persistLocale(code);
    router.push(qs ? `${path}?${qs}` : path);
  }

  const currentEndonym =
    locales.find((l) => l.code === current)?.endonym ?? current;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-2" aria-label={label} />}
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{currentEndonym}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchTo(l.code)}
            className="justify-between gap-6"
          >
            <span>{l.endonym}</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="font-mono text-xs">{l.code}</span>
              {l.code === current && <Check className="size-4" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
