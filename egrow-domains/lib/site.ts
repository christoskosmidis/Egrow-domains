// Περιεχόμενο του domains.egrowcreative.gr. Τα "TODO" είναι placeholders.

export const site = {
  name: "Egrow Domains",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://domains.egrowcreative.gr",
  mainUrl: process.env.NEXT_PUBLIC_MAIN_URL ?? "https://egrowcreative.gr",
  email: "info@egrowcreative.gr", // TODO
  phone: "+30 69X XXX XXXX", // TODO
  whatsapp: "https://wa.me/3069XXXXXXXX", // TODO: αριθμός σε διεθνή μορφή χωρίς +
  social: {
    instagram: "https://instagram.com/", // TODO
    facebook: "https://facebook.com/", // TODO
    linkedin: "https://linkedin.com/", // TODO
  },
};

export const nav = [
  { href: "/#search", label: "Αναζήτηση" },
  { href: "/#how", label: "Πώς λειτουργεί" },
  { href: "/#faq", label: "FAQ" },
  { href: `${site.mainUrl}/#contact`, label: "Επικοινωνία" },
];

export const steps = [
  { title: "Αναζητήστε", text: "Γράψτε το όνομα που θέλετε και δείτε αμέσως τι είναι διαθέσιμο." },
  { title: "Πληρώστε", text: "Βλέπετε την τελική τιμή με ΦΠΑ και πληρώνετε με κάρτα, με ασφάλεια." },
  { title: "Έτοιμο", text: "Το domain καταχωρείται αμέσως στο όνομά σας και σας έρχεται email." },
];

export const faq = [
  {
    q: "Πόσο διαρκεί η καταχώρηση;",
    a: "Η τιμή που βλέπετε αφορά καταχώρηση για 1 έτος, με privacy protection και κλείδωμα μεταφοράς.",
  },
  {
    q: "Η τιμή περιλαμβάνει ΦΠΑ;",
    a: "Ναι. Η τιμή που εμφανίζεται είναι η τελική τιμή που πληρώνετε.",
  },
  {
    q: "Τι γίνεται αν η καταχώρηση αποτύχει;",
    a: "Η πληρωμή επιστρέφεται αυτόματα και δεν χρεώνεστε.",
  },
  {
    q: "Ποιος είναι ο κάτοχος του domain;",
    a: "Εσείς. Τα στοιχεία που δίνετε καταχωρούνται ως κάτοχος, γι' αυτό πρέπει να είναι αληθή.",
  },
  {
    q: "Μπορώ να πάρω domain .gr;",
    a: "Προς το παρόν όχι από εδώ. Για .gr επικοινωνήστε μαζί μας και θα το αναλάβουμε.",
  },
  {
    q: "Χρειάζομαι και ιστοσελίδα;",
    a: "Αν θέλετε, φτιάχνουμε ιστοσελίδα ή e-shop πάνω στο domain σας. Δείτε τα πακέτα στο egrowcreative.gr.",
  },
];
