import "server-only";

// Client για το name.com API v4. Τρέχει ΜΟΝΟ στον server (το token δεν φτάνει ποτέ στον browser).
// NAMECOM_ENV=prod  -> πραγματικές καταχωρήσεις και χρεώσεις
// οτιδήποτε άλλο    -> dev/sandbox (api.dev.name.com), χωρίς πραγματικές χρεώσεις

const isProd = process.env.NAMECOM_ENV === "prod";
const BASE = isProd ? "https://api.name.com/v4" : "https://api.dev.name.com/v4";

export const namecomMode = isProd ? "prod" : "dev";

function authHeader() {
  const user = process.env.NAMECOM_USERNAME;
  const token = process.env.NAMECOM_TOKEN;
  if (!user || !token) {
    throw new Error("Λείπουν τα NAMECOM_USERNAME / NAMECOM_TOKEN");
  }
  return "Basic " + Buffer.from(`${user}:${token}`).toString("base64");
}

async function request<T>(path: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
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

export type AvailabilityResult = {
  domainName: string;
  sld?: string;
  tld?: string;
  purchasable?: boolean;
  premium?: boolean;
  purchasePrice?: number;
  purchaseType?: string;
  renewalPrice?: number;
};

export async function checkAvailability(domainNames: string[]): Promise<AvailabilityResult[]> {
  const { status, data } = await request<{ results?: AvailabilityResult[]; message?: string }>(
    "/domains:checkAvailability",
    { method: "POST", body: JSON.stringify({ domainNames }) },
  );
  if (status !== 200) {
    throw new Error(`name.com checkAvailability ${status}: ${data.message ?? "σφάλμα"}`);
  }
  return data.results ?? [];
}

export type Contact = {
  firstName: string;
  lastName: string;
  companyName?: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string; // ISO 3166-1 alpha-2, π.χ. "GR"
  phone: string; // μορφή +30.6912345678
  email: string;
};

export async function domainExists(domainName: string): Promise<boolean> {
  const { status } = await request(`/domains/${encodeURIComponent(domainName)}`);
  return status === 200;
}

export async function registerDomain(opts: {
  domainName: string;
  purchasePrice: number; // το όνομα.com απαιτεί να ταιριάζει με την τρέχουσα τιμή
  contact: Contact;
}) {
  const { domainName, purchasePrice, contact } = opts;
  const body = {
    domain: {
      domainName,
      privacyEnabled: true,
      locked: true,
      autorenewEnabled: false,
      contacts: {
        registrant: contact,
        admin: contact,
        tech: contact,
        billing: contact,
      },
    },
    purchasePrice,
    years: 1,
  };
  const { status, data } = await request<{ message?: string; details?: string }>("/domains", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (status !== 200) {
    throw new Error(`name.com register ${status}: ${data.message ?? ""} ${data.details ?? ""}`.trim());
  }
  return data;
}
