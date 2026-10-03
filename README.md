# W3Labs AgronomIA 1.0.0

Reconstrução completa da aplicação W3Labs Agro/AgronomIA usando HTML5 semântico, CSS3 e JavaScript ES6+ **sem React, React Native, Expo ou Tailwind**.

## Módulos

- Login, cadastro e recuperação de senha
- Dashboard operacional
- Plantio
- Colheita
- Pulverização
- Revisões e manutenção
- Controle de diesel
- Almoxarifado e estoque
- Inventário de máquinas
- Talhões e georreferenciamento
- Pluviômetro e histórico de chuva
- Andamento da safra
- Biblioteca de manuais e PDFs
- Propriedade e equipe
- Auditoria/backup
- AgronomIA com contexto real dos dados

## Execução local

1. Copie `.env.example` para `.env` e preencha as variáveis do Firebase.
2. Para IA, configure `GROQ_API_KEY` **somente no servidor**.
3. Execute `npm start`.
4. Abra `http://127.0.0.1:4173`.

Sem Firebase configurado, a aplicação funciona em modo local usando `localStorage`, permitindo validar os fluxos e a interface antes da integração.

## Firebase

O `firebaseConfig.js` usa o SDK oficial do Firebase via CDN e aceita valores injetados por `runtime-config.js`. O servidor local injeta as variáveis públicas do `.env`; a chave Groq não é enviada ao browser.

## Vercel

Use o diretório do projeto como raiz. Configure as variáveis `FIREBASE_*` e `GROQ_API_KEY` no ambiente da Vercel. A função `api/groq.js` funciona como proxy server-side para não expor a chave da Groq.

## Segurança

O `.env` real está ignorado pelo Git. O arquivo entregue no projeto contém apenas placeholders. Não publique chaves privadas, tokens ou senhas no repositório.

## Arquitetura

A aplicação distribuída carrega os módulos JavaScript por `chunks/01.js ... chunks/10.js` e `chunks/entry.js`. Os arquivos-fonte modulares da reconstrução acompanham o ZIP completo entregue junto com esta versão.
