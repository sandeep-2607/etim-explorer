"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  dict,
  lang,
  children,
}: {
  dict: Dictionary;
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dict}>
      <LangContext.Provider value={lang}>{children}</LangContext.Provider>
    </DictionaryContext.Provider>
  );
}

const LangContext = createContext<string>("EN");

/** Access the active dictionary inside Client Components. */
export function useDictionary(): Dictionary {
  const dict = useContext(DictionaryContext);
  if (!dict) throw new Error("useDictionary must be used within DictionaryProvider");
  return dict;
}

/** Access the active locale inside Client Components. */
export function useLang(): string {
  return useContext(LangContext);
}
