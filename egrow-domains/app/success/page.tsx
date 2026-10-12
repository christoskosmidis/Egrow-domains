import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Η πληρωμή ολοκληρώθηκε", robots: { index: false } };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let domain = "";
  let paid = false;
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(session_id);
      domain = s.metadata?.domain ?? "";
      paid = s.payment_status === "paid";
    } catch {
      // Αν αποτύχει η ανάκτηση, δείχνουμε γενικό μήνυμα
    }
  }

  return (
    <div className="container-x py-20">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold">
          {paid ? "Ευχαριστούμε! Η πληρωμή έγινε." : "Ευχαριστούμε!"}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {domain ? (
            <>
              Καταχωρούμε το <span className="break-all font-mono font-semibold text-ink">{domain}</span> τώρα.
            </>
          ) : (
            "Καταχωρούμε το domain σας τώρα."
          )}{" "}
          Θα λάβετε email επιβεβαίωσης. Αν για οποιονδήποτε λόγο η καταχώρηση δεν ολοκληρωθεί, η πληρωμή
          επιστρέφεται αυτόματα.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Επιστροφή στην αρχική
        </Link>
      </div>
    </div>
  );
}
