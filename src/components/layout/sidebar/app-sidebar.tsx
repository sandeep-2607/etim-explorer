"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { getNavigation } from "@/constants/navigation";
import { useDictionary } from "@/contexts/dictionary-context";

export function AppSidebar({ lang }: { lang: string }) {
  const dict = useDictionary();
  const pathname = usePathname();
  const items = getNavigation(dict);

  // Path without the leading /<lang> segment (e.g. /EN/classes -> /classes).
  const rel = pathname.replace(/^\/[^/]+/, "") || "/";

  const isActive = (href: string) => {
    const target = href === "" ? "/" : `/${href}`;
    if (target === "/") return rel === "/";
    return rel === target || rel.startsWith(`${target}/`);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={`/${lang}`} />}
              tooltip={dict.app.name}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{dict.app.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  ETIM 10.0
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                v10.0
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.href || "home"}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  tooltip={item.title}
                  render={
                    <Link href={`/${lang}${item.href ? `/${item.href}` : ""}`} />
                  }
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
