"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { formatEur } from "@/lib/pricing";

type Item = { domain: string; tld: string; available: boolean; priceEur?: number };

const EMPTY = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "+30 ",
  address1: "",
  city: "",
  state: "",
  zip: "",
  country: "GR",
};

export default function DomainSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<Item[] | null>(null);
  const [wanted, setWanted] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch("/api/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Σφάλμα");
      setItems(data.items);
      setWanted(data.wanted);
    } catch (err) {
      setItems(null);
      setSearchError(err instanceof Error ? err.message : "Σφάλμα");
    } finally {
      setSearching(false);
    }
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buy(item: Item) {
    setSelected(item);
    setPayError("");
    dialog.current?.showModal();
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, domain: selected.domain }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Σφάλμα");
      window.location.href = data.url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Σφάλμα");
      setPaying(false);
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <form onSubmit={search} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="q" className="sr-only">
          Όνομα domain
        </label>
        <input
          id="q"
          className="field font-mono text-base sm:flex-1"
          placeholder="onomamou ή onomamou.com"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <button className="btn btn-primary" disabled={searching}>
          {searching ? "Έλεγχος..." : "Έλεγχος διαθεσιμότητας"}
        </button>
      </form>

      {searchError && (
        <p role="alert" className="mt-4 text-sm font-semibold text-danger">
          {searchError}
        </p>
      )}

      {items && (
        <ul className="mt-8 max-w-3xl divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {items.map((it) => (
            <li
              key={it.domain}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                it.domain === wanted ? "bg-mist/60" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="break-all font-mono text-base font-semibold">{it.domain}</p>
                <p
                  className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${
                    it.available ? "text-signal" : "text-muted"
                  }`}
                >
                  {it.available && <Icon name="check" className="h-4 w-4" />}
                  {it.available ? "Διαθέσιμο" : "Μη διαθέσιμο"}
                </p>
              </div>
              {it.available && it.priceEur !== undefined && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-extrabold">{formatEur(it.priceEur)}</p>
                    <p className="text-xs text-muted">/ έτος, με ΦΠΑ</p>
                  </div>
                  <button className="btn btn-primary px-4 py-2.5" onClick={() => buy(it)}>
                    Αγορά
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl p-0 shadow-2xl"
        onClose={() => setPaying(false)}
      >
        <form onSubmit={pay} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold">Στοιχεία κατόχου</h2>
              <p className="mt-1 break-all font-mono text-sm text-muted">
                {selected?.domain}
                {selected?.priceEur !== undefined && ` · ${formatEur(selected.priceEur)}`}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5"
              aria-label="Κλείσιμο"
              onClick={() => dialog.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>

          <p className="mt-3 text-sm text-muted">
            Τα στοιχεία αυτά καταχωρούνται στο μητρώο του domain και πρέπει να είναι αληθή.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Όνομα" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" required />
            <Field label="Επώνυμο" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" required />
            <Field label="Εταιρεία (προαιρετικό)" value={form.companyName} onChange={set("companyName")} className="col-span-2" autoComplete="organization" />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} className="col-span-2" autoComplete="email" required />
            <Field label="Τηλέφωνο" type="tel" value={form.phone} onChange={set("phone")} className="col-span-2" autoComplete="tel" required />
            <Field label="Διεύθυνση" value={form.address1} onChange={set("address1")} className="col-span-2" autoComplete="address-line1" required />
            <Field label="Πόλη" value={form.city} onChange={set("city")} autoComplete="address-level2" required />
            <Field label="Νομός / Περιοχή" value={form.state} onChange={set("state")} autoComplete="address-level1" required />
            <Field label="Τ.Κ." value={form.zip} onChange={set("zip")} autoComplete="postal-code" required />
            <Field label="Χώρα (κωδικός)" value={form.country} onChange={set("country")} maxLength={2} autoComplete="country" required />
          </div>

          {payError && (
            <p role="alert" className="mt-4 text-sm font-semibold text-danger">
              {payError}
            </p>
          )}

          <button className="btn btn-primary mt-5 w-full" disabled={paying}>
            {paying ? "Μεταφορά στην πληρωμή..." : "Συνέχεια στην πληρωμή"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Η πληρωμή γίνεται με ασφάλεια μέσω PayPal. Το domain καταχωρείται αμέσως μετά.
          </p>
        </form>
      </dialog>
    </>
  );
}

function Field({
  label,
  className = "",
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm font-semibold ${className}`}>
      {label}
      <input className="field mt-1 font-normal" {...props} />
    </label>
  );
}
