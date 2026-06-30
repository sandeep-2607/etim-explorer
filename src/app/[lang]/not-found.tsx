"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  // not-found receives no params; derive the active locale from the path.
  const lang = usePathname().split("/").filter(Boolean)[0] ?? "EN";
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-mono text-5xl font-bold text-muted-foreground">404</p>
      <p className="text-lg">This page could not be found.</p>
      <Link href={`/${lang}`} className="text-primary hover:underline">
        Go to home
      </Link>
    </div>
  );
}
