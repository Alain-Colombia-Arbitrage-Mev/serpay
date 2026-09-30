// POST /api/lead — guarda un registro del formulario en Workers KV (binding LEADS).
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }

  // Campo trampa: los bots lo llenan, las personas no lo ven.
  if (clean(d.website, 200)) return json({ ok: true });

  const lead = {
    name: clean(d.name, 80),
    email: clean(d.email, 120).toLowerCase(),
    whatsapp: clean(d.whatsapp, 24),
    interest: clean(d.interest, 60),
    consent_contact: d.consent_contact === true,
    consent_marketing: d.consent_marketing === true,
    ref: clean(d.ref, 40) || null,
    project: clean(d.project, 40) || null,
    page: clean(d.page, 80),
    country: request.cf?.country || null,
    created_at: new Date().toISOString(),
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email);
  const validPhone = lead.whatsapp.replace(/\D/g, '').length >= 7;
  if (!lead.name || !validEmail || !validPhone || !lead.consent_contact) return json({ ok: false, error: 'invalid' }, 422);

  const key = `lead:${lead.created_at}:${crypto.randomUUID().slice(0, 8)}`;
  await env.LEADS.put(key, JSON.stringify(lead), { metadata: { email: lead.email, interest: lead.interest } });
  return json({ ok: true });
}

export const onRequestGet = () => json({ ok: false, error: 'method_not_allowed' }, 405);
