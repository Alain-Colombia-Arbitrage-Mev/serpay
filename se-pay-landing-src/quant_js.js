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

