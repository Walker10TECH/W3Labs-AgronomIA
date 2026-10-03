export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.GROQ_API_KEY)return res.status(503).json({error:'GROQ_API_KEY não configurada no servidor.'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${process.env.GROQ_API_KEY}`},body:JSON.stringify({model:body.model||'llama-3.3-70b-versatile',temperature:body.temperature??0.2,messages:body.messages||[]})});
    const text=await response.text();res.status(response.status).setHeader('content-type','application/json').send(text);
  }catch(e){res.status(500).json({error:e.message||'AI proxy error'});}
}
