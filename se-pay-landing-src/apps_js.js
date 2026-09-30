
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
      ['Comisiones Red ⇄ ('+pc(m.red/m.net*100)+' del neto)',-m.red,''],['Costos de operación',-m.op,''],
      ['Marketing: '+Math.round(m.newSubs*(1-m.ref)).toLocaleString('de-DE')+' altas fuera de la red',-m.mkt,'']
    ].map(([k,v,c,t])=>`<div class="res-row"${t?' style="font-weight:600"':''}><span>${k}</span><b class="${c}">${usd(v)}</b></div>`).join('');
    $('ap-profit').textContent=usd(m.profit); $('ap-profit').style.color=m.profit<0?'var(--red)':'var(--lime)';
    $('ap-profit-sub').textContent=pc(m.profit/m.gross*100)+' del bruto · '+usd(m.profit*12)+' al año · se reparte en el proyecto con los participantes primero';
    // una suscripción
    const per=x=>x/m.subs, segs=[
      ['Tienda de apps',per(m.st),'#4a5056'],['Red ⇄',per(m.red),'var(--c-rd)'],['Operación',per(m.op),'var(--c-fee)'],
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
