"use client";

import Link from "next/link";
import { useLang } from "./LangContext";

export function Hero() {
  const { t } = useLang();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-[#FF523B]">{t("hero.tagline")}</p>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mb-8 max-w-md text-[#6C757D]">{t("hero.subtitle")}</p>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-[#FF523B] px-6 py-3 text-sm font-medium text-white"
            >
              {t("hero.cta_shop")}
            </Link>
            <Link
              href="/services"
              className="rounded-xl border border-[#E9ECEF] px-6 py-3 text-sm font-medium"
            >
              {t("hero.cta_services")}
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-[#F8F9FA] p-10 text-center text-[#6C757D]">
          [ visuel produit / slider ]
        </div>
      </div>
    </section>
  );
}
