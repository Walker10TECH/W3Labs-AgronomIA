/* W3Labs AgronomIA — runtime chunk 03. */

/* ===== components/icons.js ===== */
const PATHS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
  arrowLeft:'<path d="m15 18-6-6 6-6"/><path d="M9 12h11"/>',
  arrowRight:'<path d="M9 18l6-6-6-6"/><path d="M4 12h11"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>',
  chevronRight:'<path d="m9 6 6 6-6 6"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  pencil:'<path d="m4 16 10-10 4 4L8 20H4z"/><path d="m13 7 3 3"/>',
  trash:'<path d="M5 7h14M10 11v6M14 11v6"/><path d="M8 7l1-3h6l1 3M7 7l1 14h8l1-14"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-1.9 1.9-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.65V22h-2.7v-.1A1.8 1.8 0 0 0 11 20.24a1.8 1.8 0 0 0-2 .36l-.06.06-1.9-1.9.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 5.8 15H5.5v-2.7h.3a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-2l-.06-.06 1.9-1.9.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 12.1 6V5.5h2.7V6a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.06-.06 1.9 1.9-.06.06a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 20.9 12h.3v2.7h-.3a1.8 1.8 0 0 0-1.5.3z"/>',
  logout:'<path d="M10 4H5v16h5"/><path d="M13 8l4 4-4 4M17 12H8"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M16 3.5a3.5 3.5 0 0 1 0 7M17 15h1a4 4 0 0 1 4 4v2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  userCheck:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="m16 11 2 2 4-4"/>',
  building:'<path d="M4 21V5h10v16M14 9h6v12M8 9h2M8 13h2M8 17h2M17 13h1M17 17h1"/>',
  shield:'<path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeOff:'<path d="M3 3l18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-3 3.4M6.2 6.9C3.4 8.8 2 12 2 12s3.5 6 10 6c1.1 0 2.1-.2 3-.5"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 6l2 2M18 4l2 2"/>',
  cloud:'<path d="M6 19a5 5 0 1 1 1-9.9A7 7 0 0 1 20 11.5 4 4 0 0 1 19 19z"/>',
  cloudRain:'<path d="M6 16a5 5 0 1 1 1-9.9A7 7 0 0 1 20 8.5 4 4 0 0 1 19 16z"/><path d="M8 19v2M12 18v3M16 19v2"/>',
  droplets:'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  wind:'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-5 2 2-5z"/>',
  spray:'<path d="M5 11h11l3 2v7H5z"/><path d="M5 15H3M5 18H3M16 11V8M13 8V5M19 8l2-2"/>',
  sprout:'<path d="M12 21V9"/><path d="M12 11C8 11 6 8 6 4c4 0 7 2 6 7zM12 14c4 0 6-3 6-6-4 0-6 2-6 6z"/>',
  wheat:'<path d="M12 21V4M12 9c-3 0-5-2-5-5 3 0 5 2 5 5zM12 13c3 0 5-2 5-5-3 0-5 2-5 5zM12 17c-3 0-5-2-5-5 3 0 5 2 5 5z"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  fuel:'<path d="M4 20h10V5H4zM14 8h2l3 3v5h-2V9"/><path d="M7 8h4M18 16a1.5 1.5 0 1 1-3 0"/>',
  warehouse:'<path d="M3 21V9l9-5 9 5v12M6 21v-8h12v8M9 21v-5h6v5"/>',
  percent:'<path d="M7 17 17 7"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
  sliders:'<path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  book:'<path d="M4 5a3 3 0 0 1 3-3h11v17H7a3 3 0 0 0-3 3z"/><path d="M7 2v17"/>',
  file:'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m4 18 5-5 3 3 2-2 6 5"/>',
  bot:'<rect x="5" y="6" width="14" height="13" rx="3"/><path d="M12 2v4M8 11h.01M16 11h.01M9 15h6"/>',
  send:'<path d="m3 4 18 8-18 8 4-8z"/><path d="M7 12h14"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-4L3 10M4 4v6h6M4 13a8 8 0 0 0 14 4l3-3M20 20v-6h-6"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  external:'<path d="M14 4h6v6M20 4 11 13"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 12 4-4M12 21h.01"/>',
  tractor:'<path d="M3 16h10l2-7h4l2 7h-3M3 16v3h16"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M13 9H9V5h3l2 4z"/>',
  package:'<path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10"/>',
  alert:'<path d="M12 3 2.5 20h19z"/><path d="M12 9v5M12 17h.01"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};
function icon(name, size=20, className='') { const path=PATHS[name] || PATHS.info; return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`; }

/* ===== components/ui.js ===== */
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }
function logoMarkup(size='md') { return `<div class="brand"><img src="assets/logo-mark.svg" alt="" class="brand-svg ${size==='lg'?'brand-svg-lg':''}"><div><strong>W3Labs</strong><span>AgronomIA</span></div></div>`; }
function toast(message, type='info') {
  const root=document.getElementById('toast-root') || document.body;
  let el=document.createElement('div'); el.className=`toast toast-${type}`; el.innerHTML=`${icon(type==='error'?'alert':type==='success'?'check':'info',18)}<span>${escapeHtml(message)}</span>`;
  (document.getElementById('toast-root') || root).appendChild(el); requestAnimationFrame(()=>el.classList.add('is-visible')); setTimeout(()=>{el.classList.remove('is-visible');setTimeout(()=>el.remove(),220)},3200);
}
function modal({title, subtitle='', body='', actions='', wide=false, className=''}) {
  const wrap=document.createElement('div'); wrap.className='modal-backdrop';
  wrap.innerHTML=`<div class="modal ${wide?'modal-wide':''} ${className}" role="dialog" aria-modal="true"><header class="modal-header"><div><h3>${title}</h3><p>${subtitle}</p></div><button class="icon-btn js-modal-close" aria-label="Fechar">${icon('x')}</button></header><div class="modal-body">${body}</div>${actions?`<footer class="modal-footer">${actions}</footer>`:''}</div>`;
  document.body.appendChild(wrap); requestAnimationFrame(()=>wrap.classList.add('is-visible'));
  const close=()=>{wrap.classList.remove('is-visible');setTimeout(()=>wrap.remove(),180)}; wrap.querySelector('.js-modal-close')?.addEventListener('click', close); wrap.addEventListener('click', e=>{if(e.target===wrap) close()});
  return {element:wrap, close};
}
function formField(label, name, value='', opts={}) {
  const {type='text',placeholder='',required=false,step='',options=null,help='',readonly=false}=opts;
  let control='';
  if (options) control=`<select name="${name}" ${required?'required':''} ${readonly?'disabled':''}><option value="">Selecione...</option>${options.map(o=>`<option value="${escapeHtml(o)}" ${String(o)===String(value)?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`;
  else if (type==='textarea') control=`<textarea name="${name}" placeholder="${escapeHtml(placeholder)}" ${required?'required':''} ${readonly?'readonly':''}>${escapeHtml(value)}</textarea>`;
  else control=`<input name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required?'required':''} ${step?`step="${step}"`:''} ${readonly?'readonly':''}>`;
  return `<label class="field"><span>${label}${required?' <b>*</b>':''}</span>${control}${help?`<small>${help}</small>`:''}</label>`;
}
function statCard(title,value,caption,iconName,tone='green') { return `<article class="stat-card stat-${tone}"><div class="stat-icon">${icon(iconName,20)}</div><div><span>${title}</span><strong>${value}</strong><small>${caption||''}</small></div></article>`; }
function pageHeader(title,subtitle,back=true,action='') { return `<header class="page-header"><div class="page-heading">${back?`<a class="icon-btn js-back" href="#dashboard" title="Voltar">${icon('arrowLeft')}</a>`:''}<div><span class="eyebrow">W3Labs AgronomIA</span><h1>${title}</h1><p>${subtitle}</p></div></div><div class="page-actions">${action}</div></header>`; }
function statusPill(status) { const s=String(status||'Agendada'); const low=s.toLowerCase(); const tone=low.includes('concl')||low.includes('ativo')||low.includes('sincron')?'success':low.includes('andamento')||low.includes('agend')||low.includes('aten')?'warning':low.includes('manut')||low.includes('inativo')?'danger':'neutral'; return `<span class="status-pill status-${tone}">${escapeHtml(s)}</span>`; }
function emptyState(title,description,action='') { return `<div class="empty-state">${icon('package',34)}<h3>${title}</h3><p>${description}</p>${action}</div>`; }
function bindBack() { document.querySelectorAll('.js-back').forEach(el=>el.addEventListener('click',e=>{ if(location.hash==='#dashboard') return; history.back(); })); }

/* ===== services/storageService.js ===== */
async function uploadFile(file, path='documentos') {
  if (!file) throw new Error('Arquivo não informado.');
  if (isFirebaseReady && authUser?.uid) {
    const f=await firestoreApi(); const safe=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`; const ref=f.ref(f.storage, `users/${authUser.uid}/${path}/${safe}`); await f.uploadBytes(ref,file); return { url:await f.getDownloadURL(ref), storagePath:ref.fullPath, name:file.name, sizeBytes:file.size };
  }
  return { url:URL.createObjectURL(file), storagePath:'local-object-url', name:file.name, sizeBytes:file.size };
}
async function deleteFile(url) { if (!isFirebaseReady || !url) return; try { const f=await firestoreApi(); await f.deleteObject(f.ref(f.storage,url)); } catch { /* ignore */ } }
