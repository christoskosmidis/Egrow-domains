# Egrow Domains (domains.egrowcreative.gr)

Ξεχωριστό Next.js project μόνο για domains. Το κύριο site (`egrow-site`, egrowcreative.gr) το συνδέει από το μενού.

## Ροή αγοράς

1. `POST /api/domains/search`: διαθεσιμότητα στο name.com και τιμή πώλησης (`lib/pricing.ts`).
2. `POST /api/checkout`: ξαναελέγχει διαθεσιμότητα και τιμή στον server και ανοίγει Stripe Checkout.
3. `POST /api/webhook` (Stripe, `checkout.session.completed`): καταχωρεί το domain στο name.com.
   Αν αποτύχει, γίνεται αυτόματη επιστροφή χρημάτων και σου έρχεται email.

## Τοπικά

```bash
cp .env.example .env.local   # name.com dev + Stripe test keys
npm install && npm run dev
stripe listen --forward-to localhost:3000/api/webhook   # δίνει το STRIPE_WEBHOOK_SECRET
```

Δοκιμαστική κάρτα: `4242 4242 4242 4242`, οποιαδήποτε μελλοντική ημερομηνία και CVC.

## Deploy (Vercel) στο domains.egrowcreative.gr

1. Νέο project στο Vercel από αυτόν τον φάκελο, με τα env από `.env.example`
   (`NEXT_PUBLIC_SITE_URL=https://domains.egrowcreative.gr`).
2. Project → Settings → Domains: πρόσθεσε `domains.egrowcreative.gr`. Στο DNS του egrowcreative.gr φτιάξε
   CNAME `domains` → `cname.vercel-dns.com` (το Vercel δείχνει την ακριβή τιμή).
3. Stripe → Webhooks: endpoint `https://domains.egrowcreative.gr/api/webhook`, event `checkout.session.completed`.
4. Φόρτωσε υπόλοιπο στο name.com. Μόνο όταν όλα δουλεύουν σε dev/test, βάλε `NAMECOM_ENV=prod` και live Stripe keys.

## Σημαντικά

- Το name.com δεν πουλάει .gr.
- Margins: `lib/pricing.ts`. Κείμενα: `lib/site.ts` (συμπλήρωσε τα `TODO`). Όροι και Απόρρητο: έλεγξέ τα με νομικό.
