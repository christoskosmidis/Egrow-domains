import Link from "next/link";
import { Logo } from "./Header";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Η υπηρεσία domains της Egrow Creative. Ιστοσελίδες και e-shop στο{" "}
            <a href={site.mainUrl} className="underline hover:text-white">
              egrowcreative.gr
            </a>
            .
          </p>
        </div>
        <ul className="space-y-2.5 text-sm text-white/65">
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </li>
          <li>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
              {site.phone}
            </a>
          </li>
        </ul>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Egrow Creative</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-white">
              Όροι χρήσης
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Πολιτική απορρήτου
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
