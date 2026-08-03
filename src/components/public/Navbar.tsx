"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";

export function Navbar() {
  const { total, count } = useCart();
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const links = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/services", label: t("nav.services") },
    { href: "/account", label: "Mon compte" },
    { href: "/wishlist", label: "♡" },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  }

  return (
    <header>
      <div className="hidden bg-[#FF523B] text-white text-xs sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <span>Champin, Cap-Haïtien · +509 32 83 6938</span>
          <div className="flex items-center gap-3">
            <span>USD</span>
            <button
              onClick={() => setLang(lang === "fr" ? "ht" : "fr")}
              className="rounded bg-white/20 px-2 py-0.5 font-medium"
            >
              {lang === "fr" ? "Français" : "Kreyòl"}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-[#E9ECEF]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            update<span className="text-[#FF523B]">.</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-lg border border-[#E9ECEF] md:flex">
            <select className="rounded-l-lg bg-[#F8F9FA] px-3 py-2 text-sm text-[#6C757D]">
              <option>{t("nav.all_categories")}</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.search_placeholder")}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-r-lg bg-[#1A1A1A] px-4 py-2 text-white text-sm">
              Chercher
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href="/cart" className="text-sm font-medium whitespace-nowrap">
            {t("nav.cart")} ({count}) · ${(total / 100).toFixed(2)}
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-2 rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm md:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#E9ECEF] px-4 py-3 md:hidden">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.search_placeholder")}
                className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
              />
            </form>
            <nav className="flex flex-col gap-3 text-sm font-medium">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
              <a href="https://wa.me/50932836938" className="text-[#FF523B]">
                WhatsApp
              </a>
              <button
                onClick={() => setLang(lang === "fr" ? "ht" : "fr")}
                className="text-left text-[#6C757D]"
              >
                {lang === "fr" ? "Passer en Kreyòl" : "Passer en Français"}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
