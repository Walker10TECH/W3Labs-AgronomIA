import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root=process.cwd();
const envPath=path.join(root,'.env');
const env={};
if(fs.existsSync(envPath)){
  for(const line of fs.readFileSync(envPath,'utf8').split(/\r?\n/)){
    const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if(m) env[m[1]]=m[2].replace(/^[\"\']|[\"\']$/g,'');
  }
}

const publicKeys=['FIREBASE_API_KEY','FIREBASE_AUTH_DOMAIN','FIREBASE_PROJECT_ID','FIREBASE_STORAGE_BUCKET','FIREBASE_MESSAGING_SENDER_ID','FIREBASE_APP_ID','FIREBASE_MEASUREMENT_ID','AI_PROXY_URL'];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>2_000_000){req.destroy();reject(new Error('Body too large'));}});req.on('end',()=>resolve(body));req.on('error',reject);});}
const server=http.createServer(async(req,res)=>{
  const pathname=url.parse(req.url).pathname;
  if(pathname==='/runtime-config.js'){
    const out={};for(const k of publicKeys)out[k]=env[k]||'';out.AI_PROXY_URL=env.AI_PROXY_URL||'/api/groq';
    res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'});res.end(`window.W3LABS_ENV=${JSON.stringify(out)};`);return;
  }
  if(pathname==='/api/health'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true,app:'W3Labs AgronomIA',firebaseConfigured:Boolean(env.FIREBASE_API_KEY&&env.FIREBASE_PROJECT_ID),aiProxyConfigured:Boolean(env.GROQ_API_KEY)}));return;}
  if(pathname==='/api/groq'){
    if(req.method!=='POST'){res.writeHead(405,{'content-type':'application/json'});res.end(JSON.stringify({error:'Method not allowed'}));return;}
    if(!env.GROQ_API_KEY){res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'GROQ_API_KEY não configurada no servidor.'}));return;}
    try{
      const body=JSON.parse(await readBody(req)||'{}');
      const upstream=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${env.GROQ_API_KEY}`},body:JSON.stringify({model:body.model||env.GROQ_MODEL||'llama-3.3-70b-versatile',temperature:body.temperature??0.2,messages:body.messages||[]})});
      const text=await upstream.text();res.writeHead(upstream.status,{'content-type':'application/json'});res.end(text);
    }catch(e){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:e.message||'AI proxy error'}));}
    return;
  }
  let filePath=path.normalize(path.join(root,pathname==='/'?'index.html':pathname));
  if(!filePath.startsWith(root)){res.writeHead(403);return res.end('Forbidden');}
  try{const data=await fs.promises.readFile(filePath);res.writeHead(200,{'content-type':mime[path.extname(filePath)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(process.env.PORT||4173,'127.0.0.1',()=>console.log(`W3Labs AgronomIA em http://127.0.0.1:${process.env.PORT||4173}`));