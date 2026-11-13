import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { en } from "./en";
import { et } from "./et";
import { lt } from "./lt";
import { lv } from "./lv";
import type { Dict, Lang } from "./types";

export type { Dict, Lang } from "./types";

export const LANG_STORAGE_KEY = "trex-lang";
export const DEFAULT_LANG: Lang = "en";
export const dictionaries: Record<Lang, Dict> = { en, et, lv, lt };

/** `label` is the short code shown in the header; `code` is the ISO code used for <html lang>. */
export const languages: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "et", label: "EE", name: "Eesti" },
  { code: "lv", label: "LV", name: "Latviešu" },
  { code: "lt", label: "LT", name: "Lietuvių" },
];

export const isLang = (value: unknown): value is Lang =>
  typeof value === "string" && value in dictionaries;

/** Saved choice first, then the browser's preferred languages, then English. */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag?.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

type I18n = { lang: Lang; setLang: (lang: Lang) => void; t: Dict };

const I18nContext = createContext<I18n>({ lang: DEFAULT_LANG, setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  // The server always renders English; the visitor's language is applied after hydration.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  useEffect(() => setLangState(detectLang()), []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies to this page view.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
