import re, os
import os as _os
SP=_os.path.dirname(_os.path.abspath(__file__))+'/'
NEWCALC=open(SP+'red_calc.js').read()
D=_os.path.join(SP,'..','se-pay-landing')+'/'
s=open(SP+'onepage-backup.html').read()
def between(a,b):
    i=s.index(a); j=s.index(b,i); return s[i:j]

css=s[s.index('<style>')+7:s.index('</style>')]
css=css.replace('@media (max-width:980px){.links{display:none}}','@media (max-width:1120px){.links{display:none}}')
css+=open(SP+'extra.css').read()
css+='''
  /* MULTIPAGE */
  .links a.on{color:var(--ink);background:var(--panel-2)}
  .menu-btn{display:none;width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--panel-2);color:var(--ink);font-size:18px;cursor:pointer;place-items:center}
  .nav-r{display:flex;gap:10px;align-items:center}
  @media (max-width:1120px){.menu-btn{display:grid}.links.open{display:flex;flex-direction:column;position:absolute;top:72px;left:0;right:0;background:var(--bg);padding:12px 20px 20px;border-bottom:1px solid var(--line)}.links.open a{padding:12px 14px;font-size:16px}}
  @media (max-width:480px){nav .btn-lime{display:none}}
  main.sub > section:first-child{padding-top:90px!important}
  .page-title{font-size:clamp(40px,6.2vw,76px);font-weight:600;letter-spacing:-.045em;line-height:1.03;margin:22px auto 22px;max-width:960px}
  .page-title em{font-style:normal;color:var(--lime)}
  .vox-hero{padding-bottom:60px!important;background:radial-gradient(60% 60% at 50% 0%,rgba(212,255,30,.10),transparent 70%)}
  .paths{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .path{padding:26px;display:flex;flex-direction:column;gap:12px;transition:.2s}
  .path:hover{border-color:rgba(212,255,30,.45);transform:translateY(-3px)}
  .path .ic{width:44px;height:44px;border-radius:12px;background:var(--panel-2);display:grid;place-items:center;color:var(--lime);font-size:20px}
  .path h3{font-size:20px;font-weight:600;letter-spacing:-.02em;margin-top:18px}
  .path p{font-size:14px;color:var(--mute);flex:1}
  .path span.go{font-size:14px;color:var(--lime);font-weight:600}
  @media (max-width:1000px){.paths{grid-template-columns:1fr 1fr}}
  @media (max-width:560px){.paths{grid-template-columns:1fr}}
  .camp{padding:24px;display:flex;flex-direction:column;gap:16px}
  .camp-top{display:flex;gap:8px;flex-wrap:wrap}
  .camp h3{font-size:20px;font-weight:600;letter-spacing:-.02em}
  .pays{list-style:none;display:grid;gap:8px}
  .pays li{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:var(--soft);padding:10px 12px;background:var(--panel-2);border-radius:10px}
  .pays b{color:var(--lime);font-weight:600;white-space:nowrap}
  .vox-pro{display:grid;grid-template-columns:1.3fr .8fr;gap:40px;padding:40px;align-items:center;background:radial-gradient(70% 90% at 100% 0%,rgba(212,255,30,.10),transparent 60%),var(--panel)}
  .vox-price{background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:28px;display:grid;gap:14px}
  .vox-price .big{font-size:48px;font-weight:600;letter-spacing:-.04em}
  .vox-price p{font-size:14px;color:var(--mute)}
  @media (max-width:900px){.vox-pro{grid-template-columns:1fr;padding:26px}}
'''
defs=between('<svg width="0" height="0" style="position:absolute">','<!-- NAV -->')
hero=between('<!-- HERO -->','<!-- PILLARS -->')
pillars=between('<!-- PILLARS -->','<!-- PROJECTS -->')
projects=between('<!-- PROJECTS -->','<!-- STEPS -->')
steps=between('<!-- STEPS -->','<!-- TRANSPARENCY -->')
transp=between('<!-- TRANSPARENCY -->','<!-- FEES / WATERFALL -->')
fees=between('<!-- FEES / WATERFALL -->','<!-- TRADING -->')
trading=open(SP+'trading_body.html').read()
plans=between('<!-- PLANS -->','<!-- RED -->')
red=between('<!-- RED -->','<!-- AGENT -->')
agent=between('<!-- AGENT -->','<!-- RISK -->')
risk=between('<!-- RISK -->','<!-- FAQ -->')
faq=between('<!-- FAQ -->','<!-- FINAL -->').replace('2 % anual de cuota de administración sobre el capital, 20 % de success fee solo sobre la ganancia que supere el 8 % anual para el participante, y 0,75 % por operación en el mercado secundario. El plan Pro cuesta US$20 al mes y es opcional.','1,5 % al depositar y 1,5 % al retirar; 2 % anual de administración sobre el capital aportado; 20 % de success fee solo sobre la ganancia que supere el 8 % anual; y 0,75 % en el mercado secundario. Los proyectos pagan una comisión de desembolso de 3 %. El detalle completo está en la página Cómo ganamos.')
final=between('<!-- FINAL -->','<footer>')
footer=between('<footer>','<div class="toast"')
toast=between('<div class="toast"','<script>')
js=s[s.index('<script>')+8:s.index('</script>')]

# --- link rewrites
def links(h):
    for a,b in [('href="#proyectos"','href="proyectos.html"'),('href="#transparencia"','href="tecnologia.html"'),
                ('href="#comisiones"','href="negocio.html#comisiones"'),('href="#trading"','href="trading.html"'),
                ('href="#red"','href="red.html"'),('href="#agente"','href="index.html#agente"')]:
        h=h.replace(a,b)
    return h
footer=links(footer).replace('<div><b>Legal</b>','<div><b>Código</b><a href="https://github.com/Alain-Colombia-Arbitrage-Mev/serpay" target="_blank" rel="noopener">GitHub ↗</a><a href="safe.html">Multisig Safe</a><a href="tecnologia.html#avalanche">Avalanche</a></div><div><b>Legal</b>').replace('<div><b>Plataforma</b><a href="proyectos.html">Proyectos</a><a href="tecnologia.html">Transparencia</a><a href="negocio.html#comisiones">Comisiones</a></div>','<div><b>Plataforma</b><a href="proyectos.html">Proyectos</a><a href="tecnologia.html">Tecnología</a><a href="negocio.html">Cómo ganamos</a><a href="registro.html">Empezar</a></div>').replace('<div><b>Programa</b><a href="red.html">Vox Populi</a>','<div><b>Programas</b><a href="red.html">Vox Populi · Red</a><a href="vox-populi.html">Vox Populi · Campañas</a><a href="trading.html">SE Quant</a>').replace('<a href="#" class="logo">','<a href="index.html" class="logo">')
footer=footer.replace('y el programa Vox Populi están sujetos','y el programa Vox Populi están sujetos')
footer=footer.replace('© 2026 SE pay.','SE pay tiene en trámite su registro como Money Services Business (MSB); hasta su aprobación, los servicios de remesas y conversión de dinero se prestan a través de socios regulados. © 2026 SE pay.')
final=open(SP+'form_final.html').read()
# hero copy polish
hero=hero.replace('<p class="lead">SE pay tokeniza proyectos productivos y registra cada entrada, gasto y distribución en blockchain. Sabes dónde está tu capital, qué cobramos y cuándo, en tiempo real.</p>',
 '<p class="lead">SE pay convierte proyectos productivos en tokens y registra cada ingreso, gasto y distribución en blockchain, a la vista de todos.</p>')
hero=links(hero)
hero=hero.replace('<a href="proyectos.html" class="btn btn-lime">Explorar proyectos →</a>\n      <a href="index.html#agente" class="btn btn-ghost">Preguntar al Agente SE</a>',
  '<a href="registro.html" class="btn btn-lime btn-lg">Empezar en 2 minutos →</a>\n      <a href="proyectos.html" class="btn btn-ghost btn-lg">Explorar proyectos</a>')
hero=hero.replace('<div class="trust">','<p class="hero-micro">Sin compromiso de aportar · Tú eliges cómo y cada cuánto te contactamos</p>\n    <div class="trust">',1)
plans=links(plans)

paths='''<!-- PATHS -->
<section>
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">Un ecosistema, cuatro caminos</span>
      <h2>Elige cómo quieres<br>que trabaje tu dinero.</h2>
      <p class="lead">Aporta, diversifica o gana construyendo comunidad. Todo con la misma regla: cada movimiento, visible en la cadena.</p>
    </div>
    <div class="paths">
      <a href="proyectos.html" class="card path reveal"><span class="ic">▦</span><h3>Proyectos tokenizados</h3><p>Energía, logística, agro. Participa desde US$100 en activos reales con contabilidad abierta.</p><span class="go">Explorar proyectos →</span></a>
      <a href="trading.html" class="card path reveal"><span class="ic">⌁</span><h3>SE Quant</h3><p>Trading algorítmico cripto opcional desde tu propia wallet multisig. Objetivo 30 % anual, alto riesgo.</p><span class="go">Ver el terminal →</span></a>
      <a href="red.html" class="card path reveal"><span class="ic">⇄</span><h3>Vox Populi · Red</h3><p>Cobra por las suscripciones a nuestras apps y por el éxito de los aportes de tu red, hasta 5 niveles. Sin aportar.</p><span class="go">Calcular ingresos →</span></a>
      <a href="vox-populi.html" class="card path reveal"><span class="ic">◉</span><h3>Vox Populi · Campañas</h3><p>Gana promoviendo proyectos que necesitan darse a conocer. Pago por acción verificada.</p><span class="go">Ver campañas →</span></a>
    </div>
  </div>
</section>

'''

def nav(active):
    active={'proyecto.html':'proyectos.html'}.get(active,active)
    groups=[
      ('Participar',[('proyectos.html','▦','Proyectos','Rondas tokenizadas con soft cap y hard cap'),
                   ('trading.html','⌁','SE Quant','Trading algorítmico cripto, objetivo 30 % anual'),
                   ('credito.html#prestar','%','Lending','Tarjeta 15 % anual · remesas 1,3 % mensual')]),
      ('Ganar',[('red.html','⇄','Vox Populi · Red','Comisiones por recomendar, hasta 5 niveles'),
                ('vox-populi.html','◉','Vox Populi · Campañas','Cobra por promover proyectos')]),
      ('SE pay',[('negocio.html#tarjeta','▭','Cuenta y tarjeta','Remesas, on/off ramp y tarjeta de débito'),
                 ('credito.html#pedir','◆','Crédito','Línea de crédito de la tarjeta SE pay'),
                 ('economia-apps.html','◔','Economía de las apps','Flujo por suscripción y runway de la red'),
                 ('tecnologia.html','⛓','Tecnología','Avalanche, contratos ERC-6960 y repositorio'),
                 ('safe.html','⛨','Multisig Safe','Cómo protegemos el dinero con 2 de 3 firmas'),
                 ('negocio.html','$','Cómo ganamos','Modelo de negocio y todas las comisiones')]),
    ]
    NL='\n      '
    html=NL+'<a href="index.html" class="top-link'+(' on' if active=='index.html' else '')+'">Inicio</a>'
    for g,items in groups:
        on=any(h.split('#')[0]==active for h,_,_,_ in items)
        html+=NL+'<div class="ng'+(' on' if on else '')+'"><button type="button" class="ng-btn" aria-haspopup="true">'+g+' <span class="car">▾</span></button><div class="dd"><small class="dd-h">'+g+'</small>'
        for h,ic,t,d in items:
            html+='<a href="'+h+'" class="dd-i'+(' on' if h==active else '')+'"><span class="dd-ic">'+ic+'</span><span><b>'+t+'</b><small>'+d+'</small></span></a>'
        html+='</div></div>'
    html+=NL+'<a href="registro.html" class="menu-cta">Empezar en 2 minutos →</a>'
    return f"""<nav>
  <div class="wrap">
    <a href="index.html" class="logo" aria-label="SE pay">
      <svg width="34" height="34" viewBox="0 0 100 100"><use href="#s-top" color="#f2f3ee"/><use href="#s-bot" color="#d4ff1e"/></svg>
      <span><b>SE</b> <span>pay</span></span>
    </a>
    <div class="links" id="links">{html}
    </div>
    <div class="nav-r">
      <a href="registro.html" class="btn btn-lime">Empezar</a>
      <button class="menu-btn" id="menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="links">☰</button>
    </div>
  </div>
</nav>
"""

red=open(SP+'red_body.html').read()
css+=open(SP+'design.css').read()
hero=hero.replace('<div class="arc">','''<div class="chip c1"><span class="ci">✓</span><div><b>Soft cap alcanzado</b><small>Hub Logístico Bajío · hace 2 h</small></div></div>
  <div class="chip c2"><span class="ci">⇄</span><div><b>+US$31.900 distribuidos</b><small>Atacama II · 1.284 wallets</small></div></div>
  <div class="arc">''',1)
footer=footer.replace('</footer>','<div class="wordmark" aria-hidden="true">SE pay</div>\n</footer>',1) if 'wordmark' not in footer else footer
import time as _t
VER=str(int(_t.time()))
COMMUNITY='''<div class="comm" id="comm">
  <div class="comm-panel" id="comm-panel" role="dialog" aria-label="Comunidad SE pay">
    <div class="comm-h"><b>Únete a la comunidad</b><small>Resuelve dudas y conoce a otros miembros de la red.</small></div>
    <a class="comm-i wa" data-net="whatsapp" target="_blank" rel="noopener"><span class="comm-ic">✆</span><span><b>WhatsApp</b><small>Canal de novedades y soporte</small></span><em>→</em></a>
    <a class="comm-i dc" data-net="discord" target="_blank" rel="noopener"><span class="comm-ic">◈</span><span><b>Discord</b><small>Comunidad, rangos y eventos</small></span><em>→</em></a>
    <a class="comm-i tg" data-net="telegram" target="_blank" rel="noopener"><span class="comm-ic">➤</span><span><b>Telegram</b><small>Anuncios de proyectos y rondas</small></span><em>→</em></a>
  </div>
  <button class="comm-btn" id="comm-btn" aria-expanded="false" aria-controls="comm-panel" aria-label="Abrir comunidad"><span class="o">💬</span><span class="c">✕</span><em>Comunidad</em></button>
</div>
'''
CTAS={
  'index.html':('', 'Esto no es para todos', 'Es para quienes quieren ver<br><em>cada dólar antes de decidir.</em>', 'Si lees la letra pequeña, revisas los números y prefieres verificar antes que creer, aquí vas a estar cómodo. Empieza por lo que te interesa y nosotros hacemos el resto.', 'Empezar en 2 minutos', ('proyectos.html','Ver proyectos primero')),
  'proyectos.html':('proyectos', 'Las rondas tienen cupo', 'Cuando llega al hard cap,<br><em>la ronda se cierra.</em>', 'No es una táctica: es una regla escrita en el contrato. Déjanos tu contacto y te avisamos antes de que abra o se llene la próxima ronda.', 'Avisarme de las rondas', ('proyectos.html#caps','Cómo funcionan las rondas')),
  'proyecto.html':('proyectos', 'Las rondas tienen cupo', 'Cuando llega al hard cap,<br><em>la ronda se cierra.</em>', 'No es una táctica: es una regla escrita en el contrato. Déjanos tu contacto y te avisamos de esta ronda y de las próximas.', 'Avisarme de esta ronda', ('proyectos.html','Ver otros proyectos')),
  'trading.html':('quant', 'Para quienes miden el riesgo', 'Tú cobras primero.<br><em>Nosotros, solo si llegas al 30 %.</em>', 'Si prefieres un socio que gane contigo y no a costa tuya, empieza por conocer tu Safe y los límites del bot. Te escribimos cuando haya cupo.', 'Quiero activar SE Quant', ('safe.html','Cómo se protege mi dinero')),
  'red.html':('vox', 'Gente que recomienda lo que usa', 'Si ya lo recomiendas,<br><em>que tu red también te pague.</em>', 'Vox Populi es para quienes comparten lo que les funciona. Tu código llega con tu acceso, sin aportar un dólar.', 'Obtener mi código Vox Populi', ('red.html#simulador','Calcular mis ingresos')),
  'vox-populi.html':('vox', 'La voz de la gente', 'Cuenta proyectos en los que crees.<br><em>Cobra por cada acción real.</em>', 'Para quienes ya hablan de lo que les gusta. Te enviamos las campañas que encajan contigo, cuando las haya.', 'Unirme a Vox Populi', ('vox-populi.html#para-proyectos','Tengo un proyecto')),
  'credito.html':('credito', 'Tu dinero, trabajando', 'Presta a quien mueve dinero real,<br><em>con dos capas antes que tú.</em>', 'Para quienes quieren un retorno claro y saber exactamente a quién le prestan: titulares de la tarjeta o empresas de remesas. Te avisamos cuando haya cupo.', 'Quiero prestar y ganar intereses', ('credito.html#pedir','Quiero mi línea de crédito')),
  'tecnologia.html':('explorar', 'Ya viste cómo funciona', 'Ahora decide con calma.<br><em>Nosotros te acompañamos.</em>', 'Cuéntanos qué te interesa y te escribimos solo para eso, por el canal y con la frecuencia que elijas.', 'Empezar en 2 minutos', ('safe.html','Cómo funciona la multisig')),
  'safe.html':('explorar', 'Ya viste cómo se protege', 'Tu dinero, en tu Safe.<br><em>Tus reglas, en el contrato.</em>', 'Cuéntanos qué te interesa y te escribimos solo para eso, por el canal y con la frecuencia que elijas.', 'Empezar en 2 minutos', ('trading.html','Ver SE Quant')),
  'negocio.html':('explorar', 'Sin letra pequeña', 'Ya sabes cómo ganamos.<br><em>Ahora decide tú.</em>', 'Cuéntanos qué te interesa y te escribimos solo para eso, por el canal y con la frecuencia que elijas.', 'Empezar en 2 minutos', ('negocio.html#comisiones','Ver todas las comisiones')),
  'economia-apps.html':('vox', 'Números a la vista', 'Cada suscripción, contada.<br><em>Cada comisión, pagada al instante.</em>', 'Si quieres ser parte de la red que recomienda estas apps, tu código Vox Populi llega con tu acceso.', 'Obtener mi código Vox Populi', ('red.html','Cómo funciona Vox Populi')),
}
def cta_block(fn):
    if fn not in CTAS: return ''
    goal,k,t,s,p,(sh,sl)=CTAS[fn]
    href='registro.html'+('?goal='+goal if goal else '')
    return f'''<!-- CTA -->
<section id="final" class="cta-end">
  <div class="wrap">
    <div class="card cta-card reveal">
      <span class="eyebrow">{k}</span>
      <h2>{t}</h2>
      <p class="lead">{s}</p>
      <div class="cta-row"><a href="{href}" class="btn btn-lime btn-lg">{p} →</a><a href="{sh}" class="btn btn-ghost btn-lg">{sl}</a></div>
      <ul class="cta-trust"><li>2 minutos</li><li>Sin compromiso de aportar</li><li>Tú eliges canal y frecuencia</li></ul>
    </div>
  </div>
</section>
'''
def page(fn,title,desc,body,sub=True):
    goal=CTAS.get(fn,('',))[0]
    href='registro.html'+('?goal='+goal if goal else '')
    body=(body+cta_block(fn)).replace('href="#final"','href="'+href+'"')
    html=f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css?v={VER}">
</head>
<body>

{defs}{nav(fn).replace('href="registro.html" class="btn btn-lime"','href="'+href+'" class="btn btn-lime"')}
<main{' class="sub"' if sub else ''}>
{body}</main>

{footer}{COMMUNITY}{toast}<script src="assets/projects.js?v={VER}"></script>
<script src="assets/app.js?v={VER}"></script>
</body>
</html>
'''
    open(D+fn,'w').write(html)

# --- JS guards + additions
def rj(a,b):
    global js
    assert a in js, a[:60]; js=js.replace(a,b,1)
rj("const box=document.getElementById('txs');let i=0;","const box=document.getElementById('txs');if(!box)return;let i=0;")
rj("(function(){\n  const D=EA_DATA,","(function(){\n  if(!document.getElementById('eq'))return;\n  const D=EA_DATA,")
rj("  let lb=LEADERBOARD.endpoint?","  if(document.getElementById('lbody')){\n  let lb=LEADERBOARD.endpoint?")
rj("  if(lbDemo)document.getElementById('lbsrc').innerHTML='<span class=\"dot\" style=\"background:var(--mute);box-shadow:none\"></span> Datos de demostración';",
   "  if(lbDemo)document.getElementById('lbsrc').innerHTML='<span class=\"dot\" style=\"background:var(--mute);box-shadow:none\"></span> Datos de demostración';\n  }")
rj("  const SUB=[.25,.10,.07,.05,.03]","  if(!document.getElementById('n1'))return;\n  const SUB=[.25,.10,.07,.05,.03]")
rj("  const msgs=document.getElementById('msgs');","  const msgs=document.getElementById('msgs');if(!msgs)return;")
rj("document.querySelectorAll('.calc input')","document.querySelectorAll('#simulador input')")
rj("[/red|refer|nivel|ganar|invit/i,","[/vox|populi|campa|promo|marketing/i,'<b>Vox Populi</b> es nuestro programa de marketing de comunidad. Los proyectos depositan su presupuesto en garantía on-chain y la red cobra por cada acción verificada: contenido, personas registradas y eventos. Además ganas hasta 5 niveles sobre la actividad de tu equipo (10 %, 6 %, 4 %, 3 % y 2 %). En proyectos tokenizados nunca se paga por el monto aportado.'],\n    [/red|refer|nivel|ganar|invit/i,")
js+='''
/* Menú móvil */
(function(){
  const b=document.getElementById('menu'),l=document.getElementById('links');if(!b)return;
  const set=o=>{l.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.textContent=o?'✕':'☰'};
  b.onclick=()=>set(!l.classList.contains('open'));
  l.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
  addEventListener('resize',()=>{if(innerWidth>1120)set(false)});
})();

/* Vox Populi simulator */
(function(){
  if(!document.getElementById('vx-c'))return;
  const OV=[.10,.06,.04,.03,.02], names=['Enlace','Conector','Red','Red Pro','Embajador'];
  const $=id=>document.getElementById(id), fmt=n=>'US$'+Math.round(n).toLocaleString('de-DE');
  function calc(){
    const c=+$('vx-c').value,l=+$('vx-l').value,e=+$('vx-e').value,n1=+$('vx-1').value,d=+$('vx-d').value,a=+$('vx-a').value;
    $('vx-c-v').textContent=c;$('vx-l-v').textContent=l;$('vx-e-v').textContent=e;$('vx-1-v').textContent=n1;$('vx-d-v').textContent=d;$('vx-a-v').textContent=fmt(a);
    const team=n1+d, own=c*20+l*8+e*150;
    const unlocked=[true,n1>=3,n1>=5,n1>=8&&team>=25,n1>=10&&team>=60];
    const per=[n1,d/4,d/4,d/4,d/4];
    let tot=own, rank=0, html=`<div class="res-row"><span>Tu actividad</span><b>${fmt(own)}</b></div>`;
    per.forEach((p,k)=>{
      if(unlocked[k]){rank=k;const v=p*a*OV[k];tot+=v;html+=`<div class="res-row"><span>Equipo N${k+1} · ${Math.round(OV[k]*100)} %</span><b>${fmt(v)}</b></div>`}
      else html+=`<div class="res-row lock"><span>Equipo N${k+1} · bloqueado</span><b>requiere ${names[k]}</b></div>`;
    });
    $('vx-rows').innerHTML=html;$('vx-tot').textContent=fmt(tot);$('vx-sub').textContent='≈ '+fmt(tot*12)+' al año · '+team+' promotores en tu equipo';
    $('vx-rank').innerHTML='<span class="dot"></span> Rango: '+names[rank];
  }
  document.querySelectorAll('#vox-sim input').forEach(x=>x.addEventListener('input',calc));calc();
})();
'''
js=re.sub(r"\[/cobra\|comisi\|fee\|cuota\|costo\|precio/i,'.*?'\],","[/cobra|comisi|fee|cuota|costo|precio/i,'Al depositar cobramos <b>1,5 %</b> y al retirar <b>1,5 %</b>. En proyectos: <b>2 % anual</b> de administración y <b>20 % del excedente</b> solo si superas el 8 % anual. El proyecto paga una comisión de desembolso de 3 %. Si una ronda no alcanza su soft cap, te devolvemos el 100 %, fee incluido. Todo está en la página Cómo ganamos.'],",js,count=1,flags=re.S)
js=re.sub(r"/\* Red ⇄ calculator \*/.*?(?=/\* Agente SE)",lambda m:NEWCALC,js,count=1,flags=re.S)
js=js.replace("const names=['Enlace','Conector','Red','Red Pro','Embajador'], names2=0;","")
js=js.replace("const OV=[.10,.06,.04,.03,.02], names=['Enlace','Conector','Red','Red Pro','Embajador'];","const OV=[.10,.06,.04,.03,.02], names=['Conector','Red','Esmeralda','Rubí','Diamante'];")
for a,b2 in [("'Embajador',184","'Embajador Corona',184"),("'Embajador',152","'Diamante',152"),("'Red Pro',97","'Rubí',97"),("'Red Pro',81","'Rubí',81"),("'Red',46","'Esmeralda',46"),("'Red',39","'Esmeralda',39"),("'Conector',21","'Red',21")]:
    js=js.replace(a,b2)
js=re.sub(r"\[/red\|refer\|nivel\|ganar\|invit/i,'.*?'\],","[/red|refer|nivel|ganar|invit|rango/i,'Vox Populi te paga por tres caminos y <b>no necesitas aportar</b>: 1) hasta el 18 % del ingreso neto de cada suscripción a nuestras apps (5 niveles: 18, 7, 5, 3 y 2 %), y 2) hasta el 15 % del success fee que SE pay cobra cuando los aportes de tu red generan ganancias (15, 6, 4, 3 y 2 %), y 3) un bonus del 50 % del excedente de SE Quant sobre 39 % (20, 12, 8, 6 y 4 %). Todo se paga al instante en USDC, y SE pay se reserva su parte antes de repartir. Nunca pagamos sobre el dinero depositado. Rangos: Conector, Red, Esmeralda, Rubí, Diamante y Embajador Corona.'],",js,count=1,flags=re.S)
js=re.sub(r"/\* SE Quant terminal.*?(?=/\* Prueba social)",lambda m:open(SP+'quant_js.js').read(),js,count=1,flags=re.S)
js=re.sub(r"\[/trading\|\\bea\\b.*?'\],","[/trading|\\bea\\b|bot|algoritm|forex|quant|multisig|safe/i,'SE Quant es opcional y opera desde tu propia <b>Safe multisig</b> en Avalanche. El reparto anual va en este orden: <b>tú cobras primero</b> hasta 30 % anual; después SE pay cobra 30 % sobre ese 30 % (9 puntos); lo que supere 39 % se divide 50 % para SE pay y 50 % como bonus para la red Vox Populi. Sin cuota de administración. Límites: 1 % de riesgo por operación, −3 % diario, freno a −15 %. El 30 % es un objetivo, no una garantía: es operación cripto de alto riesgo.'],",js,count=1,flags=re.S)
js=js.replace("  ];\n  function answer(q){","    [/cr[eé]dito|prest|lending|borrow|pr[eé]stamo|tarjeta|remesa/i,'Puedes prestar en dos pools. <b>Tarjeta SE pay:</b> recibes 15 % anual; los titulares pagan 1,8 % mensual y están evaluados en buró y con garantía. <b>Empresas de remesas:</b> recibes 1,3 % mensual (≈15,6 % anual); las empresas pagan 2,7 % mensual por liquidez de corto plazo y SE pay toma el resto. Ambos pools tienen fondo de protección y el respaldo del capital de SE pay. No es un depósito bancario: si las pérdidas superan esas protecciones, podrías recibir menos.'],\n  ];\n  function answer(q){",1)
js+=open(SP+'pages.js').read()
js+=open(SP+'apps_js.js').read()
js+=open(SP+'credit_js.js').read()
js+=open(SP+'onboarding_js.js').read()
js+='''
/* Botón de comunidad. Reemplaza los enlaces por los de tus grupos. */
const COMMUNITY={whatsapp:'https://wa.me/', discord:'https://discord.gg/', telegram:'https://t.me/'};
(function(){
  const w=document.getElementById('comm'); if(!w)return;
  const b=document.getElementById('comm-btn');
  w.querySelectorAll('[data-net]').forEach(a=>a.href=COMMUNITY[a.dataset.net]||'#');
  const set=o=>{w.classList.toggle('open',o);b.setAttribute('aria-expanded',o)};
  b.onclick=e=>{e.stopPropagation();set(!w.classList.contains('open'))};
  document.addEventListener('click',e=>{if(!w.contains(e.target))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
})();
'''
js+='''
/* Nav al hacer scroll + reveal escalonado */
(function(){
  const n=document.querySelector('nav'); const on=()=>n.classList.toggle('scrolled',scrollY>20); addEventListener('scroll',on,{passive:true}); on();
  document.querySelectorAll('.reveal').forEach(el=>{const sib=[...el.parentElement.children].filter(x=>x.classList.contains('reveal'));const i=sib.indexOf(el);if(i>0)el.style.transitionDelay=Math.min(i,5)*70+'ms'});
})();
'''
os.makedirs(D+'assets',exist_ok=True)
open(D+'assets/styles.css','w').write(css.strip()+'\n')
open(D+'assets/app.js','w').write(js.strip()+'\n')

vox=open(SP+'vox_body.html').read()
def rd(n): return open(SP+n).read()
VERIFY='''<!-- VERIFY -->
<section class="verify">
  <div class="wrap">
    <p class="verify-kicker reveal">La regla que nos define</p>
    <h2 class="verify-h reveal">Tú no tienes que creernos.<br><em>Puedes verificarlo.</em></h2>
    <div class="verify-row reveal">
      <div><b>Cada movimiento</b><span>con su transacción en Avalanche</span></div>
      <div><b>Cada comisión</b><span>cobrada por contrato, con tope</span></div>
      <div><b>Cada wallet</b><span>administrativa, pública y separada</span></div>
    </div>
    <div class="verify-cta reveal"><a href="tecnologia.html#avalanche" class="btn btn-lime">Verlo en la blockchain →</a><a href="negocio.html" class="btn btn-ghost">Cómo ganamos dinero</a></div>
  </div>
</section>

'''
HOMECARD='''<!-- HOME CARD -->
<section style="padding-top:0">
  <div class="wrap">
    <div class="card homecard reveal">
      <div>
        <span class="eyebrow">Cuenta y tarjeta SE pay</span>
        <h2>Gana en la red.<br>Gasta en la calle.</h2>
        <p class="lead">Tus comisiones y ganancias llegan a tu cuenta en dólares digitales. Úsalas con tu tarjeta de débito o envíalas a tu familia en minutos.</p>
        <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap"><a href="negocio.html#tarjeta" class="btn btn-lime">Conocer la tarjeta →</a><a href="negocio.html" class="btn btn-ghost">Remesas y comisiones</a></div>
      </div>
      '''+open(SP+'cards_snippet.html').read()+'''
    </div>
  </div>
</section>

'''
FEATURED='''<!-- FEATURED -->
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal" style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;max-width:none">
      <div><span class="eyebrow">Proyectos abiertos</span><h2>Rondas activas ahora.</h2></div>
      <a href="proyectos.html" class="btn btn-ghost">Ver los <span id="pcount"></span> proyectos →</a>
    </div>
    <div class="projects" id="featured"></div>
  </div>
</section>

'''
page('index.html','SE pay — Banca de proyectos tokenizados','Participa en proyectos reales tokenizados en blockchain, con contabilidad abierta en tiempo real y comisiones transparentes.',
     hero+pillars+VERIFY+paths+FEATURED+HOMECARD+links(steps)+plans+agent+risk+faq, sub=False)
page('proyectos.html','Proyectos — SE pay','Catálogo de proyectos tokenizados con soft cap, hard cap y contabilidad on-chain.',
     rd('proyectos_body.html'))
page('proyecto.html','Proyecto — SE pay','Ficha del proyecto: ronda, soft cap, hard cap, uso de fondos, hitos, contrato ERC-6960 y contabilidad.',
     '<section class="pd"><div class="wrap" id="pd"></div></section>\n')
page('trading.html','SE Quant — SE pay','Trading algorítmico cripto opcional desde tu propia wallet multisig, con terminal transparente de ganancias y pérdidas.',
     trading)
page('red.html','Vox Populi · Red — SE pay','Programa de referidos de SE pay: cobra cada mes por los clientes de tu red, hasta 5 niveles, pagado en USDC on-chain.',
     links(red))
page('vox-populi.html','Vox Populi · Campañas — SE pay','Marketing de comunidad en blockchain: los proyectos pagan por darse a conocer y la red cobra por cada acción verificada.',
     vox)
page('tecnologia.html','Tecnología — SE pay','Cómo funcionan la blockchain y los smart contracts de SE pay: arquitectura, ERC-6960, ciclo de una ronda y repositorio.',
     rd('tecnologia_body.html'))
page('negocio.html','Cómo ganamos dinero — SE pay','Todas las comisiones de SE pay: depósito, retiro, administración, desembolso, remesas, rampas fiat, banca y tarjetas.',
     rd('negocio_body.html'))
page('economia-apps.html','Economía de las apps — SE pay','Flujo económico de las apps de bienestar a US$29,99 al mes y runway de la reserva de comisiones de la red.',
     rd('apps_body.html'))
page('credito.html','Crédito y lending — SE pay','Presta en dos pools: tarjeta SE pay (15 % anual) y empresas de remesas (1,3 % mensual).',
     rd('credito_body.html'))
page('safe.html','Multisig Safe — SE pay','Cómo funcionan las wallets multisig Safe de SE pay en Avalanche: 2 de 3 firmas, permisos limitados para el bot y qué pasa si algo sale mal.',
     rd('safe_body.html'))
page('registro.html','Empieza en 2 minutos — SE pay','Cuéntanos qué te interesa y cómo quieres que te contactemos. Sin compromiso.',
     rd('onboarding_body.html'))
print('ok')
