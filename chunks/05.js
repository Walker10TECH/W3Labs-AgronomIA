/* W3Labs AgronomIA — runtime chunk 05. */

let leafletPromise;
function loadLeaflet(){
  if(window.L) return Promise.resolve(window.L);
  if(leafletPromise) return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
    const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=()=>resolve(window.L);s.onerror=reject;document.head.appendChild(s);
  }); return leafletPromise;
}
async function openFarmMap(talhoes=[]){
  const body=`<div class="map-shell"><div id="farm-map-canvas" class="map-canvas"></div><aside class="map-sidebar"><strong>Talhões georreferenciados</strong><span class="map-count">${talhoes.filter(t=>parseCoordinates(t.coordenadas)).length} de ${talhoes.length}</span><div class="map-list">${talhoes.map(t=>`<button class="map-row" data-coords="${escapeHtml(t.coordenadas||'')}">${icon('map',16)}<span><b>${escapeHtml(t.nome||'Talhão')}</b><small>${escapeHtml(t.culturaAtual||'Sem cultura')} · ${Number(t.area||t.areaTotal||0).toLocaleString('pt-BR')} ha</small></span></button>`).join('')}</div></aside></div>`;
  const m=modal({title:'Mapa da Propriedade & Talhões',subtitle:'OpenStreetMap + imagens de satélite',body,wide:true});
  try{
    const L=await loadLeaflet();
    const valid=talhoes.map(t=>({t,p:parseCoordinates(t.coordenadas)})).filter(x=>x.p);
    const center=valid[0]?.p || {lat:-15.78,lon:-47.93};
    const map=L.map(m.element.querySelector('#farm-map-canvas')).setView([center.lat,center.lon],valid.length?12:5);
    const osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'});osm.addTo(map);
    const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'© Esri'});
    L.control.layers({'Mapa':osm,'Satélite':satellite}).addTo(map);
    valid.forEach(({t,p})=>L.marker([p.lat,p.lon]).addTo(map).bindPopup(`<strong>${escapeHtml(t.nome)}</strong><br>${escapeHtml(t.culturaAtual||'')}<br>${Number(t.area||0).toLocaleString('pt-BR')} ha`));
    setTimeout(()=>map.invalidateSize(),250);
    m.element.querySelectorAll('.map-row').forEach(row=>row.onclick=()=>{const p=parseCoordinates(row.dataset.coords);if(p)map.setView([p.lat,p.lon],16);});
  }catch(e){m.element.querySelector('#farm-map-canvas').innerHTML=`<div class="map-fallback">${icon('map',36)}<strong>Mapa externo indisponível</strong><p>Cadastre coordenadas no formato latitude, longitude.</p></div>`;}
}

function openPdfViewer(source,title='Documento PDF'){
  if(!source) return modal({title:'PDF indisponível',body:'Nenhum arquivo PDF ou link foi anexado a este documento.'});
  const body=`<div class="pdf-viewer"><iframe title="${escapeHtml(title)}" src="${source}" loading="lazy"></iframe><div class="pdf-actions"><a class="btn btn-secondary" href="${source}" target="_blank" rel="noopener">${icon('external',17)} Abrir em nova aba</a><a class="btn btn-primary" href="${source}" download>${icon('download',17)} Baixar PDF</a></div></div>`;
  return modal({title,subtitle:'Pré-visualização do Manual',body,wide:true});
}

async function openPropertyControl(){
  const admin=isAdmin(), name=propertyName(), code=propertyCode();
  const members=await DataStore.list('membros',{sortField:'criadoEm',sortDir:'desc'}).catch(()=>[]);
  const body=`<div class="property-panel"><div class="property-code-card"><span>Código da propriedade</span><strong>${escapeHtml(code)}</strong><small>Compartilhe somente com membros autorizados.</small></div><div class="property-grid">${formField('Nome da propriedade','propriedadeNome',name,{readonly:!admin,placeholder:'Minha Fazenda'})}${formField('Código','codigo',code,{readonly:true,help:'Use este código para vincular um usuário.'})}</div>${admin?`<form id="property-form" class="inline-form"><input name="email" type="email" placeholder="e-mail do novo membro" required><button class="btn btn-primary">${icon('userCheck',17)} Convidar</button></form>`:''}<div class="member-table"><div class="table-head"><span>Membro</span><span>Função</span><span>Status</span><span></span></div>${members.length?members.map(m=>`<div class="table-row"><span><b>${escapeHtml(m.nome||'Usuário')}</b><small>${escapeHtml(m.email||'')}</small></span><span>${escapeHtml(m.role||'member')}</span><span>${escapeHtml(m.status||'ativo')}</span><span>${admin?`<button class="icon-btn danger js-remove-member" data-id="${m.id}" title="Remover">${icon('trash',17)}</button>`:''}</span></div>`).join(''):`<div class="table-empty">Nenhum membro vinculado ainda.</div>`}</div></div>`;
  const m=modal({title:'Propriedade & Equipe',subtitle:admin?'Administração da propriedade e membros':'Dados da propriedade (visualização)',body,wide:true,actions:admin?`<button class="btn btn-primary" id="save-property">${icon('check',17)} Salvar</button>`:''});
  m.element.querySelector('#save-property')?.addEventListener('click',async()=>{const field=m.element.querySelector('[name=propriedadeNome]');await DataStore.save('users',{propriedadeNome:field.value},authUser.uid);userProfile.propriedadeNome=field.value;toast('Nome da propriedade atualizado.','success');m.close();location.hash='#dashboard';});
  m.element.querySelector('#property-form')?.addEventListener('submit',async e=>{e.preventDefault();const email=new FormData(e.currentTarget).get('email').trim().toLowerCase();await DataStore.save('convites',{email,adminUid:effectiveUid(),propriedadeNome:name,status:'pendente'});toast(`Convite registrado para ${email}.`,'success');e.currentTarget.reset();});
  m.element.querySelectorAll('.js-remove-member').forEach(b=>b.onclick=async()=>{if(confirm('Remover este membro da propriedade?')){await DataStore.remove('membros',b.dataset.id);toast('Membro removido.','success');m.close();openPropertyControl();}});
}

function mountChatbot(root, {userName='Produtor'}={}){
  if(root.querySelector('#chatbot'))return;
  root.insertAdjacentHTML('beforeend', `<div id="chatbot" class="chatbot"><button class="chat-fab" id="chat-open" title="AgronomIA">${icon('bot',24)}<span>IA</span></button><section class="chat-panel" id="chat-panel" hidden><header><div class="chat-title">${icon('bot',19)}<div><strong>AgronomIA</strong><small>Assistente da fazenda</small></div></div><button class="icon-btn" id="chat-close">${icon('x')}</button></header><div class="chat-messages" id="chat-messages"><div class="chat-message assistant">Olá, ${escapeHtml(userName)}. Posso consultar os dados carregados da propriedade e ajudar a interpretar operações agrícolas.</div></div><div class="chat-suggestions"><button data-q="Como está o histórico de chuvas?">Chuvas</button><button data-q="Qual o saldo de diesel?">Diesel</button><button data-q="Quantos hectares estão cadastrados?">Talhões</button></div><form id="chat-form"><input id="chat-input" autocomplete="off" placeholder="Pergunte sobre a fazenda..."><button>${icon('send',18)}</button></form></section></div>`);
  const panel=root.querySelector('#chat-panel'),messages=root.querySelector('#chat-messages'),form=root.querySelector('#chat-form'),input=root.querySelector('#chat-input');
  root.querySelector('#chat-open').onclick=()=>{panel.hidden=false;root.querySelector('#chat-open').hidden=true;input.focus()};
  root.querySelector('#chat-close').onclick=()=>{panel.hidden=true;root.querySelector('#chat-open').hidden=false};
  root.querySelectorAll('.chat-suggestions button').forEach(b=>b.onclick=()=>{input.value=b.dataset.q;form.requestSubmit()});
  form.addEventListener('submit',async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;append('user',q);input.value='';const typing=document.createElement('div');typing.className='chat-message assistant typing';typing.textContent='Analisando os dados...';messages.appendChild(typing);messages.scrollTop=messages.scrollHeight;try{const answer=await askAgronomIA(q);typing.remove();append('assistant',answer)}catch(err){typing.remove();append('assistant',err.message||'Não foi possível responder agora.')}});
  function append(role,text){const el=document.createElement('div');el.className=`chat-message ${role}`;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
}
