import { NextResponse } from "next/server";
import { checkAvailability } from "@/lib/namecom";
import { isValidDomain } from "@/lib/domains";
import { salePriceEur, toCents } from "@/lib/pricing";
import { createOrder } from "@/lib/paypal";
import { seal } from "@/lib/secure";
import { siteUrl } from "@/lib/url";
import crypto from "node:crypto";
import { allow, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

type Body = {
  domain?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

const clean = (v: unknown, max = 100) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// name.com θέλει τηλέφωνο σε μορφή +30.6912345678
function normalizePhone(raw: string): string | null {
  const s = raw.replace(/[()-]/g, "").trim();
  let m = s.match(/^\+(\d{1,3})[ .](\d{6,14})$/);
  if (m) return `+${m[1]}.${m[2]}`;
  m = s.replace(/\s/g, "").match(/^\+30(\d{10})$/); // ελληνικό χωρίς διαχωριστικό
  if (m) return `+30.${m[1]}`;
  m = s.replace(/\s/g, "").match(/^(69\d{8}|2\d{9})$/); // ελληνικό χωρίς +30
  if (m) return `+30.${m[1]}`;
  return null;
}

export async function POST(req: Request) {
  if (!allow(`checkout:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "Πολλά αιτήματα. Δοκιμάστε ξανά σε λίγο." }, { status: 429 });
  }

  const b = ((await req.json().catch(() => null)) ?? {}) as Body;
  const domain = clean(b.domain, 90).toLowerCase();
  const firstName = clean(b.firstName);
  const lastName = clean(b.lastName);
  const companyName = clean(b.companyName);
  const email = clean(b.email, 120);
  const address1 = clean(b.address1, 120);
  const city = clean(b.city);
  const state = clean(b.state);
  const zip = clean(b.zip, 20);
  const country = clean(b.country, 2).toUpperCase();
  const phone = normalizePhone(clean(b.phone, 30));

  if (!isValidDomain(domain)) {
    return NextResponse.json({ error: "Μη έγκυρο domain." }, { status: 400 });
  }
  if (!firstName || !lastName || !address1 || !city || !state || !zip || !/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Συμπληρώστε όλα τα στοιχεία κατόχου." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Μη έγκυρο email." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Το τηλέφωνο να είναι της μορφής +30 6912345678." },
      { status: 400 },
    );
  }

  try {
    // Ξαναελέγχουμε διαθεσιμότητα και τιμή στον server. Δεν εμπιστευόμαστε ποτέ τιμή από τον browser.
    const [r] = await checkAvailability([domain]);
    if (!r?.purchasable || r.premium || typeof r.purchasePrice !== "number") {
      return NextResponse.json({ error: "Το domain δεν είναι πλέον διαθέσιμο." }, { status: 409 });
    }
    const tld = domain.split(".").slice(1).join(".");
    const amount = (toCents(salePriceEur(r.purchasePrice, tld)) / 100).toFixed(2);
    const nonce = crypto.randomUUID();

    // Τα στοιχεία κατόχου ταξιδεύουν κρυπτογραφημένα στο return URL (χωρίς βάση δεδομένων).
    const s = seal({
      v: 1,
      exp: Date.now() + 60 * 60_000,
      nonce,
      domain,
      amount,
      costUsd: r.purchasePrice,
      contact: {
        firstName,
        lastName,
        companyName: companyName || undefined,
        address1,
        city,
        state,
        zip,
        country,
        phone,
        email,
      },
    });

    const order = await createOrder({
      amountEur: amount,
      domain,
      invoiceId: nonce,
      returnUrl: `${siteUrl()}/api/paypal/return?s=${s}`,
      cancelUrl: `${siteUrl()}/?cancelled=1`,
    });

    return NextResponse.json({ url: order.approveUrl });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Δεν ήταν δυνατή η έναρξη πληρωμής. Δοκιμάστε ξανά." },
      { status: 502 },
    );
  }
}
