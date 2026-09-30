
/* ===== Utilidades de proyectos ===== */
const SE = {
  usd: n => 'US$' + Math.round(n).toLocaleString('de-DE'),
  compact: n => n >= 1e6 ? 'US$' + String(+(n / 1e6).toFixed(2)).replace('.', ',') + 'M' : n >= 1e3 ? 'US$' + Math.round(n / 1e3) + 'k' : 'US$' + n,
  riskLabel: r => r === 'high' ? ['Riesgo alto', 'r-high'] : ['Riesgo medio-alto', 'r-mid'],
  goLive: p => {
    if (!p.golive) return { short: 'Ya está al aire', long: 'Ya está operando: no hay tiempo de espera.', date: null };
    const d = new Date(p.deadline + 'T12:00'); d.setMonth(d.getMonth() + p.golive);
    const date = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return { short: p.golive + (p.golive === 1 ? ' mes' : ' meses') + ' tras el cierre', long: p.golive + (p.golive === 1 ? ' mes' : ' meses') + ' desde el cierre de la ronda, estimado para ' + date + '.', date };
  },
  daysLeft: d => Math.ceil((new Date(d + 'T23:59:59') - new Date()) / 864e5),
  statusClass: s => s === 'Abierto' ? 'st-open' : s === 'Financiado' ? 'st-done' : 'st-soon',
  capmeter: (p, lg) => {
    const pct = Math.min(100, p.raised / p.hardcap * 100), soft = p.softcap / p.hardcap * 100, ok = p.raised >= p.softcap;
    const state = p.status === 'Financiado' ? '<b class="up">✓ Hard cap completado</b>'
      : p.status === 'Próximamente' ? '<b style="color:#8fd0ff">Abre pronto</b>'
      : ok ? '<b class="up">✓ Soft cap alcanzado</b>' : '<b style="color:var(--amber)">Faltan ' + SE.compact(p.softcap - p.raised) + ' para el soft cap</b>';
    return `<div class="cm${ok ? ' ok' : ''}${lg ? ' lg' : ''}">
      <div class="cm-top">${state}<span class="mono">${pct.toFixed(0)} %</span></div>
      <div class="cm-track"><span class="cm-guard" style="width:${soft}%"></span><i class="cm-fill" style="width:${pct}%"></i><span class="cm-mk" style="left:${soft}%"></span><span class="cm-mk end"></span></div>
      <div class="cm-leg"><div><small>Recaudado</small><b>${SE.compact(p.raised)}</b></div><div class="c" style="left:${Math.min(66, Math.max(34, soft))}%"><small>Soft cap</small><b>${SE.compact(p.softcap)}</b></div><div class="r"><small>Hard cap</small><b>${SE.compact(p.hardcap)}</b></div></div>
      ${lg ? `<div class="cm-note"><span class="cm-sw g"></span>Zona de garantía: si la ronda cierra aquí, recibes el 100 % de vuelta.<span class="cm-sw f"></span>Recaudado</div>` : ''}
    </div>`;
  },
  capbar: p => {
    const pct = Math.min(100, p.raised / p.hardcap * 100), soft = p.softcap / p.hardcap * 100;
    return `<div class="capbar${p.raised >= p.softcap ? ' reached' : ''}"><i style="width:${pct}%"></i><span class="mk" style="left:${soft}%"><em>Soft cap</em></span></div>`;
  }
};

/* ===== Catálogo ===== */
(function () {
  const box = document.getElementById('catalog'); if (!box || !window.PROJECTS) return;
  function render(f) {
    box.innerHTML = PROJECTS.filter(p => f === 'all' || (f === 'app' ? p.app : p.status === f)).map(p => {
      const [rl, rc] = SE.riskLabel(p.risk), pct = p.raised / p.hardcap * 100;
      return `<a href="proyecto.html?p=${p.slug}" class="card proj">
        <div class="top img" style="background:linear-gradient(180deg,rgba(10,11,12,.05) 30%,rgba(10,11,12,.85)),url(assets/img/${p.slug}.jpg) center/cover,#171a1c">
          <span class="pill">${p.flag} ${p.sector} · ${p.country}</span><span class="risk ${rc}">${rl}</span>
          <span class="status ${SE.statusClass(p.status)}">${p.status}</span>
        </div>
        <div class="body">
          <div><h3>${p.name}</h3><p>${p.summary}</p></div>
          <div class="kv"><div><small>Retorno estimado</small><b>${p.target}</b></div><div><small>Plazo</small><b>${p.term} meses</b></div><div><small>Ticket mín.</small><b>US$${p.ticket}</b></div></div>
          <div>${SE.capmeter(p)}
            <div class="capinfo mute"><span>${p.investors.toLocaleString('de-DE')} participantes</span><span>${p.status === 'Abierto' ? SE.daysLeft(p.deadline) + ' días restantes' : p.status}</span></div>
            <div class="golive-chip"><span>◷</span>Al aire: ${SE.goLive(p).short}</div>
          </div>
          <span class="go">Ver proyecto →</span>
        </div></a>`;
    }).join('');
  }
  document.getElementById('filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('#filters button').forEach(x => x.classList.toggle('on', x === b)); render(b.dataset.f);
  });
  render('all');
})();

/* ===== Página de proyecto ===== */
(function () {
  const root = document.getElementById('pd'); if (!root || !window.PROJECTS) return;
  const slug = new URLSearchParams(location.search).get('p');
  const p = PROJECTS.find(x => x.slug === slug) || PROJECTS[0];
  document.title = p.name + ' — SE pay';
  const [rl, rc] = SE.riskLabel(p.risk), pct = p.raised / p.hardcap * 100, days = SE.daysLeft(p.deadline);
  const cta = p.status === 'Abierto' ? `<a href="registro.html?p=${p.slug}" class="btn btn-lime" style="justify-content:center;width:100%">Participar en este proyecto →</a>`
    : p.status === 'Próximamente' ? `<a href="registro.html?p=${p.slug}" class="btn btn-lime" style="justify-content:center;width:100%">Avisarme cuando abra →</a>`
    : `<span class="btn btn-ghost" style="justify-content:center;width:100%;cursor:default">Ronda completada</span><a href="registro.html?p=${p.slug}" class="btn btn-ghost" style="justify-content:center;width:100%">Comprar en mercado secundario</a>`;
  root.innerHTML = `
  <nav class="crumbs"><a href="proyectos.html">Proyectos</a> / <span>${p.name}</span></nav>
  <div class="pd-hero-img" style="background-image:linear-gradient(180deg,rgba(10,11,12,0) 50%,rgba(10,11,12,.6)),url(assets/img/${p.slug}.jpg)" role="img" aria-label="${p.name}"></div>
  <div class="pd-head" style="--c:${p.color}">
    <div class="tags"><span class="pill">${p.flag} ${p.sector} · ${p.country}</span><span class="status ${SE.statusClass(p.status)}">${p.status}</span><span class="risk ${rc}">${rl}</span></div>
    <h1 class="page-title" style="margin:18px 0 12px;text-align:left">${p.name}</h1>
    <p class="lead">${p.summary}</p>
  </div>
  <div class="pd-grid">
    <div class="pd-main">
      <div class="kv big-kv"><div><small>Retorno estimado</small><b>${p.target}</b></div><div><small>Plazo</small><b>${p.term} meses</b></div><div><small>Ticket mínimo</small><b>US$${p.ticket}</b></div><div><small>Participantes</small><b>${p.investors.toLocaleString('de-DE')}</b></div><div><small>Al aire</small><b>${p.golive ? p.golive + ' m tras el cierre' : 'Ya opera'}</b></div></div>
      <div class="card pd-sec"><h3>Sobre el proyecto</h3><p>${p.about}</p></div>
      <div class="card pd-sec golive">
        <h3>Tiempo hasta estar al aire</h3>
        <div class="gl-track">
          <div class="gl-step done"><span></span><small>Hoy</small><b>Ronda ${p.status === 'Financiado' ? 'cerrada' : p.status === 'Próximamente' ? 'por abrir' : 'abierta'}</b></div>
          <div class="gl-line"></div>
          <div class="gl-step ${p.status === 'Financiado' ? 'done' : ''}"><span></span><small>${new Date(p.deadline + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</small><b>Cierre de la ronda</b></div>
          <div class="gl-wait" style="flex:${Math.max(1, p.golive)}"><em>${p.golive ? p.golive + (p.golive === 1 ? ' mes' : ' meses') + ' de espera' : 'sin espera'}</em></div>
          <div class="gl-step live ${p.golive === 0 ? 'done' : ''}"><span></span><small>${SE.goLive(p).date || 'Ya opera'}</small><b>Al aire</b></div>
        </div>
        <p>${SE.goLive(p).long} Durante la espera no hay distribuciones: el proyecto está construyendo, contratando o lanzando. La fecha queda escrita en el contrato de la ronda y, si se retrasa más de 90 días, el contrato lo marca públicamente como retrasado.</p>
      </div>
      <div class="card pd-sec rc" id="calc">
        <h3>Calculadora de retorno estimado</h3>
        <p class="rc-intro">Cuánto podrías recibir al final de los ${p.term} meses, ya descontados el fee de depósito, el success fee y el fee de retiro.</p>
        <div class="rc-in">
          <label for="rc-amt">¿Cuánto quieres aportar?</label>
          <div class="rc-amt"><span>US$</span><input type="number" id="rc-amt" min="${p.ticket}" max="1000000" step="50" value="${Math.max(p.ticket, 1000)}" inputmode="numeric"></div>
          <input type="range" id="rc-range" min="${p.ticket}" max="50000" step="50" value="${Math.max(p.ticket, 1000)}" aria-label="Monto a aportar">
          <div class="rc-quick">${[500, 1000, 5000, 10000, 25000].filter(v => v >= p.ticket).map(v => `<button type="button" data-v="${v}">${SE.compact(v)}</button>`).join('')}</div>
        </div>
        <div class="rc-sc" id="rc-sc"></div>
        <div class="flow" id="rc-flow"></div>
        <p class="note" style="margin-top:12px">Escenarios calculados con el retorno estimado del proyecto (${p.target} anual) y el plazo de ${p.term} meses${p.golive ? `, que incluye ${p.golive} ${p.golive === 1 ? 'mes' : 'meses'} de espera hasta estar al aire sin distribuciones` : ''}. Es una estimación, no una promesa: un proyecto puede devolver menos de lo aportado o nada.</p>
      </div>
      ${p.app ? (() => { const a = p.app, net = a.price * .78, gross = a.subsTarget * a.price; return `<div class="card pd-sec"><h3>Economía de la app</h3>
        <div class="kv big-kv" style="margin-bottom:18px"><div><small>Suscriptores hoy</small><b>${a.subsNow.toLocaleString('de-DE')}</b></div><div><small>Meta</small><b>${a.subsTarget.toLocaleString('de-DE')}</b></div><div><small>Precio mensual</small><b>US$${a.price.toFixed(2).replace('.', ',')}</b></div><div><small>Bruto al mes en la meta</small><b>${SE.compact(gross)}</b></div></div>
        <div class="usebar"><div><span>Avance hacia la meta de suscriptores</span><b>${(a.subsNow / a.subsTarget * 100).toFixed(0)} %</b></div><div class="bar"><i style="width:${a.subsNow / a.subsTarget * 100}%"></i></div></div>
        <div class="flow" style="margin-top:14px">
          <div class="r"><span>Suscripción mensual</span><span>US$${a.price.toFixed(2).replace('.', ',')}</span></div>
          <div class="r"><span>Comisión de la tienda (≈22 %)</span><span>− US$${(a.price * .22).toFixed(2).replace('.', ',')}</span></div>
          <div class="r t"><span>Ingreso neto por suscriptor</span><span>US$${net.toFixed(2).replace('.', ',')}</span></div>
          <div class="r"><span>Vox Populi, máximo 35 % del neto</span><span>hasta US$${(net * .35).toFixed(2).replace('.', ',')}</span></div>
          <div class="r"><span>Cancelación mensual estimada</span><span>${(a.churn * 100).toFixed(0)} %</span></div>
        </div>
        <a href="economia-apps.html" class="go" style="display:inline-block;margin-top:14px">Ver el flujo económico completo y el runway de la red →</a>
      </div>`; })() : ''}
      <div class="card pd-sec"><h3>Uso de los fondos</h3>${p.use.map(([k, v]) => `<div class="usebar"><div><span>${k}</span><b>${v} %</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}</div>
      <div class="card pd-sec"><h3>Hitos</h3><div class="miles">${p.milestones.map(([d, t, ok]) => `<div class="${ok ? 'ok' : ''}"><span></span><small>${d}</small><b>${t}</b></div>`).join('')}</div></div>
      <div class="card pd-sec"><h3>Comisiones de este proyecto</h3>
        <div class="flow">
          <div class="r"><span>Fee de depósito</span><span>1,5 %</span></div>
          <div class="r"><span>Cuota de administración</span><span>2 % anual</span></div>
          <div class="r"><span>Success fee</span><span>20 % del excedente sobre 8 % anual</span></div>
          <div class="r"><span>Comisión de desembolso (la paga el proyecto)</span><span>${(p.disbursementFee * 100).toFixed(0)} %</span></div>
          <div class="r"><span>Fee de retiro</span><span>1,5 %</span></div>
        </div>
        <p class="note" style="margin-top:12px">Si la ronda no alcanza el soft cap antes del ${new Date(p.deadline + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}, recibes el 100 % de vuelta, incluido el fee de depósito.</p>
      </div>
      <div class="card pd-sec"><h3>Contrato inteligente</h3>
        <div class="flow">
          <div class="r"><span>Red</span><span class="mono avax-badge">Avalanche C-Chain</span></div>
          <div class="r"><span>Estándar</span><span class="mono">ERC-6960 · Dual Layer Token</span></div>
          <div class="r"><span>mainId · subId</span><span class="mono">${p.mainId} · ${p.subId} (Serie A)</span></div>
          <div class="r"><span>Precio por token</span><span class="mono">US$1</span></div>
          <div class="r"><span>Soft cap · hard cap</span><span class="mono">${SE.usd(p.softcap)} · ${SE.usd(p.hardcap)}</span></div>
          <div class="r"><span>Al aire comprometido (goLiveBy)</span><span class="mono">${SE.goLive(p).date || 'ya opera'}</span></div>
          <div class="r"><span>Tolerancia antes de marcar retraso</span><span class="mono">90 días</span></div>
          <div class="r"><span>Contrato del token</span><span class="mono mute">Se publica al desplegar</span></div>
          <div class="r"><span>Wallet administrativa del proyecto</span><span class="mono mute">Multisig 2 de 3 · se publica al desplegar</span></div>
        </div>
        <a href="tecnologia.html#erc6960" class="go" style="display:inline-block;margin-top:14px">Cómo funcionan nuestros contratos →</a>
      </div>
      <div class="card pd-sec"><h3>Contabilidad on-chain <span class="pill" style="font-weight:400;margin-left:8px">Vista de ejemplo</span></h3>
        ${p.ledger.length ? `<div class="tscroll"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Tx</th></tr></thead><tbody>${p.ledger.map(([d, c, a]) => `<tr><td>${d}</td><td>${c}</td><td class="${a > 0 ? 'up' : ''}">${a > 0 ? '+ ' : '− '}${SE.usd(Math.abs(a))}</td><td class="mono hash">0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}</td></tr>`).join('')}</tbody></table></div>`
        : '<p>La contabilidad se abre con el primer aporte de la ronda.</p>'}
      </div>
      <div class="pd-2">
        <div class="card pd-sec"><h3>Documentos</h3><ul class="docs">${p.docs.map(d => `<li><span>▤</span>${d}</li>`).join('')}</ul></div>
        <div class="card pd-sec riskbox" style="padding:24px"><h3 style="color:var(--amber)">Riesgos principales</h3><ul class="docs">${p.risks.map(r => `<li><span style="color:var(--amber)">!</span>${r}</li>`).join('')}</ul></div>
      </div>
    </div>
    <aside class="pd-side">
      <div class="card invest">
        <div class="t-h"><span>Ronda Serie A</span><span class="mono up">${pct.toFixed(1).replace('.', ',')} %</span></div>
        <div class="bigraised">${SE.usd(p.raised)}</div>
        <small class="mute">de ${SE.usd(p.hardcap)} · hard cap</small>
        ${SE.capmeter(p, true)}
        <div class="flow" style="margin-top:18px">
          <div class="r"><span>Soft cap</span><span>${p.raised >= p.softcap ? '<b class="up">Alcanzado ✓</b>' : 'Faltan ' + SE.usd(p.softcap - p.raised)}</span></div>
          <div class="r"><span>${days > 0 ? 'Cierra en' : 'Cerró'}</span><span>${days > 0 ? days + ' días' : new Date(p.deadline + 'T12:00').toLocaleDateString('es-ES')}</span></div>
        </div>
        ${p.status === 'Abierto' ? `<div class="field" style="margin-top:18px"><label for="amt">¿Cuánto quieres depositar? <b id="amt-v"></b></label><input type="range" id="amt" min="${p.ticket}" max="20000" step="50" value="1000"></div>
        <div class="flow" id="amt-flow"></div>` : ''}
        <div style="display:grid;gap:10px;margin-top:18px">${cta}<a href="#calc" class="btn btn-ghost" style="justify-content:center;width:100%">Calcular mi retorno estimado ↓</a></div>
        <small class="fine">Retorno estimado, no garantizado. Puedes perder parte o todo tu capital.</small>
      </div>
    </aside>
  </div>`;
  /* Calculadora de retorno estimado */
  (function () {
    const nums = (p.target.match(/[\d,.]+/g) || ['0']).map(x => parseFloat(x.replace(',', '.')) / 100);
    const lo = nums[0], hi = nums[1] ?? nums[0], mid = (lo + hi) / 2, years = p.term / 12;
    const pc = n => (Math.round(n * 1000) / 10).toString().replace('.', ',') + ' %';
    const est = (a, r) => {
      const fee = a * .015, cap = a - fee, gross = r * years, pref = .08 * years;
      const inv = gross <= pref ? gross : pref + (gross - pref) * .8;
      const sf = gross > pref ? (gross - pref) * .2 * cap : 0;
      const before = cap * (1 + inv), wfee = before * .015, back = before - wfee;
      return { fee, cap, grossAmt: cap * gross, pref: Math.min(gross, pref) * cap, sf, wfee, back, gain: back - a, annual: Math.pow(back / a, 1 / years) - 1 };
    };
    const $a = document.getElementById('rc-amt'), $r = document.getElementById('rc-range');
    function draw(a) {
      a = Math.max(p.ticket, Math.min(1000000, +a || 0));
      const sc = [['Bajo', lo], ['Estimado', mid], ['Alto', hi]].map(([k, r]) => [k, r, est(a, r)]);
      document.getElementById('rc-sc').innerHTML = sc.map(([k, r, e], i) => `<div class="${i === 1 ? 'on' : ''}"><small>Escenario ${k.toLowerCase()} · ${pc(r)} anual</small><b>${SE.usd(e.back)}</b><span class="up">+ ${SE.usd(e.gain)}</span><em>≈ ${pc(e.annual)} neto al año</em></div>`).join('')
        + `<div class="loss"><small>Si el proyecto fracasa</small><b>Hasta −${SE.usd(a)}</b><span>Puedes perder todo lo aportado</span></div>`;
      const e = sc[1][2];
      document.getElementById('rc-flow').innerHTML = [
        ['Aportas', SE.usd(a)], ['Fee de depósito 1,5 %', '− ' + SE.usd(e.fee)], ['Tokens que recibes', Math.round(e.cap).toLocaleString('de-DE') + ' tokens'],
        ['Ganancia del proyecto en ' + p.term + ' meses (escenario estimado)', '+ ' + SE.usd(e.grossAmt)], ['Success fee de SE pay (20 % sobre el 8 % anual)', '− ' + SE.usd(e.sf)],
        ['Fee de retiro 1,5 %', '− ' + SE.usd(e.wfee)], ['Recibes al final', SE.usd(e.back)]
      ].map(([k, v], i, arr) => `<div class="r${i === arr.length - 1 ? ' t' : ''}"><span>${k}</span><span${i === arr.length - 1 ? ' class="up"' : ''}>${v}</span></div>`).join('');
    }
    $a.addEventListener('input', () => { $r.value = $a.value; draw($a.value); });
    $a.addEventListener('change', () => { const v = Math.max(p.ticket, +$a.value || p.ticket); $a.value = v; $r.value = v; draw(v); });
    $r.addEventListener('input', () => { $a.value = $r.value; draw($r.value); });
    document.querySelector('.rc-quick').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; $a.value = $r.value = b.dataset.v; draw(b.dataset.v); });
    draw($a.value);
  })();
  const amt = document.getElementById('amt');
  if (amt) {
    const upd = () => {
      const a = +amt.value, fee = a * .015, net = a - fee;
      document.getElementById('amt-v').textContent = SE.usd(a);
      document.getElementById('amt-flow').innerHTML = `<div class="r"><span>Fee de depósito 1,5 %</span><span>− ${SE.usd(fee)}</span></div><div class="r t"><span>Recibes en tokens</span><span class="up">${Math.round(net).toLocaleString('de-DE')} tokens</span></div>`;
    };
    amt.addEventListener('input', upd); upd();
  }
})();

/* ===== Formulario de registro =====
   Conectar FORM.endpoint a tu backend o CRM (recibe JSON por POST). */
const FORM = { endpoint: /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? null : '/api/lead' };
(function () {
  const params = new URLSearchParams(location.search);
  let ref = params.get('ref');
  try { if (ref) localStorage.setItem('se_ref', ref); else ref = localStorage.getItem('se_ref'); } catch (e) {}
  document.querySelectorAll('.lead-form').forEach(f => {
    if (ref) f.elements['ref'].value = ref;
    const proj = params.get('p');
    const byPage = { 'credito.html': 'Prestar o pedir crédito', 'credito': 'Prestar o pedir crédito', 'trading.html': 'SE Quant (trading)', 'red.html': 'Vox Populi (referidos)', 'vox-populi.html': 'Vox Populi (promover proyectos)', 'negocio.html': 'Remesas y tarjeta' };
    const pg = location.pathname.split('/').pop();
    if (byPage[pg]) f.elements['interest'].value = byPage[pg];
    if (proj) f.elements['interest'].value = 'Participar en proyectos';
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const err = f.querySelector('.err'), name = f.elements['name'].value.trim(), email = f.elements['email'].value.trim(), wa = f.elements['whatsapp'].value.replace(/\D/g, '');
      const bad = !name ? 'Escribe tu nombre.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Revisa tu email.' : wa.length < 7 ? 'Revisa tu número de WhatsApp.' : !f.elements['consent_contact'].checked ? 'Necesitamos tu consentimiento para contactarte.' : '';
      if (bad) { err.textContent = bad; err.hidden = false; return; }
      err.hidden = true;
      const data = { website: f.elements['website'].value, name, email, whatsapp: f.elements['cc'].value + wa, interest: f.elements['interest'].value, consent_contact: true, consent_marketing: f.elements['consent_marketing'].checked, ref: f.elements['ref'].value || null, project: proj || null, page: location.pathname, ts: new Date().toISOString() };
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Creando tu cuenta…';
      let demo = !FORM.endpoint;
      if (!demo) { try { const r = await fetch(FORM.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!r.ok) throw 0; } catch (x) { btn.disabled = false; btn.textContent = 'Crear mi cuenta gratis →'; err.textContent = 'No pudimos enviar tus datos. Inténtalo de nuevo.'; err.hidden = false; return; } }
      f.querySelector('.fields').hidden = true;
      const ok = f.querySelector('.ok-state'); ok.hidden = false; ok.querySelector('.ok-name').textContent = name.split(' ')[0];
      ok.querySelector('.ok-demo').hidden = !demo;
    });
  });
})();

/* Destacados en la portada */
(function(){
  const box=document.getElementById('featured'); if(!box||!window.PROJECTS)return;
  document.getElementById('pcount').textContent=PROJECTS.length;
  const cat=document.createElement('div'); cat.id='catalog';
  const open=PROJECTS.filter(p=>p.status==='Abierto').sort((a,b)=>b.raised/b.hardcap-a.raised/a.hardcap).slice(0,3);
  box.innerHTML=open.map(p=>{const [rl,rc]=SE.riskLabel(p.risk),pct=p.raised/p.hardcap*100;return `<a href="proyecto.html?p=${p.slug}" class="card proj reveal on">
    <div class="top img" style="background:linear-gradient(180deg,rgba(10,11,12,.05) 30%,rgba(10,11,12,.85)),url(assets/img/${p.slug}.jpg) center/cover,#171a1c"><span class="pill">${p.flag} ${p.sector} · ${p.country}</span><span class="risk ${rc}">${rl}</span><span class="status ${SE.statusClass(p.status)}">${p.status}</span></div>
    <div class="body"><div><h3>${p.name}</h3><p>${p.summary}</p></div>
    <div class="kv"><div><small>Retorno estimado</small><b>${p.target}</b></div><div><small>Plazo</small><b>${p.term} meses</b></div><div><small>Ticket mín.</small><b>US$${p.ticket}</b></div></div>
    <div>${SE.capmeter(p)}</div>
    <span class="go">Ver proyecto →</span></div></a>`}).join('');
})();

/* Medidor de ejemplo en proyectos.html */
(function(){const el=document.querySelector('[data-capdemo]');if(el&&typeof SE!=='undefined')el.innerHTML=SE.capmeter({raised:1620000,softcap:1200000,hardcap:2400000,status:'Abierto'},true)})();
