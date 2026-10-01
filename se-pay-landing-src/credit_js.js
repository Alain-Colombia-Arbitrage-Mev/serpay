
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
  document.querySelectorAll('.cr-pick').forEach(b=>b.addEventListener('click',()=>{
    const t=$('ld-pool').querySelector('[data-p="'+b.dataset.p+'"]'); if(t)t.click();
    $('lend-sim').scrollIntoView({behavior:'smooth',block:'center'});
  }));
  lend(); borrow();
})();
