
/* ===== Crédito y lending ===== */
(function(){
  if(!document.getElementById('lend-sim'))return;
  const $=id=>document.getElementById(id);
  const usd=n=>(n<0?'− ':'')+'US$'+Math.abs(Math.round(n)).toLocaleString('de-DE');
  const pc=n=>(Math.round(n*10)/10).toString().replace('.',',')+' %';
  let rate=.075;
  $('ld-pool').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$('ld-pool').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));rate=+b.dataset.r;lend()});
  function lend(){
    const a=+$('ld-amt').value, m=+$('ld-m').value, fee=a*.015, lent=a-fee, int=lent*rate*m/12;
    $('ld-amt-v').textContent=usd(a); $('ld-m-v').textContent=m+(m===1?' mes':' meses');
    $('ld-rows').innerHTML=[['Depósito',usd(a)],['Fee de depósito 1,5 %','− '+usd(fee)],['Prestado en el pool',usd(lent)],['Rendimiento objetivo anual',pc(rate*100)]]
      .map(([k,v])=>`<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');
    $('ld-tot').textContent=usd(int); $('ld-sub').textContent='≈ '+usd(int/m)+' al mes · objetivo, no garantizado';
  }
  function borrow(){
    const col=+$('bw-col').value, ltv=+$('bw-ltv').value/100, m=+$('bw-m').value, loan=col*ltv, orig=loan*.015, int=loan*.10*m/12, drop=1-ltv/.75;
    $('bw-col-v').textContent=usd(col); $('bw-ltv-v').textContent=pc(ltv*100)+' de la garantía'; $('bw-m-v').textContent=m+(m===1?' mes':' meses');
    $('bw-rows').innerHTML=[['Préstamo',usd(loan)],['Comisión de originación 1,5 %','− '+usd(orig)],['Interés estimado (10 % anual)',usd(int)],
      ['Total a devolver',usd(loan+int)],['Se liquida si tu garantía cae',`<span class="${drop<.4?'down':'up'}">${pc(drop*100)}</span>`]]
      .map(([k,v])=>`<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');
    $('bw-tot').textContent=usd(loan-orig);
    $('bw-sub').textContent=drop<.4?'Préstamo alto: con una caída moderada del precio se liquida tu garantía.':'Margen amplio frente a caídas de precio.';
  }
  document.querySelectorAll('#lend-sim input').forEach(x=>x.addEventListener('input',lend));
  document.querySelectorAll('#borrow-sim input').forEach(x=>x.addEventListener('input',borrow));
  lend(); borrow();
})();
