import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Egrow Domains | Βρείτε και αγοράστε το domain σας",
    template: "%s | Egrow Domains",
  },
  description:
    "Αναζήτηση και καταχώρηση domain με άμεση τιμή και πληρωμή online. Από την Egrow Creative.",
  openGraph: {
    type: "website",
    locale: "el_GR",
    siteName: "Egrow Domains",
    title: "Egrow Domains | Βρείτε και αγοράστε το domain σας",
    description: "Αναζήτηση και καταχώρηση domain με άμεση τιμή και πληρωμή online.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7fb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Μετάβαση στο περιεχόμενο
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
