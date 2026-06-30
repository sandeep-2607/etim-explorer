import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppProviders } from "@/components/layout/app-providers";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAvailableLocales } from "@/lib/i18n/locales";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export async function generateStaticParams() {
  const locales = await getAvailableLocales();
  return locales.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const [dict, locales] = await Promise.all([
    getDictionary(lang),
    getAvailableLocales(),
  ]);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: { default: dict.app.name, template: `%s · ${dict.app.name}` },
    description: dict.app.tagline,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l.code, `/${l.code}`])),
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppProviders lang={lang}>{children}</AppProviders>
      </body>
    </html>
  );
}
