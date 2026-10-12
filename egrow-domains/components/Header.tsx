"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import { nav, site } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-baseline gap-1.5" aria-label="Egrow Domains, αρχική">
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        egrow
      </span>
      <span className="h-2 w-2 rounded-full bg-cobalt" aria-hidden="true" />
      <span className={`text-sm font-medium ${light ? "text-white/70" : "text-muted"}`}>domains</span>
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />

        <nav aria-label="Κύριο μενού" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={site.mainUrl} className="btn btn-ghost hidden px-4 py-2.5 sm:inline-flex">
            ← egrowcreative.gr
          </a>
          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Μενού κινητού"
          className="border-t border-line bg-paper lg:hidden"
        >
          <div className="container-x flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-3.5 text-base font-semibold last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <a href={site.mainUrl} className="btn btn-ghost mt-3">
              ← egrowcreative.gr
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
