
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
