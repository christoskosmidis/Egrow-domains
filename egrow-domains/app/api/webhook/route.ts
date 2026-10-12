import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { checkAvailability, domainExists, namecomMode, registerDomain } from "@/lib/namecom";
import { isValidDomain } from "@/lib/domains";
import { getStripe } from "@/lib/stripe";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

// Το Stripe καλεί αυτό το endpoint όταν ολοκληρωθεί μια πληρωμή.
// Εδώ γίνεται το βήμα 3: καταχώρηση του domain στο name.com με χρέωση στον δικό σου λογαριασμό.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const m = session.metadata ?? {};
  if (m.type !== "domain" || session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const domain = (m.domain ?? "").toLowerCase();
  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  const refund = async (reason: string) => {
    if (paymentIntent) {
      await getStripe().refunds.create({ payment_intent: paymentIntent });
    }
    await sendMail({
      subject: `Επιστροφή χρημάτων: ${domain}`,
      text: `Η καταχώρηση του ${domain} απέτυχε και έγινε αυτόματη επιστροφή.\nΛόγος: ${reason}\nΠελάτης: ${m.c_email}\nStripe session: ${session.id}`,
    });
  };

  try {
    if (!isValidDomain(domain)) {
      await refund("μη έγκυρο domain στα metadata");
      return NextResponse.json({ received: true });
    }

    // Idempotency: αν το domain υπάρχει ήδη στον λογαριασμό (επανάληψη του webhook), δεν το ξαναγοράζουμε.
    if (await domainExists(domain)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Ξαναελέγχουμε διαθεσιμότητα και κόστος αμέσως πριν την αγορά.
    const [r] = await checkAvailability([domain]);
    if (!r?.purchasable || r.premium || typeof r.purchasePrice !== "number") {
      await refund("το domain δεν ήταν πλέον διαθέσιμο");
      return NextResponse.json({ received: true });
    }
    const expected = Number(m.costUsd);
    if (Number.isFinite(expected) && r.purchasePrice > expected * 1.05) {
      await refund(`το κόστος αυξήθηκε από ${expected} σε ${r.purchasePrice} USD`);
      return NextResponse.json({ received: true });
    }

    await registerDomain({
      domainName: domain,
      purchasePrice: r.purchasePrice,
      contact: {
        firstName: m.c_first ?? "",
        lastName: m.c_last ?? "",
        companyName: m.c_company || undefined,
        address1: m.c_addr ?? "",
        city: m.c_city ?? "",
        state: m.c_state ?? "",
        zip: m.c_zip ?? "",
        country: m.c_country ?? "GR",
        phone: m.c_phone ?? "",
        email: m.c_email ?? "",
      },
    });

    await sendMail({
      subject: `Νέο domain πουλήθηκε: ${domain}`,
      text: `Καταχωρήθηκε το ${domain} (name.com: ${namecomMode}).\nΠελάτης: ${m.c_first} ${m.c_last} <${m.c_email}>\nΚόστος: ${r.purchasePrice} USD\nΠληρώθηκε: ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()}`,
    });
  } catch (err) {
    console.error("[webhook] registration failed", err);
    try {
      await refund(err instanceof Error ? err.message : "άγνωστο σφάλμα");
    } catch (refundErr) {
      console.error("[webhook] REFUND FAILED - ΑΠΑΙΤΕΙΤΑΙ ΧΕΙΡΟΚΙΝΗΤΗ ΕΝΕΡΓΕΙΑ", refundErr);
      await sendMail({
        subject: `ΕΠΕΙΓΟΝ: αποτυχία καταχώρησης και επιστροφής για ${domain}`,
        text: `Ο πελάτης πλήρωσε αλλά η καταχώρηση και η επιστροφή απέτυχαν. Δες το Stripe session ${session.id}.`,
      });
    }
    // Επιστρέφουμε 200 ώστε το Stripe να μην επαναλαμβάνει συνεχώς το webhook.
  }

  return NextResponse.json({ received: true });
}
