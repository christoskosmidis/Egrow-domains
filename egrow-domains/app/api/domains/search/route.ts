import { NextResponse } from "next/server";
import { checkAvailability } from "@/lib/namecom";
import { candidatesFor, parseQuery } from "@/lib/domains";
import { salePriceEur } from "@/lib/pricing";
import { allow, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export type SearchItem = {
  domain: string;
  tld: string;
  available: boolean;
  priceEur?: number;
};

export async function POST(req: Request) {
  if (!allow(`search:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Πολλά αιτήματα. Δοκιμάστε ξανά σε λίγο." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { query?: string } | null;
  const parsed = body?.query ? parseQuery(body.query) : null;
  if (!parsed) {
    return NextResponse.json(
      { error: "Γράψτε ένα έγκυρο όνομα, π.χ. onomamou ή onomamou.com" },
      { status: 400 },
    );
  }

  try {
    const results = await checkAvailability(candidatesFor(parsed));
    const items: SearchItem[] = results.map((r) => {
      const tld = r.tld ?? r.domainName.split(".").slice(1).join(".");
      // Τα premium domains δεν πωλούνται αυτόματα
      const sellable = !!r.purchasable && !r.premium && typeof r.purchasePrice === "number";
      return {
        domain: r.domainName,
        tld,
        available: sellable,
        priceEur: sellable ? salePriceEur(r.purchasePrice as number, tld) : undefined,
      };
    });

    // Πρώτα αυτό που ζήτησε ο χρήστης, μετά τα διαθέσιμα, μετά τα υπόλοιπα
    const wanted = parsed.tld ? `${parsed.sld}.${parsed.tld}` : null;
    items.sort((a, b) => {
      if (a.domain === wanted) return -1;
      if (b.domain === wanted) return 1;
      return Number(b.available) - Number(a.available);
    });

    return NextResponse.json({ items, wanted });
  } catch (err) {
    console.error("[domains/search]", err);
    return NextResponse.json(
      { error: "Δεν ήταν δυνατός ο έλεγχος αυτή τη στιγμή. Δοκιμάστε ξανά." },
      { status: 502 },
    );
  }
}
