import { NextResponse } from "next/server";

/**
 * Contact form endpoint.
 * Set CONTACT_WEBHOOK_URL (Zapier / Make / n8n / Slack / CRM) to receive enquiries as JSON.
 * Without it the endpoint answers 501 and the form hands off to WhatsApp / email instead.
 */
export async function POST(req: Request) {
  const hook = process.env.CONTACT_WEBHOOK_URL;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name || !phone) return NextResponse.json({ ok: false, error: "Name and phone are required" }, { status: 422 });
  if (!hook) return NextResponse.json({ ok: false, error: "Not configured" }, { status: 501 });

  const payload = {
    source: "stecsecure.com",
    receivedAt: new Date().toISOString(),
    name: name.slice(0, 200),
    phone: phone.slice(0, 40),
    email: String(body.email ?? "").slice(0, 200),
    property: String(body.property ?? "").slice(0, 100),
    interests: Array.isArray(body.interests) ? body.interests.map(String).slice(0, 10) : [],
    message: String(body.message ?? "").slice(0, 4000),
  };
  try {
    const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(String(r.status));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
  }
}
