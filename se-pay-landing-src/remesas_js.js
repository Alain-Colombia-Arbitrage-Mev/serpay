
/* ===== Remesas: tarifas por destino, calculadora y comparación ===== */
// La comisión no depende del tipo de cambio: la cotización es la del mercado, sin recargo.
const REMESAS={
  co:{name:'Colombia',flag:'🇨🇴',fee:.019,min:2.49,eta:'minutos',ccy:'COP'},
  us:{name:'EE. UU.',flag:'🇺🇸',fee:.012,min:1.99,eta:'minutos',ccy:'USD'},
  br:{name:'Brasil',flag:'🇧🇷',fee:.022,min:2.49,eta:'minutos (PIX)',ccy:'BRL'},
  as:{name:'Asia',flag:'🌏',fee:.025,min:3.49,eta:'1–24 horas',ccy:'USD'},
  rw:{name:'Otros destinos',flag:'🌎',fee:.035,min:4.99,eta:'1–48 horas',ccy:'USD'},
};
const MARKET_AVG=.062;
(function(){
  if(!document.getElementById('rm-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>'US$'+n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pc=n=>(Math.round(n*1000)/10).toString().replace('.',',')+' %';
  const quote=(c,a)=>{const r=REMESAS[c],fee=Math.max(a*r.fee,r.min);return {fee,gets:Math.max(0,a-fee)}};
  const rates={USD:1};
  let c='co';

  // Cotización referencial del mercado (se fija al confirmar el envío).
  fetch('https://open.er-api.com/v6/latest/USD').then(r=>r.json()).then(d=>{if(d&&d.rates){Object.assign(rates,d.rates);calc()}}).catch(()=>{});

  $('rm-cards').innerHTML=Object.entries(REMESAS).map(([k,r])=>{const q=quote(k,300);return `<button class="card rm-card" data-c="${k}">
    <span class="rm-flag">${r.flag}</span><b>${r.name}</b><span class="rm-pct">${pc(r.fee)}</span>
    <small>Mínimo ${usd(r.min)} · llega en ${r.eta}</small><em>Envías US$300 → pagas ${usd(q.fee)}</em></button>`}).join('');

  function select(k){c=k;$('rm-dest').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.c===k));calc()}
  $('rm-dest').addEventListener('click',e=>{const b=e.target.closest('button');if(b)select(b.dataset.c)});
  $('rm-cards').addEventListener('click',e=>{const b=e.target.closest('.rm-card');if(!b)return;select(b.dataset.c);document.getElementById('rm-sim').scrollIntoView({behavior:'smooth',block:'center'})});

  function calc(){
    const a=Math.max(0,+$('rm-amt').value||0), r=REMESAS[c], q=quote(c,a), rate=rates[r.ccy];
    const local=r.ccy!=='USD'&&rate&&rate!==1;
    $('rm-lines').innerHTML=[
      ['Comisión '+(a*r.fee<r.min?'(mínimo por envío)':pc(r.fee)),'− '+usd(q.fee)],
      ['Cotización',local?'1 USD = '+rate.toLocaleString('de-DE',{maximumFractionDigits:2})+' '+r.ccy:'del mercado, sin recargo'],
      ['Llega en',r.eta]
    ].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('rm-get').textContent=local?(q.gets*rate).toLocaleString('de-DE',{maximumFractionDigits:0})+' '+r.ccy:usd(q.gets);
    $('rm-get-usd').textContent=local?'≈ '+usd(q.gets):'';
    const mkt=a*MARKET_AVG;
    $('rm-save').innerHTML=a?`Ahorras <b class="up">${usd(Math.max(0,mkt-q.fee))}</b> frente al promedio mundial`:'';
    $('rm-cmp-amt').textContent=a.toLocaleString('de-DE'); $('rm-cmp-dest').textContent=r.name;
    const max=Math.max(mkt,q.fee)||1;
    $('rm-bars').innerHTML=[['SE pay',q.fee,'lime'],['Promedio mundial (≈6 %)',mkt,'gray']]
      .map(([k,v,cl])=>`<div class="rm-bar"><div><span>${k}</span><b>${usd(v)}</b></div><i class="${cl}" style="width:${Math.max(2,v/max*100)}%"></i></div>`).join('');
  }
  $('rm-amt').addEventListener('input',calc); calc();
})();
