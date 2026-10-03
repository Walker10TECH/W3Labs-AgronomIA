
const appRoot=document.getElementById('app');
const appLoading=document.getElementById('app-loading');

async function startW3LabsApp(){
  await bootstrapSession();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
  appLoading.hidden=true; appRoot.hidden=false;

const appRoutes={
  '#login':()=>renderLogin(appRoot),
  '#dashboard':()=>renderDashboard(appRoot),
  '#plantios':()=>renderModule(appRoot,'plantios'),
  '#colheitas':()=>renderModule(appRoot,'colheitas'),
  '#pulverizacao':()=>renderModule(appRoot,'pulverizacao'),
  '#revisoes':()=>renderModule(appRoot,'revisoes'),
  '#diesel':()=>renderModule(appRoot,'diesel'),
  '#estoque':()=>renderManager(appRoot,'estoque'),
  '#talhoes':()=>renderManager(appRoot,'talhoes'),
  '#maquinas':()=>renderManager(appRoot,'maquinas'),
  '#gerenciador':()=>renderManager(appRoot,'talhoes'),
  '#pluviometro':()=>renderRain(appRoot),
  '#andamento':()=>renderProgress(appRoot),
  '#manuais':()=>renderManuals(appRoot)
};

function currentRoute(){return location.hash || (authUser?'#dashboard':'#login');}
async function render(){
  const requested=currentRoute();
  if(!authUser && requested!=='#login'){location.hash='#login';return renderLogin(appRoot);}
  if(authUser && requested==='#login'){location.hash='#dashboard';return renderDashboard(appRoot);}
  try{await (appRoutes[requested]||appRoutes[authUser?'#dashboard':'#login'])();if(authUser&&requested!=='#login')mountChatbot(document.body,{userName:authUser.displayName||'Produtor'});}catch(err){console.error(err);appRoot.innerHTML=`<div class="fatal-error"><div>${err.message||'Erro inesperado.'}</div><a class="btn btn-primary" href="#dashboard">Voltar ao painel</a></div>`;}
}
window.addEventListener('hashchange',()=>{document.querySelector('#chatbot')?.remove();render();});
if(!isFirebaseReady)console.info('[W3Labs] Firebase não configurado: modo local ativo.');
render();
}
startW3LabsApp().catch(err=>{console.error(err);appLoading.hidden=true;appRoot.hidden=false;appRoot.innerHTML=`<div class="fatal-error"><div>${err.message||'Erro inesperado.'}</div></div>`;});