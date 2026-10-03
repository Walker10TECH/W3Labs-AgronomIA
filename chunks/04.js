/* W3Labs AgronomIA — runtime chunk 04. */

function cfg() { return window.W3LABS_ENV || {}; }

async function contextSnapshot() {
  const names=['talhoes','plantios','colheitas','pulverizacoes','revisoes','diesel','estoqueGeral','pluviometro','inventario','manuais'];
  const out={ propriedade:propertyName() };
  for (const name of names) {
    try { out[name] = (await DataStore.list(name)).slice(0,50); } catch { out[name]=[]; }
  }
  return out;
}

function localAnswer(question, ctx) {
  const q = question.toLowerCase();
  const totalHa=(ctx.talhoes||[]).reduce((a,r)=>a+Number(r.area||0),0);
  const diesel=(ctx.diesel||[]).reduce((a,r)=>a+Number(r.quantidadeLitros||r.litros||0)*(String(r.tipo).toLowerCase().startsWith('entrada')?1:-1),0);
  const rain=(ctx.pluviometro||[]).reduce((a,r)=>a+Number(r.milimetros||0),0);
  if (/chuva|pluvi/.test(q)) return `A propriedade ${ctx.propriedade} possui ${Number(rain).toLocaleString('pt-BR',{maximumFractionDigits:1})} mm somados nos registros locais carregados.`;
  if (/diesel|combust/.test(q)) return `O saldo aproximado de diesel nos registros é ${Number(diesel).toLocaleString('pt-BR',{maximumFractionDigits:1})} L. Confira as entradas e saídas antes de tomar decisões operacionais.`;
  if (/talh|área|hectare|ha/.test(q)) return `Há ${(ctx.talhoes||[]).length} talhões cadastrados, totalizando ${Number(totalHa).toLocaleString('pt-BR',{maximumFractionDigits:1})} ha.`;
  if (/manuten|revis/.test(q)) return `Existem ${(ctx.revisoes||[]).length} registros de manutenção disponíveis. Filtre por máquina/status na tela Revisões.`;
  if (/plantio|safra/.test(q)) return `Há ${(ctx.plantios||[]).length} plantios registrados e ${(ctx.colheitas||[]).length} colheitas registradas.`;
  return 'Estou conectado aos dados carregados da fazenda. Pergunte sobre chuva, diesel, talhões, plantio, colheita, pulverização, estoque, máquinas, revisões ou manuais.';
}

async function askAgronomIA(question, history=[]) {
  const ctx=await contextSnapshot();
  const proxy=cfg().AI_PROXY_URL || '/api/groq';
  const directKey=cfg().GROQ_API_KEY || '';
  const system = `Você é o AgronomIA da W3Labs. Use somente os dados fornecidos no contexto. Não invente registros. Seja objetivo, operacional e responda em português brasileiro. Contexto atual: ${JSON.stringify(ctx)}`;
  const messages=[{role:'system',content:system}, ...history.slice(-8), {role:'user',content:question}];
  try {
    if (proxy) {
      const res=await fetch(proxy,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,model:cfg().GROQ_MODEL||'llama-3.3-70b-versatile',temperature:0.2})});
      if (res.ok) { const d=await res.json(); const content=d.choices?.[0]?.message?.content || d.output || ''; if (content) return content; }
    }
    if (directKey && cfg().ALLOW_BROWSER_AI === 'true') {
      const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${directKey}`},body:JSON.stringify({model:cfg().GROQ_MODEL||'llama-3.3-70b-versatile',temperature:0.2,messages})});
      if (res.ok) return (await res.json()).choices?.[0]?.message?.content || '';
    }
  } catch {}
  return localAnswer(question, ctx);
}

async function fileToBase64(file){
  return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
}
async function extractTextFromPdf(file){
  if(!file) throw new Error('PDF não informado.');
  if(window.pdfjsLib){
    const buffer=await file.arrayBuffer();const pdf=await window.pdfjsLib.getDocument({data:buffer}).promise;let text='';
    for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const c=await page.getTextContent();text+=c.items.map(x=>x.str).join(' ')+'\n';}
    return text;
  }
  return `PDF ${file.name} recebido. Para OCR estruturado, conecte o proxy de IA e inclua pdfjs no deployment.`;
}
async function analyzeManualFile(file){
  const text=file.type==='application/pdf'?await extractTextFromPdf(file):'';
  return {raw:text, result:await askAgronomIA(`Analise este manual técnico e extraia título sugerido, marca/modelo, categoria e pontos operacionais. Conteúdo: ${text.slice(0,12000)}`)};
}
async function analyzeRomaneioDoc(file){
  const text=file.type==='application/pdf'?await extractTextFromPdf(file):'';
  const result=await askAgronomIA(`Leia este romaneio/ticket de pesagem e extraia em JSON: cultura, talhão, área colhida, peso bruto kg, umidade %, impureza %, sacas totais, produtividade sc/ha, safra e observações. Não invente valores. Texto: ${text.slice(0,12000)}`);
  return {text,result};
}
async function analyzePluviometroImage(file){return {result:await askAgronomIA('Analise a foto de um pluviômetro e informe somente o volume em mm e data se estiverem legíveis. Não invente valores.'),fileName:file?.name||''};}
async function analyzeCropHealthImage(file){return {result:await askAgronomIA('Analise uma imagem de lavoura como triagem agronômica. Liste apenas sinais visíveis, hipóteses condicionais e recomendações de inspeção, sem afirmar diagnóstico definitivo.'),fileName:file?.name||''};}
async function analyzeGenericAgroFile(file){return {result:await askAgronomIA(`Classifique este arquivo agropecuário e sugira os campos que podem ser extraídos. Nome: ${file?.name||'arquivo'}`)};}

function normalizeRomaneioData(raw=''){
  const out={};
  const find=(pattern,key)=>{const m=String(raw).match(pattern);if(m)out[key]=m[1].trim()};
  find(/(?:área|area)\s*[:=-]\s*([\d.,]+)/i,'areaColhidaHa');
  find(/(?:peso bruto|peso)\s*[:=-]\s*([\d.,]+)/i,'pesoBrutoKg');
  find(/(?:umidade)\s*[:=-]\s*([\d.,]+)/i,'umidadePerc');
  find(/(?:impureza)\s*[:=-]\s*([\d.,]+)/i,'impurezaPerc');
  find(/(?:sacas)\s*[:=-]\s*([\d.,]+)/i,'sacasTotais');
  find(/(?:produtividade)\s*[:=-]\s*([\d.,]+)/i,'produtividadeScHa');
  return out;
}
async function analyzeRomaneioFile(file){ return analyzeRomaneioDoc(file); }
