// GET /api/tesoreria — estado público de la tesorería de SE pay en OKX (solo lectura).
// Requiere secretos en Cloudflare Pages: OKX_API_KEY, OKX_API_SECRET, OKX_API_PASSPHRASE
// (una API key de OKX con permiso de SOLO LECTURA). Sin ellos responde { configured: false }.
// Opcional: OKX_INST_TYPE = SWAP (perpetuos, por defecto) o SPOT, según cómo operen los bots.
const PAIRS = ['BTC', 'AVAX'];
const OKX = 'https://www.okx.com';

const json = (body, status = 200, maxAge = 30) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` },
  });

async function sign(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function okx(env, path) {
  const ts = new Date().toISOString();
  const res = await fetch(OKX + path, {
    headers: {
      'OK-ACCESS-KEY': env.OKX_API_KEY,
      'OK-ACCESS-SIGN': await sign(env.OKX_API_SECRET, ts + 'GET' + path),
      'OK-ACCESS-TIMESTAMP': ts,
      'OK-ACCESS-PASSPHRASE': env.OKX_API_PASSPHRASE,
    },
  });
  const body = await res.json();
  if (body.code !== '0') throw new Error('OKX ' + body.code + ': ' + body.msg);
  return body.data;
}

const isPair = (instId = '') => PAIRS.some((p) => instId.startsWith(p + '-'));
const num = (v) => (v === '' || v == null ? null : Number(v));

export async function onRequestGet({ env }) {
  if (!env.OKX_API_KEY || !env.OKX_API_SECRET || !env.OKX_API_PASSPHRASE) return json({ configured: false }, 200, 60);
  try {
    const [balance, positions, fills] = await Promise.all([
      okx(env, '/api/v5/account/balance'),
      okx(env, '/api/v5/account/positions'),
      okx(env, `/api/v5/trade/fills-history?instType=${env.OKX_INST_TYPE === 'SPOT' ? 'SPOT' : 'SWAP'}&limit=100`),
    ]);
    const b = balance[0] || {};
    return json({
      configured: true,
      updatedAt: new Date().toISOString(),
      totalEquityUsd: num(b.totalEq),
      balances: (b.details || []).map((d) => ({ ccy: d.ccy, equityUsd: num(d.eqUsd) })).filter((d) => d.equityUsd > 1),
      positions: positions.filter((p) => isPair(p.instId)).map((p) => ({
        instId: p.instId, side: p.posSide === 'net' ? (Number(p.pos) >= 0 ? 'long' : 'short') : p.posSide,
        size: num(p.pos), avgPx: num(p.avgPx), markPx: num(p.markPx), lever: num(p.lever), upl: num(p.upl), notionalUsd: num(p.notionalUsd),
      })),
      fills: fills.filter((f) => isPair(f.instId)).slice(0, 50).map((f) => ({
        instId: f.instId, side: f.side, px: num(f.fillPx), size: num(f.fillSz), pnl: num(f.fillPnl), fee: num(f.fee), ts: Number(f.ts),
      })),
    });
  } catch (e) {
    return json({ configured: true, error: 'No se pudo leer OKX en este momento.' }, 502, 10);
  }
}
