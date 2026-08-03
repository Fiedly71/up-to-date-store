"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "fr" | "ht";

const STORAGE_KEY = "updatetech_lang";

const dictionary = {
  fr: {
    "nav.shop": "Boutique",
    "nav.services": "Services digitaux",
    "nav.search_placeholder": "Rechercher un produit...",
    "nav.cart": "Panier",
    "nav.all_categories": "Toutes catégories",
    "hero.tagline": "Hardware · Web & Apps",
    "hero.title": "La technologie, du comptoir au cloud.",
    "hero.subtitle":
      "Smartphones, matériel créateur et projecteurs livrés au Cap-Haïtien — et des sites et applications sur mesure conçus pour ton entreprise.",
    "hero.cta_shop": "Voir la boutique",
    "hero.cta_services": "Nos services digitaux",
    "footer.links": "Liens",
    "footer.support": "Support",
    "footer.categories": "Catégories",
  },
  ht: {
    "nav.shop": "Boutik",
    "nav.services": "Sèvis dijital",
    "nav.search_placeholder": "Chèche yon pwodwi...",
    "nav.cart": "Panye",
    "nav.all_categories": "Tout kategori",
    "hero.tagline": "Aparèy · Sit Web & App",
    "hero.title": "Teknoloji a, soti nan magazen an rive nan cloud.",
    "hero.subtitle":
      "Smartphone, materyèl pou kreyatè kontni ak pwojektè livre Okap — ak sit ak aplikasyon fèt sou mezi pou biznis ou.",
    "hero.cta_shop": "Gade boutik la",
    "hero.cta_services": "Sèvis dijital nou yo",
    "footer.links": "Lyen",
    "footer.support": "Sipò",
    "footer.categories": "Kategori",
  },
} as const;

type TranslationKey = keyof typeof dictionary.fr;

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restaure la langue choisie au montage
    if (saved === "fr" || saved === "ht") setLangState(saved);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  function t(key: TranslationKey) {
    return dictionary[lang][key] ?? dictionary.fr[key];
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang doit être utilisé dans un LangProvider");
  return ctx;
}
