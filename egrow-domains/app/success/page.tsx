import type { Metadata } from "next";
import Link from "next/link";
import { isValidDomain } from "@/lib/domains";

export const metadata: Metadata = { title: "Η πληρωμή ολοκληρώθηκε", robots: { index: false } };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: raw } = await searchParams;
  const domain = raw && isValidDomain(raw.toLowerCase()) ? raw.toLowerCase() : "";

  return (
    <div className="container-x py-20">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold">Ευχαριστούμε! Η πληρωμή έγινε.</h1>
        <p className="mt-4 text-lg text-muted">
          {domain ? (
            <>
              Το <span className="break-all font-mono font-semibold text-ink">{domain}</span> καταχωρήθηκε στο όνομά σας.
            </>
          ) : (
            "Το domain καταχωρήθηκε στο όνομά σας."
          )}{" "}
          Θα επικοινωνήσουμε μαζί σας για τα επόμενα βήματα, όπως η σύνδεση με ιστοσελίδα ή email.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Επιστροφή
        </Link>
      </div>
    </div>
  );
}
