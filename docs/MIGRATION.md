# Migração W3Labs AgronomIA — React Native → Web Vanilla

## Objetivo
Reconstrução do zero em HTML5 semântico, CSS3 e JavaScript ES6+ modular, mantendo o domínio funcional do projeto e eliminando a dependência de React Native/Expo.

## Mapeamento
| Origem | Reconstrução web |
|---|---|
| W3LabsAgro.jsx | W3LabsAgro.js + app.js |
| LoginScreen.jsx | screens/login.js |
| HomeScreen.jsx | screens/dashboard.js |
| PlantioColheitaScreen.jsx | screens/moduleView.js |
| PulverizacaoScreen.jsx | screens/moduleView.js |
| RevisoesScreen.jsx | screens/moduleView.js |
| DieselScreen.jsx | screens/moduleView.js |
| ManagerScreen.jsx | screens/manager.js |
| ManuaisScreen.jsx | screens/manuals.js |
| PorcentagemPluviometroScreen.jsx | screens/progress.js + screens/rain.js |
| AgronomiaChatbot.jsx | components/chatbot.js |
| CoordinatePickerModal.jsx | components/propertyControl.js / components/map.js |
| FarmMapModal.jsx | components/map.js |
| OpenSourceMap.jsx | components/map.js |
| PdfViewerModal.jsx | components/pdfViewer.js |
| PropertyControlModal.jsx | components/propertyControl.js |
| PropertyContext.jsx | services/sessionService.js + services/dataService.js |
| Firebase/Storage rules | firestore.rules + storage.rules |
| Firebase SDK config | firebaseConfig.js + runtime-config.js |

## Módulos cobertos
Pulverização, Plantio, Colheita, Revisões, Diesel, Estoque, Pluviômetro, % Andamento, Gerenciador, Manuais, autenticação, usuários/membros, propriedade, auditoria, mapa, clima, IA e armazenamento de arquivos.

## Segurança
O arquivo `.env` desta reconstrução contém apenas placeholders. Chaves privadas do pacote original não são copiadas para o novo repositório público. O proxy `api/groq.js` mantém `GROQ_API_KEY` no servidor quando executado no Vercel.

## Compatibilidade
- Execução direta em navegador moderno via `index.html`.
- `npm start` para desenvolvimento com servidor Node mínimo.
- Vercel por `vercel.json` + funções em `api/`.
- PWA por `manifest.webmanifest` + `sw.js`.
- Firebase opcional: sem configuração válida, a aplicação continua em modo local via `localStorage`.
