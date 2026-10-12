import "server-only";

// Στέλνει email μέσω Resend (https://resend.com). Αν δεν έχει οριστεί RESEND_API_KEY,
// απλά γράφει στα logs (χρήσιμο στην ανάπτυξη).
export async function sendMail(opts: { subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.MAIL_FROM ?? "Egrow Creative <onboarding@resend.dev>";

  if (!key || !to) {
    console.log("[mail:not-configured]", opts.subject, "\n", opts.text);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: opts.subject,
      text: opts.text,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    console.error("[mail:failed]", res.status, await res.text());
  }
}
