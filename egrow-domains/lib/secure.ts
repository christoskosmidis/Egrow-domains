import "server-only";
import crypto from "node:crypto";

// Κρυπτογράφηση AES-256-GCM. Τα στοιχεία του πελάτη ταξιδεύουν στο return URL του PayPal
// κρυπτογραφημένα και υπογεγραμμένα, ώστε να μην χρειάζεται βάση δεδομένων και να μη μπορεί κανείς να τα αλλάξει.
function key() {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 16) throw new Error("Λείπει το APP_SECRET (τουλάχιστον 16 χαρακτήρες)");
  return crypto.createHash("sha256").update(s).digest();
}

export function seal(data: unknown): string {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(data), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url");
}

export function unseal<T>(token: string): T | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const d = crypto.createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const out = Buffer.concat([d.update(buf.subarray(28)), d.final()]);
    return JSON.parse(out.toString("utf8")) as T;
  } catch {
    return null;
  }
}
