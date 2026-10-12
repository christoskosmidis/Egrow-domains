import DomainSearch from "@/components/DomainSearch";
import { faq, steps } from "@/lib/site";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string; q?: string; error?: string }>;
}) {
  const { cancelled, q, error } = await searchParams;
  const errors: Record<string, string> = {
    unavailable: "Το domain δεν είναι πλέον διαθέσιμο ή άλλαξε η τιμή του. Δεν έγινε καμία χρέωση.",
    payment: "Η πληρωμή δεν ολοκληρώθηκε. Ελέγξτε το PayPal σας ή επικοινωνήστε μαζί μας.",
    failed: "Η καταχώρηση δεν ολοκληρώθηκε. Αν χρεωθήκατε, η πληρωμή επιστρέφεται αυτόματα. Επικοινωνήστε μαζί μας αν χρειαστεί.",
    processed: "Η παραγγελία έχει ήδη επεξεργαστεί. Επικοινωνήστε μαζί μας αν χρειάζεστε βοήθεια.",
    invalid: "Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει. Ξεκινήστε ξανά την αναζήτηση.",
  };

  return (
    <>
      {/* Αναζήτηση */}
      <section id="search" className="bg-ink text-white">
        <div className="container-x py-16 md:py-24">
          <p className="font-mono text-sm font-semibold uppercase tracking-widest text-white/60">Domains</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Βρείτε το domain της επιχείρησής σας.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Γράψτε ένα όνομα και δείτε αμέσως τι είναι διαθέσιμο και πόσο κοστίζει. Η τιμή περιλαμβάνει ΦΠΑ και
            καταχώρηση για 1 έτος, με privacy protection.
          </p>

          {error && errors[error] && (
            <p role="alert" className="mt-6 max-w-xl rounded-xl bg-ink-soft px-4 py-3 text-sm font-semibold">
              {errors[error]}
            </p>
          )}

          {cancelled && (
            <p role="status" className="mt-6 max-w-xl rounded-xl bg-ink-soft px-4 py-3 text-sm font-semibold">
              Η πληρωμή ακυρώθηκε και δεν έγινε καμία χρέωση. Μπορείτε να δοκιμάσετε ξανά.
            </p>
          )}

          <div className="rounded-3xl bg-paper p-5 text-ink md:p-8 [&>form:first-child]:mt-0 mt-10">
            <DomainSearch initialQuery={(q ?? "").slice(0, 80)} />
          </div>
        </div>
      </section>

      {/* Πώς λειτουργεί */}
      <section id="how" className="container-x py-20">
        <p className="font-mono text-sm font-semibold uppercase tracking-widest text-cobalt">Πώς λειτουργεί</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Τρία βήματα, και είναι δικό σας</h2>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-white p-6">
              <span className="font-mono text-sm font-bold text-cobalt">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20">
        <div className="container-x max-w-3xl">
          <p className="font-mono text-sm font-semibold uppercase tracking-widest text-cobalt">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Συχνές ερωτήσεις</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {f.q}
                  <span className="text-xl text-cobalt transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
