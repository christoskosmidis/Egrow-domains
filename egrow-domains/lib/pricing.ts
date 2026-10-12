// Υπολογισμός τιμής πώλησης = κόστος name.com (USD) -> EUR -> margin -> ΦΠΑ -> στρογγυλοποίηση.
// ΑΛΛΑΞΕ ΕΔΩ τα margins ανά extension.

// Σημείωση: το name.com δεν υποστηρίζει .gr (το .gr γίνεται μόνο από εξουσιοδοτημένους
// registrars στην Ελλάδα). Γι' αυτό δεν υπάρχει εδώ. Δες το README.
export const TLD_CONFIG: Record<string, { margin: number; fixedFee: number }> = {
  // margin: 0.4 = +40% πάνω στο κόστος, fixedFee: σταθερό ποσό σε € πριν τον ΦΠΑ
  com: { margin: 0.35, fixedFee: 2 },
  eu: { margin: 0.4, fixedFee: 2 },
  shop: { margin: 0.35, fixedFee: 2 },
  store: { margin: 0.35, fixedFee: 2 },
  online: { margin: 0.35, fixedFee: 2 },
  site: { margin: 0.35, fixedFee: 2 },
  net: { margin: 0.35, fixedFee: 2 },
  org: { margin: 0.35, fixedFee: 2 },
  info: { margin: 0.35, fixedFee: 2 },
  io: { margin: 0.25, fixedFee: 4 },
  co: { margin: 0.3, fixedFee: 3 },
};

export const SUPPORTED_TLDS = Object.keys(TLD_CONFIG);

const DEFAULT_CONFIG = { margin: 0.35, fixedFee: 2 };

function num(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== "" ? n : fallback;
}

export function salePriceEur(costUsd: number, tld: string): number {
  const eurPerUsd = num(process.env.EUR_PER_USD, 0.92);
  const vat = num(process.env.VAT_RATE, 0.24);
  const cfg = TLD_CONFIG[tld] ?? DEFAULT_CONFIG;

  const costEur = costUsd * eurPerUsd;
  const net = costEur * (1 + cfg.margin) + cfg.fixedFee;
  const gross = net * (1 + vat);
  // Στρογγυλοποίηση προς τα πάνω σε τιμή που τελειώνει σε .90
  return Math.ceil(gross) - 0.1;
}

export function toCents(eur: number): number {
  return Math.round(eur * 100);
}

export function formatEur(eur: number): string {
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(eur);
}
