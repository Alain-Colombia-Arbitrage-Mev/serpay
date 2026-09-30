
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
