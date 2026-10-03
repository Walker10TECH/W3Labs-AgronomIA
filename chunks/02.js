/* W3Labs AgronomIA — runtime chunk 02. */

/* ===== services/dataService.js ===== */

const DB_KEY = 'w3labs-agro-local-v1';

const seed = {
  talhoes: [
    { id: 'talhao-demo-01', nome: 'Talhão 01 - Sede', area: 55.4, culturaAtual: 'Soja', tipoSolo: 'Latossolo Vermelho', coordenadas: '-11.864500, -55.508900', status: 'Ativo', observacoes: 'Talhão demonstrativo.', criadoEm: new Date().toISOString() },
    { id: 'talhao-demo-02', nome: 'Talhão 02', area: 72.0, culturaAtual: 'Milho', tipoSolo: 'Argiloso', coordenadas: '-11.870500, -55.501200', status: 'Ativo', observacoes: '', criadoEm: new Date().toISOString() }
  ],
  plantios: [
    { id: 'plantio-demo-01', talhao: 'Talhão 01 - Sede', cultura: 'Soja', variedade: 'BMX Potência', areaHa: 55.4, populacaoPlantasHa: 260000, espacamentoCm: 45, safra: '2026/2027', dataPlantio: '2026-09-18', status: 'Concluído', observacoes: 'Plantio demonstrativo.' }
  ],
  colheitas: [], pulverizacoes: [], revisoes: [], diesel: [], estoqueGeral: [], pluviometro: [], porcentagens: [], inventario: [], manuais: [], manualCategorias: [
    { id: 'cat-stara', nome: 'Stara', imagem: '', ordem: 1 },
    { id: 'cat-nh', nome: 'New Holland', imagem: '', ordem: 2 },
    { id: 'cat-jd', nome: 'John Deere', imagem: '', ordem: 3 },
    { id: 'cat-case', nome: 'Case IH', imagem: '', ordem: 4 },
    { id: 'cat-mf', nome: 'Massey Ferguson', imagem: '', ordem: 5 },
    { id: 'cat-valtra', nome: 'Valtra', imagem: '', ordem: 6 },
    { id: 'cat-jacto', nome: 'Jacto', imagem: '', ordem: 7 }
  ],
  auditoria_logs: []
};

const localEmptyState = () => ({ ...structuredClone(seed) });

function loadLocal() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = localEmptyState();
      localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return localEmptyState();
  }
}

function saveLocal(state) {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

function normalizeValue(value) {
  if (value?.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function sanitizeDoc(data) {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) out[key] = normalizeValue(value);
  return out;
}

const DataStore = {
  async list(collectionName, { sortField, sortDir = 'desc', limit } = {}) {
    const uid = globalThis.W3LABS_EFFECTIVE_UID || authUser?.uid || null;
    if (isFirebaseReady && uid) {
      const f = await firestoreApi();
      const ref = f.collection(f.db, 'users', uid, collectionName);
      let q = ref;
      if (sortField) q = f.query(ref, f.orderBy(sortField, sortDir));
      const snap = await f.getDocs(q);
      let rows = snap.docs.map(d => ({ id: d.id, ...sanitizeDoc(d.data()) }));
      if (limit) rows = rows.slice(0, limit);
      return rows;
    }
    const state = loadLocal();
    let rows = [...(state[collectionName] || [])];
    if (sortField) rows.sort((a,b) => String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? ''), 'pt-BR', {numeric:true}) * (sortDir === 'desc' ? -1 : 1));
    return limit ? rows.slice(0, limit) : rows;
  },

  async get(collectionName, id) {
    const rows = await DataStore.list(collectionName);
    return rows.find(r => r.id === id) || null;
  },

  async save(collectionName, data, id = null) {
    const uid = globalThis.W3LABS_EFFECTIVE_UID || authUser?.uid || null;
    const payload = sanitizeDoc({ ...data, atualizadoEm: new Date().toISOString() });
    if (!payload.criadoEm) payload.criadoEm = new Date().toISOString();
    if (isFirebaseReady && uid) {
      const f = await firestoreApi();
      const docRef = id ? f.doc(f.db, 'users', uid, collectionName, id) : f.doc(f.collection(f.db, 'users', uid, collectionName));
      await f.setDoc(docRef, payload, { merge: true });
      return { id: docRef.id, ...payload };
    }
    const state = loadLocal();
    const rowId = id || `${collectionName}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const rows = state[collectionName] || [];
    const index = rows.findIndex(r => r.id === rowId);
    const row = { ...payload, id: rowId };
    if (index >= 0) rows[index] = row; else rows.push(row);
    state[collectionName] = rows;
    saveLocal(state);
    return row;
  },

  async remove(collectionName, id) {
    const uid = globalThis.W3LABS_EFFECTIVE_UID || authUser?.uid || null;
    if (isFirebaseReady && uid) {
      const f = await firestoreApi();
      await f.deleteDoc(f.doc(f.db, 'users', uid, collectionName, id));
      return true;
    }
    const state = loadLocal();
    state[collectionName] = (state[collectionName] || []).filter(row => row.id !== id);
    saveLocal(state);
    return true;
  },

  async backup() {
    const state = {};
    for (const name of Object.keys(seed)) state[name] = await DataStore.list(name);
    return JSON.stringify(state, null, 2);
  },

  async restore(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    for (const [collectionName, rows] of Object.entries(data)) {
      for (const row of (Array.isArray(rows) ? rows : [])) await DataStore.save(collectionName, row, row.id);
    }
  },

  async log(modulo, tipoAcao, detalhes, documentoId = '') {
    return DataStore.save('auditoria_logs', { modulo, tipoAcao, documentoId, usuarioUid: authUser?.uid || 'local', usuarioNome: authUser?.displayName || 'Usuário', detalhes, dataHora: new Date().toISOString() });
  },

  resetLocal() {
    localStorage.setItem(DB_KEY, JSON.stringify(localEmptyState()));
  }
};

function formatBRL(value) { return Number(value || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
function formatNumber(value, digits=1) { return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
function formatDate(value) {
  if (!value) return '--/--/----';
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? '--/--/----' : date.toLocaleDateString('pt-BR');
}
function todayISO() { return new Date().toISOString().slice(0,10); }

/* ===== services/locationService.js ===== */
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = { 'Accept-Language':'pt-BR', 'User-Agent':'W3Labs-AgronomIA/1.0 (Web App)' };

function parseCoordinates(value) {
  const m = String(value || '').trim().match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const lat = Number(m[1]), lon = Number(m[2]);
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}
function formatCoordinates(lat, lon, decimals=6) { return `${Number(lat).toFixed(decimals)}, ${Number(lon).toFixed(decimals)}`; }
async function getCurrentPosition() {
  if (!navigator.geolocation) throw new Error('Geolocalização indisponível no navegador.');
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    p => resolve({ latitude:p.coords.latitude, longitude:p.coords.longitude, accuracy:p.coords.accuracy }),
    e => reject(new Error(e.message || 'Permissão de localização negada.')),
    { enableHighAccuracy:true, timeout:12000, maximumAge:120000 }
  ));
}
async function reverseGeocodeOSM(lat, lon) {
  const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18`, { headers:NOMINATIM_HEADERS });
  if (!res.ok) throw new Error('Falha na geocodificação reversa.');
  const d = await res.json();
  return { city:d.address?.city || d.address?.town || d.address?.municipality || d.address?.village || '', state:d.address?.state || '', country:d.address?.country || '', displayName:d.display_name || '' };
}
async function searchLocationOSM(query) {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}&countrycodes=br`, { headers:NOMINATIM_HEADERS });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map(d => ({ name:d.display_name, lat:Number(d.lat), lon:Number(d.lon), displayName:d.display_name, type:d.type }));
}

/* ===== services/weatherService.js ===== */
const WMO = {
  0:['Céu limpo','☀️'],1:['Predomínio de sol','🌤️'],2:['Parcialmente nublado','⛅'],3:['Nublado','☁️'],45:['Neblina','🌫️'],48:['Neblina','🌫️'],51:['Garoa fraca','🌦️'],53:['Garoa moderada','🌦️'],55:['Garoa densa','🌧️'],61:['Chuva leve','🌧️'],63:['Chuva moderada','🌧️'],65:['Chuva forte','⛈️'],80:['Pancadas de chuva','🌦️'],81:['Pancadas fortes','🌧️'],82:['Chuva torrencial','⛈️'],95:['Tempestade','⚡'],96:['Granizo','⛈️'],99:['Tempestade severa','⛈️']
};
function weatherCode(code) { return WMO[code] || ['Condição não mapeada','🌤️']; }
async function fetchOpenMeteoWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
  const r = await fetch(url); if (!r.ok) throw new Error('Open-Meteo indisponível.'); const d=await r.json();
  const [desc, icon] = weatherCode(d.current?.weather_code);
  return { temp:d.current?.temperature_2m ?? '--', humidity:d.current?.relative_humidity_2m ?? '--', rain:d.current?.precipitation ?? '--', windSpeed:d.current?.wind_speed_10m ?? '--', desc, icon };
}
async function fetchRainHistory({lat, lon, pastDays=7}) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,weather_code,temperature_2m_max,temperature_2m_min&past_days=${pastDays}&forecast_days=1&timezone=auto`;
  const r = await fetch(url); if (!r.ok) throw new Error('Não foi possível obter histórico de chuvas.'); const d=await r.json();
  return (d.daily?.time || []).map((date, i) => {
    const [desc,icon]=weatherCode(d.daily.weather_code?.[i]);
    return { date, mm:Number(d.daily.precipitation_sum?.[i] || 0), tempMax:Number(d.daily.temperature_2m_max?.[i] || 0), tempMin:Number(d.daily.temperature_2m_min?.[i] || 0), desc, icon, weekday:new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long'}), isToday:date===new Date().toISOString().slice(0,10) };
  });
}
async function searchWeatherLocation(q) { return searchLocationOSM(q); }
