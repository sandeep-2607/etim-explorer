import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header/site-header";

/**
 * Sidebar shell for the app. Mirrors PowerAPI's `(root)/layout.tsx`:
 * SidebarProvider → AppSidebar + SidebarInset(SiteHeader + page).
 * No server-side cookie read here, so the static shell still prerenders under
 * Cache Components (the client SidebarProvider persists its own state cookie).
 */
export default async function AppLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <Suspense fallback={null}>
        <AppSidebar lang={lang} />
      </Suspense>
      <SidebarInset>
        <Suspense fallback={<div className="h-14 border-b" />}>
          <SiteHeader lang={lang} />
        </Suspense>
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
