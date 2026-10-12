import { SUPPORTED_TLDS } from "./pricing";

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type ParsedQuery = { sld: string; tld: string | null };

// Δέχεται "egrow", "egrow.com", "www.egrow.com", "https://egrow.com/"
export function parseQuery(raw: string): ParsedQuery | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  if (!cleaned || cleaned.length > 80) return null;

  const parts = cleaned.split(".");
  if (parts.length === 1) {
    return LABEL.test(parts[0]) ? { sld: parts[0], tld: null } : null;
  }
  if (parts.length === 2) {
    const [sld, tld] = parts;
    return LABEL.test(sld) && /^[a-z]{2,24}$/.test(tld) ? { sld, tld } : null;
  }
  return null;
}

export function isValidDomain(name: string): boolean {
  const p = parseQuery(name);
  return !!p && !!p.tld && p.sld + "." + p.tld === name.toLowerCase();
}

export function candidatesFor(q: ParsedQuery): string[] {
  const tlds = q.tld
    ? [q.tld, ...SUPPORTED_TLDS.filter((t) => t !== q.tld)]
    : SUPPORTED_TLDS;
  return tlds.map((t) => `${q.sld}.${t}`);
}
