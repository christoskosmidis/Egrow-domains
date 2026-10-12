import { NextResponse } from "next/server";
import { checkAvailability, domainExists, namecomMode, registerDomain, type Contact } from "@/lib/namecom";
import { isValidDomain } from "@/lib/domains";
import { captureOrder, getOrder, paypalMode, refundCapture } from "@/lib/paypal";
import { unseal } from "@/lib/secure";
import { siteUrl } from "@/lib/url";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

type Payload = {
  v: number;
  exp: number;
  nonce: string;
  domain: string;
  amount: string;
  costUsd: number;
  contact: Contact;
};

const notify = async (subject: string, text: string) => {
  try {
    await sendMail({ subject, text });
  } catch (e) {
    console.error("[mail]", e);
  }
};

// Ο πελάτης επιστρέφει εδώ από το PayPal αφού εγκρίνει την πληρωμή.
// Σειρά: έλεγχος -> διαθεσιμότητα -> είσπραξη -> καταχώρηση. Αν η καταχώρηση αποτύχει, γίνεται επιστροφή χρημάτων.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = (path: string) => NextResponse.redirect(new URL(path, siteUrl()));

  const orderId = url.searchParams.get("token") ?? "";
  const data = unseal<Payload>(url.searchParams.get("s") ?? "");
  if (!data || data.v !== 1 || !orderId || Date.now() > data.exp || !isValidDomain(data.domain)) {
    return to("/?error=invalid");
  }

  let captureId: string | undefined;
  let registered = false;
  try {
    const order = await getOrder(orderId);
    const pu = order.purchase_units?.[0];
    // Η παραγγελία πρέπει να είναι ακριβώς αυτή που δημιουργήσαμε εμείς για αυτό το domain και αυτό το ποσό.
    if (
      pu?.invoice_id !== data.nonce ||
      pu?.custom_id !== data.domain ||
      pu?.amount?.value !== data.amount ||
      pu?.amount?.currency_code !== "EUR"
    ) {
      return to("/?error=invalid");
    }

    if (order.status === "COMPLETED") {
      // Ανανέωση της σελίδας: δεν ξαναχρεώνουμε και δεν ξαναγοράζουμε.
      return (await domainExists(data.domain))
        ? to(`/success?domain=${encodeURIComponent(data.domain)}`)
        : to("/?error=processed");
    }
    if (order.status !== "APPROVED") return to("/?cancelled=1");

    // Πριν πάρουμε χρήματα, βεβαιωνόμαστε ότι το domain είναι ακόμα διαθέσιμο και στην ίδια τιμή.
    const [r] = await checkAvailability([data.domain]);
    if (!r?.purchasable || r.premium || typeof r.purchasePrice !== "number") return to("/?error=unavailable");
    if (r.purchasePrice > data.costUsd * 1.05) return to("/?error=unavailable");

    const cap = await captureOrder(orderId);
    const capture = cap.purchase_units?.[0]?.payments?.captures?.[0];
    captureId = capture?.id;
    if (cap.status !== "COMPLETED" || capture?.status !== "COMPLETED") {
      await notify(
        `Πληρωμή PayPal δεν ολοκληρώθηκε: ${data.domain}`,
        `Κατάσταση: ${cap.status}/${capture?.status}. Order ${orderId}. Έλεγξε στο PayPal.`,
      );
      captureId = undefined;
      return to("/?error=payment");
    }

    await registerDomain({ domainName: data.domain, purchasePrice: r.purchasePrice, contact: data.contact });
    registered = true;

    await notify(
      `Νέο domain πουλήθηκε: ${data.domain}`,
      `Καταχωρήθηκε το ${data.domain} (name.com: ${namecomMode}, PayPal: ${paypalMode}).\nΠελάτης: ${data.contact.firstName} ${data.contact.lastName} <${data.contact.email}>\nΚόστος: ${r.purchasePrice} USD\nΠληρώθηκε: ${data.amount} EUR\nPayPal order: ${orderId}`,
    );
    return to(`/success?domain=${encodeURIComponent(data.domain)}`);
  } catch (err) {
    console.error("[paypal/return]", err);
    if (captureId && !registered) {
      try {
        await refundCapture(captureId);
        await notify(
          `Επιστροφή χρημάτων: ${data.domain}`,
          `Η καταχώρηση απέτυχε και έγινε αυτόματη επιστροφή.\nΛόγος: ${err instanceof Error ? err.message : "άγνωστο"}\nΠελάτης: ${data.contact.email}\nPayPal order: ${orderId}`,
        );
      } catch (refundErr) {
        console.error("[paypal/return] REFUND FAILED", refundErr);
        await notify(
          `ΕΠΕΙΓΟΝ: αποτυχία καταχώρησης και επιστροφής για ${data.domain}`,
          `Ο πελάτης πλήρωσε (${data.amount} EUR) αλλά η καταχώρηση και η επιστροφή απέτυχαν. Επέστρεψε χειροκίνητα από το PayPal. Order ${orderId}, πελάτης ${data.contact.email}.`,
        );
      }
    }
    return to("/?error=failed");
  }
}
