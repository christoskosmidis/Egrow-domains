# Egrow Domains (domains.egrowcreative.gr)

Ξεχωριστό Next.js project μόνο για domains. Το κύριο site (`egrow-site`, egrowcreative.gr) το συνδέει από το μενού.
Πληρωμές με PayPal, καταχώρηση μέσω name.com.

## Ροή αγοράς

1. `POST /api/domains/search`: διαθεσιμότητα στο name.com και τιμή πώλησης (`lib/pricing.ts`).
2. `POST /api/checkout`: ξαναελέγχει διαθεσιμότητα και τιμή στον server, δημιουργεί παραγγελία PayPal και στέλνει τον πελάτη στο PayPal.
3. `GET /api/paypal/return`: ο πελάτης επιστρέφει μετά την έγκριση. Ο server ελέγχει ξανά ότι το domain είναι διαθέσιμο
   (αν όχι, δεν γίνεται χρέωση), εισπράττει, καταχωρεί το domain στο name.com και στέλνει email.
   Αν η καταχώρηση αποτύχει, γίνεται αυτόματη επιστροφή χρημάτων.

Αν ο πελάτης εγκρίνει στο PayPal αλλά κλείσει τον browser πριν επιστρέψει, δεν γίνεται καμία χρέωση.

## Τοπικά

```bash
cp .env.example .env.local   # name.com dev + PayPal sandbox keys + APP_SECRET
npm install && npm run dev
```

Για δοκιμές χρησιμοποίησε τους sandbox λογαριασμούς (Business και Personal) του PayPal Developer Dashboard.

## Deploy (Vercel) στο domains.egrowcreative.gr

1. Νέο project στο Vercel από αυτόν τον φάκελο, με τα env από `.env.example` (`NEXT_PUBLIC_SITE_URL=https://domains.egrowcreative.gr`).
2. Settings → Domains: πρόσθεσε `domains.egrowcreative.gr` και φτιάξε CNAME `domains` → `cname.vercel-dns.com` στο DNS.
3. Φόρτωσε υπόλοιπο στο name.com. Μόνο όταν όλα δουλεύουν σε dev/sandbox, βάλε `NAMECOM_ENV=prod`, `PAYPAL_ENV=live` και τα live κλειδιά.
   Μετά την αλλαγή env κάνε Redeploy.

## Σημαντικά

- Το name.com δεν πουλάει .gr.
- Margins: `lib/pricing.ts`. Κείμενα: `lib/site.ts` (συμπλήρωσε τα `TODO`). Όροι και Απόρρητο: έλεγξέ τα με νομικό.
