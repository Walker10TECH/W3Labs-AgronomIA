/* W3Labs AgronomIA — runtime chunk 08. */

/* ===== screens/manager.js ===== */

async function renderManager(root, initial='talhoes'){
  root.innerHTML = '<div class="module-page"><div class="content narrow-wide">'
    + pageHeader('Gestão da Propriedade','Talhões, almoxarifado, frota e controles gerenciais',true)
    + '<div class="manager-tabs"><button class="active" data-section="talhoes">'+icon('map',17)+' Talhões</button><button data-section="estoque">'+icon('warehouse',17)+' Almoxarifado & Estoque</button><button data-section="maquinas">'+icon('tractor',17)+' Inventário de Máquinas</button><button data-section="auditoria">'+icon('shield',17)+' Auditoria</button></div><div id="manager-content"></div>'
    + '</div><div id="toast-root"></div></div>';
  root.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{root.querySelectorAll('[data-section]').forEach(x=>x.classList.toggle('active',x===b));renderSection(b.dataset.section)});
  await renderSection(initial);

  async function renderSection(section){
    const el=root.querySelector('#manager-content');
    if(section==='talhoes') return renderTalhoes(el);
    if(section==='estoque') return renderEstoque(el);
    if(section==='maquinas') return renderMaquinas(el);
    return renderAuditoria(el);
  }

  async function renderTalhoes(el){
    const rows=await DataStore.list('talhoes',{sortField:'nome',sortDir:'asc'});
    const total=rows.reduce((a,r)=>a+Number(r.area||r.areaTotal||0),0);
    el.innerHTML='<div class="section-head"><div><span class="eyebrow">GEORREFERENCIAMENTO</span><h2>Gestão de Talhões</h2><p>Áreas, cultura atual e localização.</p></div><div class="page-actions"><button class="btn btn-secondary" id="map-btn">'+icon('map',17)+' Mapa</button>'+ (isAdmin()?'<button class="btn btn-primary" id="add-talhao">'+icon('plus',17)+' Novo Talhão</button>':'')+'</div></div>'
      +'<div class="stat-grid">'+statCard('Área mapeada',formatNumber(total)+' ha','soma dos talhões','map','green')+statCard('Talhões',rows.length,'glebas cadastradas','compass','slate')+statCard('Com GPS',rows.filter(r=>r.coordenadas).length,'georreferenciados','map','blue')+'</div>'
      +'<div class="panel-card"><div class="toolbar"><div class="search-box">'+icon('search',17)+'<input id="q" placeholder="Buscar nome, cultura, solo..."></div></div><div id="list" class="record-list"></div></div>';
    const list=el.querySelector('#list');
    const paint=data=>{
      list.innerHTML=data.length?data.map(r=>'<article class="record-card"><div class="record-accent"></div><div class="record-main"><div class="record-title"><div><span class="eyebrow">TALHÃO</span><h3>'+escapeHtml(r.nome||'Talhão')+'</h3><p>'+escapeHtml(r.culturaAtual||'Sem cultura')+' · '+escapeHtml(r.tipoSolo||'Solo não informado')+'</p></div><div class="record-actions">'+statusPill(r.status||'Ativo')+(isAdmin()?'<button class="icon-btn js-edit" data-id="'+r.id+'">'+icon('pencil',17)+'</button><button class="icon-btn danger js-delete" data-id="'+r.id+'">'+icon('trash',17)+'</button>':'')+'</div></div><div class="record-facts"><span>'+formatNumber(r.area||0)+' ha</span><span>'+(r.coordenadas?'GPS: '+escapeHtml(r.coordenadas):'Sem GPS')+'</span></div></div></article>').join(''):emptyState('Nenhum talhão cadastrado','Cadastre áreas para ativar o mapa agrícola.');
      list.querySelectorAll('.js-edit').forEach(b=>b.onclick=()=>openTalhao(b.dataset.id));
      list.querySelectorAll('.js-delete').forEach(b=>b.onclick=async()=>{if(confirm('Excluir este talhão?')){await DataStore.remove('talhoes',b.dataset.id);toast('Talhão excluído.','success');renderTalhoes(el)}});
    };
    paint(rows);
    el.querySelector('#q').oninput=e=>{const q=e.target.value.toLowerCase();paint(rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q))))};
    el.querySelector('#map-btn').onclick=()=>openFarmMap(rows);
    el.querySelector('#add-talhao')?.addEventListener('click',()=>openTalhao());
  }

  async function openTalhao(id){
    const e=id?await DataStore.get('talhoes',id):null;
    const body='<form id="f" class="form-grid">'
      +formField('Nome do talhão','nome',e?.nome||'',{required:true,placeholder:'Ex: Talhão 01 - Sede'})
      +formField('Área (ha)','area',e?.area||'',{type:'number',step:'any',required:true,placeholder:'75.5'})
      +formField('Cultura atual','culturaAtual',e?.culturaAtual||'',{placeholder:'Soja'})
      +formField('Tipo de solo','tipoSolo',e?.tipoSolo||'',{placeholder:'Latossolo Vermelho'})
      +formField('Coordenadas','coordenadas',e?.coordenadas||'',{placeholder:'-11.8645, -55.5089'})
      +formField('Status','status',e?.status||'Ativo',{options:['Ativo','Em descanso','Em manutenção','Inativo']})
      +formField('Observações','observacoes',e?.observacoes||'',{type:'textarea',placeholder:'Detalhes do talhão...'})+'</form>';
    const m=modal({title:id?'Editar Talhão':'Novo Talhão',subtitle:'Cadastro georreferenciado',body,actions:'<button class="btn btn-secondary js-modal-close">Cancelar</button><button class="btn btn-primary" id="save">'+icon('check',17)+' Salvar</button>'});
    m.element.querySelector('#save').onclick=async()=>{const f=m.element.querySelector('#f');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f).entries());d.area=Number(d.area)||0;await DataStore.save('talhoes',d,id);await DataStore.log('talhoes',id?'editar':'criar',d.nome,id||'');toast('Talhão salvo.','success');m.close();location.hash='#talhoes'};
  }

  async function renderEstoque(el){
    const rows=await DataStore.list('estoqueGeral',{sortField:'nome',sortDir:'asc'});
    const value=rows.reduce((a,r)=>a+Number(r.quantidade||0)*Number(r.precoUnitario||0),0);
    el.innerHTML='<div class="section-head"><div><span class="eyebrow">ALMOXARIFADO</span><h2>Estoque geral</h2><p>Insumos, peças, sementes e materiais.</p></div>'+ (isAdmin()?'<button class="btn btn-primary" id="add-stock">'+icon('plus',17)+' Novo Item</button>':'')+'</div>'
      +'<div class="stat-grid">'+statCard('Patrimônio',formatBRL(value),'valor acumulado','warehouse','green')+statCard('Itens',rows.length,'SKUs cadastrados','package','slate')+statCard('Reposição',rows.filter(r=>Number(r.estoqueMinimo||0)>0&&Number(r.quantidade||0)<=Number(r.estoqueMinimo)).length,'abaixo do mínimo','alert','amber')+'</div>'
      +'<div class="panel-card"><div class="toolbar"><div class="search-box">'+icon('search',17)+'<input id="q" placeholder="Buscar item, marca..."></div></div><div id="list" class="record-list"></div></div>';
    const list=el.querySelector('#list');
    const paint=data=>{list.innerHTML=data.length?data.map(r=>'<article class="record-card"><div class="record-main"><div class="record-title"><div><span class="eyebrow">'+escapeHtml(r.tipo||'INSUMO')+'</span><h3>'+escapeHtml(r.nome||'Item')+'</h3><p>'+escapeHtml(r.categoria||'Sem categoria')+' · '+escapeHtml(r.localizacao||'Local não informado')+'</p></div><div class="record-actions">'+(Number(r.estoqueMinimo||0)>0&&Number(r.quantidade||0)<=Number(r.estoqueMinimo)?statusPill('Atenção: estoque baixo'):'')+(isAdmin()?'<button class="icon-btn js-edit" data-id="'+r.id+'">'+icon('pencil',17)+'</button><button class="icon-btn danger js-delete" data-id="'+r.id+'">'+icon('trash',17)+'</button>':'')+'</div></div><div class="record-facts"><span>'+formatNumber(r.quantidade,2)+' '+escapeHtml(r.unidadeMedida||'un')+'</span><span>'+formatBRL(r.precoUnitario)+'/un</span><span>Mín: '+formatNumber(r.estoqueMinimo,2)+'</span></div></div></article>').join(''):emptyState('Nenhum item encontrado','Cadastre seu primeiro item de almoxarifado.');
      list.querySelectorAll('.js-edit').forEach(b=>b.onclick=()=>openEstoque(b.dataset.id));
      list.querySelectorAll('.js-delete').forEach(b=>b.onclick=async()=>{if(confirm('Excluir este item?')){await DataStore.remove('estoqueGeral',b.dataset.id);toast('Item excluído.','success');renderEstoque(el)}});
    };
    paint(rows);
    el.querySelector('#q').oninput=e=>{const q=e.target.value.toLowerCase();paint(rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q))))};
    el.querySelector('#add-stock')?.addEventListener('click',()=>openEstoque());
  }

  async function openEstoque(id){
    const e=id?await DataStore.get('estoqueGeral',id):null;
    const body='<form id="f" class="form-grid">'+formField('Nome do item','nome',e?.nome||'',{required:true,placeholder:'Ex: Ureia Protegida'})+formField('Tipo','tipo',e?.tipo||'Insumo',{options:['Defensivo','Fertilizante','Semente','Peça','Combustível','Insumo','Outro']})+formField('Categoria','categoria',e?.categoria||'',{placeholder:'Nutrição'})+formField('Quantidade','quantidade',e?.quantidade||'',{type:'number',step:'any',required:true,placeholder:'50'})+formField('Unidade','unidadeMedida',e?.unidadeMedida||'L',{options:['L','kg','ton','sc','un','cx']})+formField('Preço unitário (R$)','precoUnitario',e?.precoUnitario||'',{type:'number',step:'any',placeholder:'145,00'})+formField('Estoque mínimo','estoqueMinimo',e?.estoqueMinimo||'',{type:'number',step:'any',placeholder:'10'})+formField('Fabricante / marca','marca',e?.marca||'',{placeholder:'Bayer / Syngenta'})+formField('Localização','localizacao',e?.localizacao||'',{placeholder:'Barracão 02'})+'</form>';
    const m=modal({title:id?'Editar item':'Novo item de estoque',subtitle:'Almoxarifado',body,actions:'<button class="btn btn-secondary js-modal-close">Cancelar</button><button class="btn btn-primary" id="save">'+icon('check',17)+' Salvar</button>'});
    m.element.querySelector('#save').onclick=async()=>{const f=m.element.querySelector('#f');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f).entries());['quantidade','precoUnitario','estoqueMinimo'].forEach(k=>d[k]=Number(d[k])||0);await DataStore.save('estoqueGeral',d,id);toast('Item salvo.','success');m.close();location.hash='#estoque'};
  }

  async function renderMaquinas(el){
    const rows=await DataStore.list('inventario',{sortField:'marca',sortDir:'asc'});
    el.innerHTML='<div class="section-head"><div><span class="eyebrow">FROTA</span><h2>Inventário de Máquinas</h2><p>Tratores, colheitadeiras, pulverizadores e implementos.</p></div>'+ (isAdmin()?'<button class="btn btn-primary" id="add-machine">'+icon('plus',17)+' Nova máquina</button>':'')+'</div><div class="stat-grid">'+statCard('Máquinas',rows.length,'itens no inventário','tractor','green')+statCard('Ativas',rows.filter(r=>String(r.status||'Ativa').toLowerCase().includes('ativa')).length,'em operação','check','blue')+statCard('Manutenção',rows.filter(r=>String(r.status||'').toLowerCase().includes('manut')).length,'fora de operação','wrench','amber')+'</div><div class="panel-card"><div class="toolbar"><div class="search-box">'+icon('search',17)+'<input id="q" placeholder="Buscar marca, modelo..."></div></div><div id="list" class="record-list"></div></div>';
    const list=el.querySelector('#list');
    const paint=data=>{list.innerHTML=data.length?data.map(r=>'<article class="record-card"><div class="record-main"><div class="record-title"><div><span class="eyebrow">'+escapeHtml(r.tipo||'MÁQUINA')+' · '+escapeHtml(r.marca||'')+'</span><h3>'+escapeHtml(r.modelo||'Equipamento')+'</h3><p>'+escapeHtml(r.ano||'Ano --')+' · '+escapeHtml(r.patrimonio||r.numeroSerie||'Sem patrimônio')+'</p></div><div class="record-actions">'+statusPill(r.status||'Ativa')+(isAdmin()?'<button class="icon-btn js-edit" data-id="'+r.id+'">'+icon('pencil',17)+'</button><button class="icon-btn danger js-delete" data-id="'+r.id+'">'+icon('trash',17)+'</button>':'')+'</div></div><div class="record-facts"><span>Horímetro: '+escapeHtml(r.horimetro||'--')+'</span><span>Combustível: '+escapeHtml(r.combustivel||'Diesel')+'</span></div></div></article>').join(''):emptyState('Nenhuma máquina cadastrada','Cadastre a frota para acompanhar status e manutenção.');
      list.querySelectorAll('.js-edit').forEach(b=>b.onclick=()=>openMachine(b.dataset.id));
      list.querySelectorAll('.js-delete').forEach(b=>b.onclick=async()=>{if(confirm('Excluir esta máquina?')){await DataStore.remove('inventario',b.dataset.id);toast('Máquina excluída.','success');renderMaquinas(el)}});
    };
    paint(rows);
    el.querySelector('#q').oninput=e=>{const q=e.target.value.toLowerCase();paint(rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q))))};
    el.querySelector('#add-machine')?.addEventListener('click',()=>openMachine());
  }

  async function openMachine(id){
    const e=id?await DataStore.get('inventario',id):null;
    const body='<form id="f" class="form-grid">'+formField('Tipo','tipo',e?.tipo||'Trator',{options:['Trator','Colheitadeira','Pulverizador','Plantadeira','Implemento','Caminhão','Outro']})+formField('Marca','marca',e?.marca||'',{required:true,placeholder:'John Deere'})+formField('Modelo','modelo',e?.modelo||'',{required:true,placeholder:'6110J'})+formField('Ano','ano',e?.ano||'',{type:'number',placeholder:'2026'})+formField('Patrimônio','patrimonio',e?.patrimonio||'',{placeholder:'FROTA-001'})+formField('Horímetro / KM','horimetro',e?.horimetro||'',{placeholder:'1850 h'})+formField('Combustível','combustivel',e?.combustivel||'Diesel',{options:['Diesel','Etanol','Gasolina','Elétrico','Outro']})+formField('Status','status',e?.status||'Ativa',{options:['Ativa','Em manutenção','Inativa','Baixada']})+'</form>';
    const m=modal({title:id?'Editar máquina':'Nova máquina',subtitle:'Inventário de frota',body,actions:'<button class="btn btn-secondary js-modal-close">Cancelar</button><button class="btn btn-primary" id="save">'+icon('check',17)+' Salvar</button>'});
    m.element.querySelector('#save').onclick=async()=>{const f=m.element.querySelector('#f');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f).entries());d.ano=Number(d.ano)||0;await DataStore.save('inventario',d,id);toast('Máquina salva.','success');m.close();location.hash='#maquinas'};
  }

  async function renderAuditoria(el){
    const rows=await DataStore.list('auditoria_logs',{sortField:'dataHora',sortDir:'desc'});
    el.innerHTML='<div class="section-head"><div><span class="eyebrow">RASTREABILIDADE</span><h2>Auditoria & Backup</h2><p>Histórico de alterações e exportação dos dados.</p></div>'+ (isAdmin()?'<button class="btn btn-secondary" id="backup">'+icon('download',17)+' Exportar backup</button>':'')+'</div><div class="panel-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Módulo</th><th>Ação</th><th>Usuário</th><th>Detalhes</th></tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr><td>'+formatDate(r.dataHora)+'</td><td>'+escapeHtml(r.modulo||'')+'</td><td>'+escapeHtml(r.tipoAcao||'')+'</td><td>'+escapeHtml(r.usuarioNome||'')+'</td><td>'+escapeHtml(r.detalhes||'')+'</td></tr>').join(''):'<tr><td colspan="5">Nenhum registro de auditoria.</td></tr>')+'</tbody></table></div></div>';
    el.querySelector('#backup')?.addEventListener('click',async()=>{const json=await DataStore.backup();const blob=new Blob([json],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='w3labs-backup-'+todayISO()+'.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exportado.','success')});
  }
}
