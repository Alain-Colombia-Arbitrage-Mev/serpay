
/* ===== Remesas: tarifas por destino y calculadora ===== */
const REMESAS={
  co:{name:'Colombia',flag:'🇨🇴',fee:.012,fx:.005,min:1.99,eta:'minutos'},
  us:{name:'EE. UU.',flag:'🇺🇸',fee:.008,fx:0,min:1.49,eta:'minutos'},
  br:{name:'Brasil',flag:'🇧🇷',fee:.015,fx:.004,min:1.99,eta:'minutos (PIX)'},
  as:{name:'Asia',flag:'🌏',fee:.015,fx:.005,min:2.99,eta:'1–24 horas'},
  rw:{name:'Resto del mundo',flag:'🌎',fee:.025,fx:.007,min:3.99,eta:'1–48 horas'},
};
const MARKET_AVG=.062;
(function(){
  if(!document.getElementById('rm-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>'US$'+n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pc=n=>(Math.round(n*1000)/10).toString().replace('.',',')+' %';
  const quote=(c,a)=>{const r=REMESAS[c],fee=Math.max(a*r.fee,r.min),fx=a*r.fx;return {fee,fx,total:fee+fx,gets:a-fee-fx}};
  $('rm-table').innerHTML=Object.entries(REMESAS).map(([k,r])=>{const q=quote(k,300);return `<tr><td>${r.flag} ${r.name}</td><td class="hl">${pc(r.fee)}</td><td>${r.fx?pc(r.fx):'—'}</td><td>${usd(r.min)}</td><td><b>${usd(q.total)}</b> <small class="mute">(${pc(q.total/300)})</small></td><td>${r.eta}</td></tr>`}).join('');
  let c='co';
  $('rm-dest').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('rm-dest').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));c=b.dataset.c;calc()});
  function calc(){
    const a=+$('rm-amt').value, r=REMESAS[c], q=quote(c,a), mkt=a*MARKET_AVG;
    $('rm-amt-v').textContent=usd(a).replace(',00','');
    $('rm-rows').innerHTML=[
      ['Envías',usd(a)],
      ['Comisión '+(a*r.fee<r.min?'(mínimo por envío)':pc(r.fee)),'− '+usd(q.fee)],
      ['Margen cambiario '+(r.fx?pc(r.fx):''),r.fx?'− '+usd(q.fx):'sin cambio de moneda'],
      ['Tu familia recibe (en dólares)',usd(q.gets)],
      ['Llega en',r.eta]
    ].map(([k,v],i)=>`<div class="res-row"${i===3?' style="font-weight:600"':''}><span>${k}</span><b${i===3?' class="up"':''}>${v}</b></div>`).join('');
    $('rm-tot').textContent=usd(q.total);
    $('rm-sub').textContent=pc(q.total/a)+' del envío, todo incluido';
    $('rm-compare').innerHTML=`Con el promedio mundial (≈6 %) pagarías cerca de <b>${usd(mkt)}</b>. Con SE pay ahorras <b class="up">${usd(Math.max(0,mkt-q.total))}</b>.`;
  }
  $('rm-amt').addEventListener('input',calc); calc();
})();
