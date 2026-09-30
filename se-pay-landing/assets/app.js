/* Live ledger (demo) */
(function(){
  const items=[
    ['⇄','Distribución a participantes','Atacama II','− US$31.900'],
    ['↓','Venta de energía','Atacama II','+ US$48.210'],
    ['↓','Renta mensual inquilino A','Hub Bajío','+ US$62.400'],
    ['↓','Exportación lote #14','Café Huila','+ US$27.850'],
    ['◎','Cuota de administración','Hub Bajío','− US$5.170'],
    ['⇄','Distribución a participantes','Hub Bajío','− US$44.300'],
    ['↑','Compra de fertilizante','Café Huila','− US$8.120'],
    ['↓','Nueva participación','Atacama II','+ US$1.500'],
  ];
  const box=document.getElementById('txs');if(!box)return;let i=0;
  const hx=()=>'0x'+Math.random().toString(16).slice(2,6)+'…'+Math.random().toString(16).slice(2,6);
  function add(){
    const [ic,t,p,a]=items[i++%items.length];
    const el=document.createElement('div');el.className='tx';
    el.innerHTML=`<span class="ic">${ic}</span><div>${t}<small>${p} · <span class="mono">${hx()}</span></small></div><span class="amt" style="color:${a.startsWith('+')?'var(--lime)':'var(--ink)'}">${a}</span>`;
    box.prepend(el);while(box.children.length>4)box.lastChild.remove();
  }
  for(let k=0;k<4;k++)add();setInterval(add,2600);
})();

/* Reveal on scroll */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* SE Quant (demo). Reemplazar EA_DATA con el historial real auditado.
   Reparto anual: 0–30 % para el participante · 30–39 % fee del fondo (30 % sobre el 30 %) · >39 % prima de ejecución SE pay. */
const EA_DATA={
  capital:1000000,
  grossProfit:402300, grossLoss:215300,
  target:.30, fundFee:.30, reserveShare:.10, networkShare:.50,
  months:[['Oct',2.0],['Nov',3.2],['Dic',-1.6],['Ene',2.6],['Feb',1.4],['Mar',-2.5],['Abr',3.9],['May',1.9],['Jun',1.6],['Jul',2.8],['Ago',-0.8],['Sep',3.0]],
  risk:[['Caída desde el máximo',2.5,15,'%'],['Pérdida del día',0.4,3,'%'],['Apalancamiento',1.4,3,'x'],['Mayor exposición (BTC)',21,25,'%']],
};
function quantSplit(r,D){
  const cap=D.target, feeTop=D.target*(1+D.fundFee);
  if(r<=0)return {inv:r,fee:0,exec:0,res:0};
  const inv=Math.min(r,cap), fee=Math.min(Math.max(r-cap,0),feeTop-cap), exec=Math.max(r-feeTop,0);
  return {inv,fee,exec,net:exec*D.networkShare,co:exec*(1-D.networkShare),res:exec*D.reserveShare};
}
(function(){
  if(!document.getElementById('eq'))return;
  const D=EA_DATA, $=id=>document.getElementById(id);
  const usd=n=>(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const pct=n=>(n>0?'+':'')+n.toFixed(1).replace('.',',')+' %';
  const trading=D.grossProfit-D.grossLoss, r=trading/D.capital, sp=quantSplit(r,D);
  const inv=sp.inv*D.capital, fee=sp.fee*D.capital, exec=sp.exec*D.capital;
  $('aum').textContent=usd(D.capital);
  let e=1,peak=1,dd=0; const pts=[1];
  D.months.forEach(([,m])=>{e*=1+m/100;pts.push(e);peak=Math.max(peak,e);dd=Math.min(dd,e/peak-1)});
  function render(v){
    const isNet=v==='net';
    $('k1l').textContent=isNet?'Neto para el participante 12 meses':'Resultado bruto del EA';
    $('k1').textContent=pct((isNet?inv:trading)/D.capital*100);
    $('k2').textContent=usd(D.grossProfit); $('k3').textContent=usd(-D.grossLoss); $('k4').textContent=pct(dd*100);
    $('flow').innerHTML=[
      ['Ganancias de operaciones',D.grossProfit,'up'],['Pérdidas de operaciones',-D.grossLoss,'down'],['Resultado bruto '+pct(r*100),trading,'',1],
      ['1 · Para participantes (hasta 30 %)',inv,'up'],
      [fee>0?'2 · Fee del fondo (30 % sobre el 30 %)':'2 · Fee del fondo: 0 (no se llegó a 30 %)',-fee,''],
      [exec>0?'3 · Excedente: 50 % SE pay · 50 % bonus red':'3 · Excedente sobre 39 %: 0',-exec,''],
      ['Neto para participantes',inv,'up',1]
    ].map(([k,v,c,t])=>`<div class="r${t?' t':''}"><span>${k}</span><span class="${c}">${usd(v)}</span></div>`).join('');
  }
  $('tview').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;document.querySelectorAll('#tview button').forEach(x=>x.classList.toggle('on',x===b));render(b.dataset.v)});
  render('net');
  const W=600,H=200,min=Math.min(...pts)*.99,max=Math.max(...pts)*1.01;
  const xy=pts.map((p,i)=>[i/(pts.length-1)*W,H-(p-min)/(max-min)*H]);
  const line=xy.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
  $('eq').innerHTML=`<defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4ff1e" stop-opacity=".25"/><stop offset="1" stop-color="#d4ff1e" stop-opacity="0"/></linearGradient></defs>
    ${[.25,.5,.75].map(f=>`<line x1="0" x2="${W}" y1="${H*f}" y2="${H*f}" stroke="#22262a"/>`).join('')}
    <path d="${line} L${W} ${H} L0 ${H} Z" fill="url(#eg)"/><path d="${line}" fill="none" stroke="#d4ff1e" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`;
  $('eqv').textContent='Base 100 → '+(pts[pts.length-1]*100).toFixed(1).replace('.',',');
  $('months').innerHTML=D.months.map(([m,x])=>{const a=Math.min(1,Math.abs(x)/3.5);return `<div style="background:${x>=0?`rgba(212,255,30,${.08+a*.22})`:`rgba(255,107,91,${.08+a*.25})`}"><small>${m}</small><span class="${x>=0?'up':'down'}">${pct(x)}</span></div>`}).join('');
  $('gauges').innerHTML=D.risk.map(([k,v,lim,u])=>{const f=Math.min(100,v/lim*100),c=f<60?'var(--lime)':f<85?'var(--amber)':'var(--red)';return `<div class="gauge"><div><span>${k}</span><b class="mono">${String(v).replace('.',',')}${u} <small>/ ${lim}${u}</small></b></div><div class="bar"><i style="width:${f}%;background:${c}"></i></div></div>`}).join('');
  const P=[['BTCUSDT','buy',1840],['ETHUSDT','sell',-420],['SOLUSDT','buy',960],['XRPUSDT','sell',-180]];
  function tick(){
    P.forEach(p=>p[2]+=Math.round((Math.random()-.5)*120));
    $('positions').innerHTML=P.map(([s,sd,v])=>`<div class="pos"><span class="mono">${s}</span><span class="side ${sd}">${sd==='buy'?'COMPRA':'VENTA'}</span><span class="mono ${v>=0?'up':'down'}">${v>=0?'+':'−'}US$${Math.abs(v).toLocaleString('de-DE')}</span></div>`).join('');
    $('clock').textContent=new Date().toLocaleTimeString('es-ES');
  }
  tick();setInterval(tick,2000);
})();

/* Simulador de reparto SE Quant */
(function(){
  if(!document.getElementById('qs-ret'))return;
  const D=EA_DATA, $=id=>document.getElementById(id);
  const usd=n=>(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const pc=n=>(Math.round(n*1000)/10).toString().replace('.',',')+' %';
  function calc(){
    const cap=+$('qs-cap').value, r=+$('qs-ret').value/100, s=quantSplit(r,D);
    $('qs-cap-v').textContent=usd(cap); $('qs-ret-v').textContent=Math.round(r*100)+' %';
    const rows=[
      ['Resultado bruto del EA',r*cap,r>=0?'up':'down'],
      ['1 · Tu parte ('+pc(s.inv)+')',s.inv*cap,s.inv>=0?'up':'down'],
      ['2 · Fee del fondo ('+pc(s.fee)+')',-s.fee*cap,''],
      ['3 · Excedente ('+pc(s.exec)+')',-s.exec*cap,''],
      ['   ↳ 50 % para SE pay',s.co*cap,'mute'],
      ['   ↳ 50 % bonus para la red Vox Populi',s.net*cap,'mute'],
    ];
    if(s.res>0)rows.push(['   ↳ de la parte de SE pay, a la reserva',s.res*cap,'mute']);
    $('qs-rows').innerHTML=rows.map(([k,v,c])=>`<div class="res-row"><span>${k}</span><b class="${c}">${usd(v)}</b></div>`).join('');
    $('qs-tot').textContent=usd(cap*(1+s.inv)); $('qs-tot').style.color=s.inv<0?'var(--red)':'var(--lime)';
    $('qs-sub').textContent=r<=0?'Año negativo: SE pay no cobra. El freno automático limita la caída a −15 %.':r<=D.target?'Todo el rendimiento es tuyo. SE pay no cobra este año.':'Recibiste tu 30 % completo antes de que SE pay cobrara.';
    const w=x=>Math.max(0,x)/Math.max(r,.3001)*100;
    $('qs-bar').innerHTML=r>0?`<i class="b1" style="width:${w(s.inv)}%"></i><i class="b2" style="width:${w(s.fee)}%"></i><i class="b3" style="width:${w(s.co)}%"></i><i class="b4" style="width:${w(s.net)}%"></i>`:`<i class="bneg" style="width:${Math.abs(r)/.15*100}%"></i>`;
  }
  document.querySelectorAll('#quant-sim input').forEach(x=>x.addEventListener('input',calc));calc();
})();

/* Prueba social: SOLO con datos reales.
   Conectar FEED.endpoint a los eventos on-chain de depósitos (nombre abreviado + país del KYC)
   y LEADERBOARD.endpoint a los pagos reales de Vox Populi. En modo demo se marca "DEMO". */
const FEED={endpoint:null, interval:9000};
const LEADERBOARD={endpoint:null};
const DEMO_FEED=[
  ['🇨🇴','Andrés M.','Colombia',2500,'Parque Solar Atacama II'],['🇲🇽','Valeria R.','México',1200,'SE Quant'],
  ['🇪🇸','Javier L.','España',5000,'Hub Logístico Bajío'],['🇨🇱','Camila S.','Chile',800,'Café de Especialidad Huila'],
  ['🇦🇷','Martín G.','Argentina',3000,'SE Quant'],['🇵🇪','Lucía F.','Perú',1500,'Parque Solar Atacama II'],
  ['🇺🇸','Daniel P.','Estados Unidos',10000,'Hub Logístico Bajío'],['🇪🇨','Sofía C.','Ecuador',600,'Café de Especialidad Huila'],
  ['🇩🇴','Carlos T.','Rep. Dominicana',2000,'SE Quant'],['🇻🇪','Gabriela N.','Venezuela',900,'Parque Solar Atacama II'],
];
const DEMO_LB=[
  ['🇲🇽','Rodrigo A.','Embajador Corona',184,4210],['🇨🇴','Natalia V.','Diamante',152,3680],['🇪🇸','Pablo M.','Rubí',97,2140],
  ['🇦🇷','Florencia D.','Rubí',81,1795],['🇨🇱','Tomás R.','Esmeralda',46,960],['🇵🇪','Mariana Q.','Esmeralda',39,815],['🇺🇸','Kevin O.','Red',21,430],
];
(async function(){
  const usd=n=>'US$'+Math.round(n).toLocaleString('de-DE');
  const hx=()=>'0x'+Math.random().toString(16).slice(2,6)+'…'+Math.random().toString(16).slice(2,6);
  const get=async ep=>{try{const r=await fetch(ep);return await r.json()}catch(e){return null}};
  // leaderboard
  if(document.getElementById('lbody')){
  let lb=LEADERBOARD.endpoint?await get(LEADERBOARD.endpoint):null, lbDemo=!lb;
  lb=lb||DEMO_LB;
  document.getElementById('lbody').innerHTML=lb.map(([f,n,r,c,m],i)=>`<tr><td><span class="pos-n">${i+1}</span></td><td><div class="who"><span>${f}</span>${n}</div></td><td>${r}</td><td>${c}</td><td class="up" style="font-weight:600">${usd(m)}</td></tr>`).join('');
  if(lbDemo)document.getElementById('lbsrc').innerHTML='<span class="dot" style="background:var(--mute);box-shadow:none"></span> Datos de demostración';
  }
  // toast
  let feed=FEED.endpoint?await get(FEED.endpoint):null, feedDemo=!feed;
  feed=feed||DEMO_FEED;
  const t=document.getElementById('toast'); let i=0, closed=false;
  document.getElementById('tdemo').hidden=!feedDemo;
  document.getElementById('tclose').onclick=()=>{closed=true;t.classList.remove('show')};
  function show(){
    if(closed)return;
    const [f,n,c,a,p]=feed[i++%feed.length];
    document.getElementById('tflag').textContent=f;
    document.getElementById('tname').textContent=n+' · '+c;
    document.getElementById('ttext').innerHTML=`aportó <b style="display:inline;color:var(--lime)">${usd(a)}</b> en ${p}`;
    document.getElementById('ttime').textContent='hace '+(1+Math.floor(Math.random()*9))+' min';
    document.getElementById('thash').textContent=hx();
    t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),5200);
  }
  setTimeout(()=>{show();setInterval(show,FEED.interval)},4000);
})();

/* Red ⇄ calculator (suscripciones a las apps) */
(function(){
  if(!document.getElementById('n1'))return;
  const PCT=[.18,.07,.05,.03,.02], INV=[.15,.06,.04,.03,.02], SF_RATE=.01;
  const names=['Conector','Red','Esmeralda','Rubí','Diamante','Embajador Corona'];
  const $=id=>document.getElementById(id);
  const fmt=n=>'US$'+Math.round(n).toLocaleString('de-DE');
  function calc(){
    const n=[1,2,3,4,5].map(k=>+$('n'+k).value), price=+$('price').value, store=+$('store').value/100, inv=+$('inv').value;
    $('vinv').textContent=fmt(inv);
    n.forEach((v,k)=>$('v'+(k+1)).textContent=v);
    $('vprice').textContent='US$'+price.toFixed(2).replace('.',','); $('vstore').textContent=Math.round(store*100)+' %';
    const net=price*(1-store), team=n.reduce((a,b)=>a+b,0);
    const unlocked=[true,n[0]>=3,n[0]>=5,n[0]>=8&&team>=25,n[0]>=10&&team>=60];
    const corona=n[0]>=25&&team>=300;
    let tot=0,html='',rank=0;
    n.forEach((v,k)=>{
      if(unlocked[k]){rank=k;const c=v*net*PCT[k], ci=v*inv*SF_RATE/12*INV[k];tot+=c+ci;html+=`<div class="res-row"><span>N${k+1} · ${v} personas</span><b>${fmt(c+ci)}</b></div>`}
      else html+=`<div class="res-row lock"><span>N${k+1} · bloqueado</span><b>requiere ${names[k]}</b></div>`;
    });
    if(corona)rank=5;
    $('rows').innerHTML=html;$('tot').textContent=fmt(tot);$('totm').textContent='≈ '+fmt(tot*12)+' al año · suscripciones + success fee · '+team+' personas en tu red';
    const cls=['g-con','g-red','g-esm','g-rub','g-dia','g-cor'][rank];
    $('rank').innerHTML=`<span class="gem ${cls}"></span> Rango: ${names[rank]}`;
    const nxt=unlocked.indexOf(false);
    if(nxt<0){$('next').innerHTML=corona?'⇄ Eres <b>Embajador Corona</b>: el rango máximo de la red.':`⇄ Tienes los 5 niveles. Con ${Math.max(0,25-n[0])} directos y ${Math.max(0,300-team)} suscriptores más en tu red llegas a <b>Embajador Corona</b>.`;return}
    const need=[0,3,5,8,10][nxt], needNet=[0,0,0,25,60][nxt], extra=n[nxt]*net*PCT[nxt];
    const parts=[]; if(n[0]<need)parts.push(`${need-n[0]} directos más`); if(team<needNet)parts.push(`${needNet-team} suscriptores más en tu red`);
    $('next').innerHTML=`⇄ Con ${parts.join(' y ')} llegas a <b>${names[nxt]}</b> y desbloqueas N${nxt+1}: <b style="color:var(--lime)">+${fmt(extra+n[nxt]*inv*SF_RATE/12*INV[nxt])}</b> al mes con tu red actual.`;
  }
  document.querySelectorAll('#simulador input').forEach(el=>el.addEventListener('input',calc));calc();
})();

/* Agente SE (demo con respuestas predefinidas) */
(function(){
  const msgs=document.getElementById('msgs');if(!msgs)return;
  const say=(t,who)=>{const d=document.createElement('div');d.className='m '+who;d.innerHTML=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight};
  const kb=[
    [/cobra|comisi|fee|cuota|costo|precio/i,'Al depositar cobramos <b>1,5 %</b> y al retirar <b>1,5 %</b>. En proyectos: <b>2 % anual</b> de administración y <b>20 % del excedente</b> solo si superas el 8 % anual. El proyecto paga una comisión de desembolso de 3 %. Si una ronda no alcanza su soft cap, te devolvemos el 100 %, fee incluido. Todo está en la página Cómo ganamos.'],
    [/riesgo|perder|seguro|garant/i,'Son participaciones de <b>alto riesgo</b>: un proyecto puede rendir menos de lo esperado o fracasar, y podrías perder parte o todo tu capital. Por eso cada ficha muestra el nivel de riesgo, los supuestos y la contabilidad completa. La regla de oro: diversifica y aporta solo lo que puedas permitirte perder.'],
    [/retir|salir|liquidez|vender|antes/i,'Tu capital queda comprometido durante el plazo del proyecto. Si necesitas salir antes, puedes vender tus tokens en el <b>mercado secundario</b> (0,75 % por operación), siempre que haya un comprador interesado.'],
    [/vox|populi|campa|promo|marketing/i,'<b>Vox Populi</b> es nuestro programa de marketing de comunidad. Los proyectos depositan su presupuesto en garantía on-chain y la red cobra por cada acción verificada: contenido, personas registradas y eventos. Además ganas hasta 5 niveles sobre la actividad de tu equipo (10 %, 6 %, 4 %, 3 % y 2 %). En proyectos tokenizados nunca se paga por el monto aportado.'],
    [/red|refer|nivel|ganar|invit|rango/i,'Vox Populi te paga por tres caminos y <b>no necesitas aportar</b>: 1) hasta el 18 % del ingreso neto de cada suscripción a nuestras apps (5 niveles: 18, 7, 5, 3 y 2 %), y 2) hasta el 15 % del success fee que SE pay cobra cuando los aportes de tu red generan ganancias (15, 6, 4, 3 y 2 %), y 3) un bonus del 50 % del excedente de SE Quant sobre 39 % (20, 12, 8, 6 y 4 %). Todo se paga al instante en USDC, y SE pay se reserva su parte antes de repartir. Nunca pagamos sobre el dinero depositado. Rangos: Conector, Red, Esmeralda, Rubí, Diamante y Embajador Corona.'],
    [/token/i,'Un token representa una fracción de los derechos económicos del proyecto. Queda en tu wallet y el contrato te envía automáticamente tu parte de cada distribución en USDC.'],
    [/m[ií]nimo|cu[aá]nto necesito|empezar/i,'Puedes empezar desde <b>US$100</b> según el proyecto. La cuenta Explorador es gratis.'],
    [/contab|transparen|audit|hash/i,'Cada ingreso, gasto y distribución se registra en blockchain con un hash verificable, y auditores externos revisan cada proyecto cada trimestre. Puedes verlo en la sección Transparencia de cada ficha.'],
    [/trading|ea|bot|algoritm|forex|quant|multisig|safe/i,'SE Quant es opcional y opera desde tu propia <b>Safe multisig</b> en Avalanche. El reparto anual va en este orden: <b>tú cobras primero</b> hasta 30 % anual; después SE pay cobra 30 % sobre ese 30 % (9 puntos); lo que supere 39 % se divide 50 % para SE pay y 50 % como bonus para la red Vox Populi. Sin cuota de administración. Límites: 1 % de riesgo por operación, −3 % diario, freno a −15 %. El 30 % es un objetivo, no una garantía: es operación cripto de alto riesgo.'],
    [/cr[eé]dito|prest|lending|borrow|pr[eé]stamo|tarjeta|remesa/i,'Puedes prestar en dos pools. <b>Tarjeta SE pay:</b> recibes 15 % anual; los titulares pagan 1,8 % mensual y están evaluados en buró y con garantía. <b>Empresas de remesas:</b> recibes 1,3 % mensual (≈15,6 % anual); las empresas pagan 2,7 % mensual por liquidez de corto plazo y SE pay toma el resto. Ambos pools tienen fondo de protección y el respaldo del capital de SE pay. No es un depósito bancario: si las pérdidas superan esas protecciones, podrías recibir menos.'],
    [/remesa|enviar dinero|env[ií]o|transfer/i,'Las remesas de SE pay cuestan desde <b>0,8 %</b>: Colombia 1,4 %, EE. UU. 0,8 %, Brasil 1,9 %, Asia 1,9 % y resto del mundo 3 %, con un mínimo por envío. La comisión no depende del tipo de cambio: la cotización es la del mercado, sin recargo. Prueba la calculadora en la página de Remesas.'],
    [/tesorer|okx|nuestro dinero/i,'La tesorería de SE pay es dinero propio (las comisiones que cobramos) y se opera en OKX solo en BTC/USD y AVAX/USD. En la página de Tesorería ves cada posición y cada resultado, leídos del exchange con una clave de solo lectura. Nunca operamos con dinero de clientes.'],
    [/lanzar|aplicar|mi proyecto|fundador|revisi[oó]n/i,'Para lanzar tu proyecto en SE pay, nuestro agente experto revisa negocio, runway y finanzas por <b>US$15.000</b>, con informe completo aunque no se apruebe. Si se aprueba, mejoramos el proyecto, la landing, los anuncios y las redes, activamos un bot de atención 24/7 y hacemos 4 campañas por email y WhatsApp a un mínimo de 100.000 personas con permiso.'],
  ];
  function answer(q){
    const hit=kb.find(([r])=>r.test(q));
    setTimeout(()=>say(hit?hit[1]:'Buena pregunta. Puedo explicarte comisiones, riesgos, liquidez, tokens, contabilidad o el programa Vox Populi. ¿Sobre cuál quieres saber más?','a'),500);
  }
  say('Hola, soy el <b>Agente SE</b>. Te explico cualquier proyecto, sus números y sus riesgos antes de que decidas. ¿Qué quieres saber?','a');
  document.getElementById('sugg').addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){say(e.target.textContent,'u');answer(e.target.textContent)}});
  document.getElementById('chatf').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('chati');const q=i.value.trim();if(!q)return;say(q.replace(/</g,'&lt;'),'u');i.value='';answer(q)});
})();

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
  const OV=[.10,.06,.04,.03,.02], names=['Conector','Red','Esmeralda','Rubí','Diamante'];
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

/* ===== Economía de las apps + runway de la red ===== */
(function(){
  if(!document.getElementById('app-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const usd2=n=>'US$'+n.toFixed(2).replace('.',',');
  const pc=n=>(Math.round(n*10)/10).toString().replace('.',',')+' %';
  function model(){
    const subs=+$('ap-subs').value, price=+$('ap-price').value, store=+$('ap-store').value/100, ref=+$('ap-ref').value/100,
      eff=+$('ap-eff').value/100, opex=+$('ap-opex').value/100, churn=+$('ap-churn').value/100, cac=+$('ap-cac').value;
    const gross=subs*price, st=gross*store, net=gross-st, red=net*.35*ref*eff, op=gross*opex, newSubs=subs*churn, mkt=newSubs*(1-ref)*cac;
    return {subs,price,store,ref,eff,opex,churn,cac,gross,st,net,red,op,newSubs,mkt,profit:net-red-op-mkt};
  }
  function render(){
    const m=model();
    $('ap-subs-v').textContent=m.subs.toLocaleString('de-DE'); $('ap-price-v').textContent=usd2(m.price); $('ap-store-v').textContent=pc(m.store*100);
    $('ap-ref-v').textContent=pc(m.ref*100); $('ap-eff-v').textContent=pc(m.eff*100); $('ap-opex-v').textContent=pc(m.opex*100);
    $('ap-churn-v').textContent=pc(m.churn*100); $('ap-cac-v').textContent=usd(m.cac);
    $('ap-rows').innerHTML=[
      ['Ingreso bruto',m.gross,'up'],['Comisión de la tienda',-m.st,''],['Ingreso neto',m.net,'',1],
      ['Comisiones Vox Populi ('+pc(m.red/m.net*100)+' del neto)',-m.red,''],['Costos de operación',-m.op,''],
      ['Marketing: '+Math.round(m.newSubs*(1-m.ref)).toLocaleString('de-DE')+' altas fuera de la red',-m.mkt,'']
    ].map(([k,v,c,t])=>`<div class="res-row"${t?' style="font-weight:600"':''}><span>${k}</span><b class="${c}">${usd(v)}</b></div>`).join('');
    $('ap-profit').textContent=usd(m.profit); $('ap-profit').style.color=m.profit<0?'var(--red)':'var(--lime)';
    $('ap-profit-sub').textContent=pc(m.profit/m.gross*100)+' del bruto · '+usd(m.profit*12)+' al año · se reparte en el proyecto con los participantes primero';
    // una suscripción
    const per=x=>x/m.subs, segs=[
      ['Tienda de apps',per(m.st),'#4a5056'],['Vox Populi',per(m.red),'var(--c-rd)'],['Operación',per(m.op),'var(--c-fee)'],
      ['Marketing',per(m.mkt),'var(--c-co)'],['Utilidad del proyecto',Math.max(0,per(m.profit)),'var(--lime)']];
    $('dollar').innerHTML=segs.map(([k,v,c])=>`<i style="flex:${Math.max(v,0.0001)};background:${c}" title="${k}"></i>`).join('');
    $('dollar-leg').innerHTML=`<div class="dl-total"><small>Suscripción</small><b>${usd2(m.price)}</b></div>`+segs.map(([k,v,c])=>`<div><span class="xs-sw" style="background:${c}"></span><small>${k}</small><b>${usd2(v)}</b><em>${pc(v/m.price*100)}</em></div>`).join('');
    runway(m);
  }
  function runway(m){
    if(!$('rw-lag'))return;
    const lag=+$('rw-lag').value, res=+$('rw-res').value, g=+$('rw-g').value/100, lm=lag/30, top=+$('rw-top').value/100;
    $('rw-top-v').textContent=pc(top*100);
    $('rw-lag-v').textContent=lag+' días'; $('rw-res-v').textContent=usd(res); $('rw-g-v').textContent=pc(g*100);
    const float=m.red*lm*Math.pow(1+g,lm), rec=float*1.5, cover=float>0?res/float:99, months=m.red>0?res/m.red:99, topUp=m.net*.65*top, gap=Math.max(0,rec-res), fill=gap<=0?0:(topUp>0?gap/topUp:Infinity);
    const st=cover>=1.5?['Holgada','up']:cover>=1?['Justa','']:['Insuficiente: pagos en cola','down'];
    $('rw-rows').innerHTML=[
      ['Comisiones a la red al mes',usd(m.red)],['Dinero que la red cobra antes de que pague la tienda',usd(float)],
      ['Reserva recomendada (1,5 veces)',usd(rec)],['Cobertura de la reserva',(Math.round(cover*100)/100).toString().replace('.',',')+'x'],
      ['Aporte mensual de SE pay a la reserva',usd(topUp)+' <small class="mute">('+pc(topUp/m.net*100)+' del neto)</small>'],
      ['Tiempo para llegar a la reserva recomendada',gap<=0?'<span class="up">Meta cubierta · aporte en pausa</span>':(fill===Infinity?'<span class="down">Sin aporte</span>':fill.toFixed(1).replace('.',',')+' meses')],
      ['Estado',`<span class="${st[1]}">${st[0]}</span>`]
    ].map(([k,v])=>`<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');
    $('rw-months').textContent=(months>=99?'99+':months.toFixed(1).replace('.',','))+' meses';
    $('rw-months').style.color=cover>=1?'var(--lime)':'var(--red)';
    $('rw-sub').textContent='Si la tienda dejara de pagar por completo, la reserva cubriría ese tiempo de comisiones.';
  }
  document.querySelectorAll('#app-sim input,#runway-sim input').forEach(x=>x.addEventListener('input',render)); render();
})();

/* ===== Crédito con la tarjeta SE pay ===== */
(function(){
  if(!document.getElementById('lend-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const LEND=.15, MONTHLY=.018, REM=.013;
  let pool='tarjeta';
  $('ld-pool').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('ld-pool').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));pool=b.dataset.p;lend()});
  function lend(){
    const a=+$('ld-amt').value, m=+$('ld-m').value, fee=a*.015, lent=a-fee, rem=pool==='remesas', int=rem?lent*REM*m:lent*LEND*m/12;
    $('ld-amt-v').textContent=usd(a); $('ld-m-v').textContent=m+(m===1?' mes':' meses');
    $('ld-rows').innerHTML=[['Depósito',usd(a)],['Fee de depósito 1,5 %','− '+usd(fee)],['Prestado en el pool',usd(lent)],['Retorno',rem?'1,3 % mensual (≈15,6 % anual)':'15 % anual'],['Destino',rem?'Empresas de remesas':'Tarjeta SE pay']]
      .map(([k,v])=>`<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');
    $('ld-tot').textContent=usd(int); $('ld-sub').textContent='≈ '+usd(int/m)+' al mes · respaldado por el fondo de protección y el capital de SE pay';
  }
  function borrow(){
    // Cuotas iguales con 1,8 % mensual sobre el saldo pendiente.
    const a=+$('bw-amt').value, m=+$('bw-m').value, q=a*MONTHLY/(1-Math.pow(1+MONTHLY,-m)), total=q*m, int=total-a;
    $('bw-amt-v').textContent=usd(a); $('bw-m-v').textContent=m+(m===1?' mes':' meses');
    $('bw-rows').innerHTML=[['Monto usado',usd(a)],['Interés','1,8 % mensual (21,6 % anual)'],['Cuota mensual',usd(q)],['Total a pagar',usd(total)]]
      .map(([k,v])=>`<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');
    $('bw-tot').textContent=usd(int); $('bw-sub').textContent='Pagando en '+m+(m===1?' cuota':' cuotas')+' iguales. Si pagas antes, pagas menos interés.';
  }
  document.querySelectorAll('#lend-sim input').forEach(x=>x.addEventListener('input',lend));
  document.querySelectorAll('#borrow-sim input').forEach(x=>x.addEventListener('input',borrow));
  lend(); borrow();
})();

/* ===== Onboarding de 3 pasos (permiso de contacto) ===== */
(function(){
  const root=document.getElementById('ob'); if(!root)return;
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const Q2={
    vox:['¿Cuántas personas crees que podrías invitar?',['Aún no lo sé','Menos de 10','Entre 10 y 50','Más de 50']],
    financiar:['¿Cuánto necesita tu proyecto?',['Menos de US$250.000','US$250.000 – US$1M','Más de US$1M','Quiero una campaña de marketing']],
    tarjeta:['¿Qué usarías más?',['La tarjeta para pagar','Enviar dinero a otro país','Recibir pagos','Todo lo anterior']],
    explorar:['¿Qué te gustaría entender primero?',['Cómo funcionan los proyectos','Cómo se protege mi dinero','Cómo gana dinero SE pay','Cómo ganar recomendando']],
    _:['¿Con cuánto te gustaría empezar?',['Aún no lo sé, quiero aprender','Menos de US$500','US$500 – US$5.000','Más de US$5.000']]
  };
  const NEXT={
    proyectos:['Mientras tanto, revisa los proyectos abiertos y usa la calculadora de cada uno.',[['proyectos.html','Ver proyectos abiertos →',1],['tecnologia.html#avalanche','Cómo verificarlo en la blockchain']]],
    quant:['Mientras tanto, mira el reparto y los límites de riesgo de SE Quant.',[['trading.html#reparto','Ver cómo se reparte →',1],['safe.html','Cómo funciona tu Safe']]],
    credito:['Mientras tanto, calcula lo que generaría tu dinero en cada pool.',[['credito.html#prestar','Abrir el simulador →',1],['credito.html#pedir','Cómo funciona la línea de crédito']]],
    vox:['Tu código de Vox Populi llega con tu acceso. Mientras tanto, calcula lo que podría generar tu red.',[['red.html#simulador','Calcular mis ingresos →',1],['vox-populi.html#campanas','Ver campañas activas']]],
    tarjeta:['Mientras tanto, conoce la tarjeta y cuánto cuestan las remesas.',[['negocio.html#tarjeta','Ver la tarjeta →',1],['negocio.html#comisiones','Todas las comisiones']]],
    financiar:['Nuestro equipo te escribe para entender tu proyecto.',[['vox-populi.html#para-proyectos','Lanzar una campaña →',1],['proyectos.html#caps','Cómo funcionan las rondas']]],
    explorar:['Empieza por aquí: tres páginas que explican todo.',[['tecnologia.html','Cómo funciona →',1],['safe.html','Cómo se protege el dinero'],['negocio.html','Cómo ganamos dinero']]]
  };
  const state={goal:null,amount:null,channel:'whatsapp',frequency:'relevante',project:params.get('p')||null,ref:null};
  try{state.ref=params.get('ref')||localStorage.getItem('se_ref');if(params.get('ref'))localStorage.setItem('se_ref',params.get('ref'))}catch(e){}

  function show(n){
    root.querySelectorAll('.ob-step').forEach(s=>s.hidden=+s.dataset.step!==n);
    $('ob-bar').style.width=Math.min(100,n/3*100)+'%';
    $('ob-step-label').textContent=n>3?'¡Listo!':'Paso '+n+' de 3';
    $('ob-back').hidden=n===1||n>3;
    root.dataset.step=n;
  }
  function pickGoal(g,advance){
    state.goal=g;
    $('ob-goals').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.goal===g));
    const [q,opts]=Q2[g]||Q2._;
    $('ob-q2').textContent=q;
    $('ob-amounts').innerHTML=opts.map(o=>`<button type="button" data-v="${o}"><b>${o}</b></button>`).join('');
    if(advance)show(2);
  }
  $('ob-goals').addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickGoal(b.dataset.goal,true)});
  $('ob-amounts').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.amount=b.dataset.v;$('ob-amounts').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));setTimeout(()=>show(3),150)});
  $('ob-back').addEventListener('click',()=>show(Math.max(1,+root.dataset.step-1)));
  root.querySelectorAll('.ob-chips').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));state[g.dataset.name]=b.dataset.v}));

  // Llegada desde una página o un proyecto: preselecciona y avanza.
  const g=params.get('goal')||(state.project?'proyectos':null);
  if(state.project&&window.PROJECTS){const p=PROJECTS.find(x=>x.slug===state.project);if(p){$('ob-context').hidden=false;$('ob-context').innerHTML='Te interesa <b>'+p.name+'</b>. Te avisaremos de su ronda.'}}
  if(g&&(Q2[g]||NEXT[g])){pickGoal(g,true)}else{show(1)}

  const f=$('ob-form');
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const err=f.querySelector('.err'), el=n=>f.elements[n];
    const name=el('name').value.trim(), email=el('email').value.trim(), wa=el('whatsapp').value.replace(/\D/g,'');
    const bad=!name?'Escribe tu nombre.':!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)?'Revisa tu email.':wa.length<7?'Revisa tu número de WhatsApp.':!el('consent_contact').checked?'Necesitamos tu permiso para contactarte.':'';
    if(bad){err.textContent=bad;err.hidden=false;return}
    err.hidden=true;
    const labels={proyectos:'Participar en proyectos',quant:'SE Quant (trading)',credito:'Prestar o pedir crédito',vox:'Vox Populi (referidos)',tarjeta:'Remesas y tarjeta',financiar:'Tengo un proyecto para financiar',explorar:'Quiero entender primero'};
    const data={website:el('website').value,name,email,whatsapp:el('cc').value+wa,interest:labels[state.goal]||'',goal:state.goal,amount:state.amount,channel:state.channel,frequency:state.frequency,
      consent_contact:true,consent_marketing:el('consent_marketing').checked,ref:state.ref||null,project:state.project,page:location.pathname+'#onboarding',ts:new Date().toISOString()};
    const btn=f.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Enviando…';
    const demo=!FORM.endpoint;
    if(!demo){try{const r=await fetch(FORM.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw 0}catch(x){btn.disabled=false;btn.textContent='Listo, quiero empezar →';err.textContent='No pudimos enviar tus datos. Inténtalo de nuevo.';err.hidden=false;return}}
    const [txt,links]=NEXT[state.goal]||NEXT.explorar;
    const via=state.channel==='email'?'tu email':state.channel==='ambos'?'WhatsApp y email':'WhatsApp';
    $('ob-done-name').textContent=name.split(' ')[0];
    $('ob-done-text').textContent='Te escribimos por '+via+(state.frequency==='semanal'?' con un resumen semanal. ':' solo cuando haya algo para ti. ')+txt;
    $('ob-next').innerHTML=links.map(([h,t,p])=>`<a href="${h}" class="btn ${p?'btn-lime':'btn-ghost'}" style="justify-content:center">${t}</a>`).join('')+'<button type="button" class="btn btn-ghost" style="justify-content:center" onclick="document.getElementById(\'comm-btn\')?.click()">Unirme a la comunidad</button>';
    $('ob-demo').hidden=!demo;
    show(4);
  });
})();

/* ===== Remesas: tarifas por destino y calculadora ===== */
const REMESAS={
  co:{name:'Colombia',flag:'🇨🇴',fee:.014,min:1.99,eta:'minutos'},
  us:{name:'EE. UU.',flag:'🇺🇸',fee:.008,min:1.49,eta:'minutos'},
  br:{name:'Brasil',flag:'🇧🇷',fee:.019,min:1.99,eta:'minutos (PIX)'},
  as:{name:'Asia',flag:'🌏',fee:.019,min:2.99,eta:'1–24 horas'},
  rw:{name:'Resto del mundo',flag:'🌎',fee:.03,min:3.99,eta:'1–48 horas'},
};
const MARKET_AVG=.062;
(function(){
  if(!document.getElementById('rm-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>'US$'+n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pc=n=>(Math.round(n*1000)/10).toString().replace('.',',')+' %';
  // La comisión no depende del tipo de cambio: la cotización es la del mercado, sin recargo.
  const quote=(c,a)=>{const r=REMESAS[c],fee=Math.max(a*r.fee,r.min);return {fee,total:fee,gets:a-fee}};
  $('rm-table').innerHTML=Object.entries(REMESAS).map(([k,r])=>{const q=quote(k,300);return `<tr><td>${r.flag} ${r.name}</td><td class="hl">${pc(r.fee)}</td><td>${usd(r.min)}</td><td>Del mercado, sin recargo</td><td><b>${usd(q.total)}</b> <small class="mute">(${pc(q.total/300)})</small></td><td>${r.eta}</td></tr>`}).join('');
  let c='co';
  $('rm-dest').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('rm-dest').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));c=b.dataset.c;calc()});
  function calc(){
    const a=+$('rm-amt').value, r=REMESAS[c], q=quote(c,a), mkt=a*MARKET_AVG;
    $('rm-amt-v').textContent=usd(a).replace(',00','');
    $('rm-rows').innerHTML=[
      ['Envías',usd(a)],
      ['Comisión '+(a*r.fee<r.min?'(mínimo por envío)':pc(r.fee)),'− '+usd(q.fee)],
      ['Cotización','del mercado, sin recargo'],
      ['Tu familia recibe (en dólares)',usd(q.gets)],
      ['Llega en',r.eta]
    ].map(([k,v],i)=>`<div class="res-row"${i===3?' style="font-weight:600"':''}><span>${k}</span><b${i===3?' class="up"':''}>${v}</b></div>`).join('');
    $('rm-tot').textContent=usd(q.total);
    $('rm-sub').textContent=pc(q.total/a)+' del envío, todo incluido';
    $('rm-compare').innerHTML=`Con el promedio mundial (≈6 %) pagarías cerca de <b>${usd(mkt)}</b>. Con SE pay ahorras <b class="up">${usd(Math.max(0,mkt-q.total))}</b>.`;
  }
  $('rm-amt').addEventListener('input',calc); calc();
})();

/* ===== Tesorería en vivo (OKX, solo lectura) ===== */
(function(){
  if(!document.getElementById('ts-pos'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>n==null?'—':(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const px=n=>n==null?'—':n.toLocaleString('de-DE',{maximumFractionDigits:n<100?3:1});
  const cls=n=>n==null?'':n>=0?'up':'down';
  const DEMO={demo:true,totalEquityUsd:1250000,positions:[
      {instId:'BTC-USD-SWAP',side:'long',size:4.2,avgPx:61850,markPx:62410,lever:2,upl:2352,notionalUsd:262122},
      {instId:'AVAX-USD-SWAP',side:'short',size:9000,avgPx:27.4,markPx:27.9,lever:2,upl:-4500,notionalUsd:251100}],
    fills:[['BTC-USD-SWAP','sell',62120,1.1,1840],['AVAX-USD-SWAP','buy',27.1,4000,-620],['BTC-USD-SWAP','buy',61500,1.5,0],['AVAX-USD-SWAP','sell',28.3,3500,910],['BTC-USD-SWAP','sell',60980,0.8,-410]]
      .map(([instId,side,px,size,pnl],i)=>({instId,side,px,size,pnl,ts:Date.now()-(i+1)*5.4e6}))};
  function render(d){
    const pos=d.positions||[], fills=d.fills||[];
    const open=pos.reduce((a,p)=>a+Math.abs(p.notionalUsd||0),0), upl=pos.reduce((a,p)=>a+(p.upl||0),0), pnl=fills.reduce((a,f)=>a+(f.pnl||0),0);
    $('ts-total').textContent=usd(d.totalEquityUsd); $('ts-open').textContent=usd(open);
    $('ts-upl').textContent=usd(upl); $('ts-upl').className=cls(upl);
    $('ts-pnl').textContent=usd(pnl); $('ts-pnl').className=cls(pnl);
    $('ts-pos').innerHTML=pos.length?pos.map(p=>`<tr><td class="mono">${p.instId.split('-').slice(0,2).join('/')}</td><td><span class="side ${p.side==='short'?'sell':'buy'}">${p.side==='short'?'CORTO':'LARGO'}</span></td><td class="mono">${px(Math.abs(p.size))}</td><td class="mono">${px(p.avgPx)}</td><td class="mono">${px(p.markPx)}</td><td class="mono ${cls(p.upl)}">${usd(p.upl)}</td></tr>`).join('')
      :'<tr><td colspan="6" style="color:var(--mute)">Sin posiciones abiertas en este momento.</td></tr>';
    $('ts-fills').innerHTML=fills.slice(0,8).map(f=>`<div class="pos"><span class="mono">${f.instId.split('-').slice(0,2).join('/')} <small style="color:var(--mute)">${new Date(f.ts).toLocaleString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</small></span><span class="side ${f.side==='sell'?'sell':'buy'}">${f.side==='sell'?'VENTA':'COMPRA'}</span><span class="mono ${cls(f.pnl)}">${f.pnl?usd(f.pnl):'abre'}</span></div>`).join('')||'<p style="color:var(--mute);font-size:13px">Sin operaciones recientes.</p>';
    $('ts-src').innerHTML=d.demo?'<span class="dot" style="background:var(--mute)"></span> Datos de demostración':'<span class="dot"></span> En vivo desde OKX';
    $('ts-upd').textContent=d.demo?'':'Actualizado '+new Date(d.updatedAt).toLocaleTimeString('es-ES');
  }
  async function load(){
    try{const r=await fetch('/api/tesoreria',{cache:'no-store'});const d=await r.json();if(d.configured&&!d.error){render(d);return}}catch(e){}
    render(DEMO);
  }
  load(); setInterval(load,30000);
})();

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

/* Nav al hacer scroll + reveal escalonado */
(function(){
  const n=document.querySelector('nav'); const on=()=>n.classList.toggle('scrolled',scrollY>20); addEventListener('scroll',on,{passive:true}); on();
  document.querySelectorAll('.reveal').forEach(el=>{const sib=[...el.parentElement.children].filter(x=>x.classList.contains('reveal'));const i=sib.indexOf(el);if(i>0)el.style.transitionDelay=Math.min(i,5)*70+'ms'});
})();
