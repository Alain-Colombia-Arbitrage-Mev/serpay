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

