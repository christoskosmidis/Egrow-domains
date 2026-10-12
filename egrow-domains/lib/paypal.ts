import "server-only";

// PayPal Orders API v2. PAYPAL_ENV=live -> πραγματικές πληρωμές, οτιδήποτε άλλο -> sandbox.
const live = process.env.PAYPAL_ENV === "live";
const BASE = live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
export const paypalMode = live ? "live" : "sandbox";

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Λείπουν τα PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`PayPal auth ${res.status}`);
  return data.access_token as string;
}

async function pp<T>(path: string, init: RequestInit & { requestId?: string } = {}): Promise<{ status: number; data: T }> {
  const token = await accessToken();
  const { requestId, ...rest } = init;
  const res = await fetch(BASE + path, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  return { status: res.status, data: data as T };
}

export type PayPalOrder = {
  id: string;
  status: string;
  links?: { rel: string; href: string }[];
  purchase_units?: {
    invoice_id?: string;
    custom_id?: string;
    amount?: { currency_code: string; value: string };
    payments?: { captures?: { id: string; status: string; amount?: { value: string } }[] };
  }[];
  message?: string;
};

export async function createOrder(o: {
  amountEur: string; // "22.90"
  domain: string;
  invoiceId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const { status, data } = await pp<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    requestId: o.invoiceId,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          invoice_id: o.invoiceId,
          custom_id: o.domain,
          description: `Domain ${o.domain} (1 έτος)`,
          amount: { currency_code: "EUR", value: o.amountEur },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: o.returnUrl,
            cancel_url: o.cancelUrl,
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            locale: "el-GR",
            brand_name: "Egrow Creative",
          },
        },
      },
    }),
  });
  const approve = data.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (status >= 300 || !data.id || !approve) throw new Error(`PayPal createOrder ${status}: ${data.message ?? ""}`);
  return { id: data.id, approveUrl: approve };
}

export async function getOrder(id: string): Promise<PayPalOrder> {
  const { status, data } = await pp<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}`);
  if (status !== 200) throw new Error(`PayPal getOrder ${status}`);
  return data;
}

export async function captureOrder(id: string): Promise<PayPalOrder> {
  const { status, data } = await pp<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: "POST",
    requestId: `capture-${id}`,
    body: "{}",
  });
  if (status >= 300) throw new Error(`PayPal capture ${status}: ${data.message ?? ""}`);
  return data;
}

export async function refundCapture(captureId: string) {
  const { status, data } = await pp<{ message?: string }>(
    `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
    { method: "POST", requestId: `refund-${captureId}`, body: "{}" },
  );
  if (status >= 300) throw new Error(`PayPal refund ${status}: ${data.message ?? ""}`);
}
