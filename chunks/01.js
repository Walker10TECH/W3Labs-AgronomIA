/* W3Labs AgronomIA — runtime chunk 01. */

/* ===== firebaseConfig.js ===== */
const FIREBASE_VERSION = '12.7.0';
const env = window.W3LABS_ENV || {};

const pick = (name) => env[name] || env[`EXPO_PUBLIC_${name}`] || '';

const firebaseConfig = {
  apiKey: pick('FIREBASE_API_KEY'),
  authDomain: pick('FIREBASE_AUTH_DOMAIN'),
  projectId: pick('FIREBASE_PROJECT_ID'),
  storageBucket: pick('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: pick('FIREBASE_MESSAGING_SENDER_ID'),
  appId: pick('FIREBASE_APP_ID'),
  measurementId: pick('FIREBASE_MEASUREMENT_ID')
};

const isFirebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let modulesPromise;
let firebase = {};

async function loadFirebase() {
  if (modulesPromise) return modulesPromise;
  modulesPromise = (async () => {
    if (!isFirebaseReady) return firebase;
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
    const [app, auth, firestore, storage] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
      import(`${base}/firebase-storage.js`)
    ]);
    const instance = app.initializeApp(firebaseConfig);
    firebase = {
      ...app,
      ...auth,
      ...firestore,
      ...storage,
      app: instance,
      auth: auth.getAuth(instance),
      db: firestore.getFirestore(instance),
      storage: storage.getStorage(instance)
    };
    return firebase;
  })();
  return modulesPromise;
}

async function getAuthState() {
  if (!isFirebaseReady) return null;
  const f = await loadFirebase();
  return await new Promise((resolve) => {
    const unsubscribe = f.onAuthStateChanged(f.auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

async function onAuthChange(callback) {
  if (!isFirebaseReady) return () => {};
  const f = await loadFirebase();
  return f.onAuthStateChanged(f.auth, callback);
}

async function signIn(email, password) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  return (await f.signInWithEmailAndPassword(f.auth, email, password)).user;
}

async function createUser(email, password) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  return (await f.createUserWithEmailAndPassword(f.auth, email, password)).user;
}

async function updateUserProfile(profile) {
  if (!isFirebaseReady) return;
  const f = await loadFirebase();
  if (f.auth.currentUser) await f.updateProfile(f.auth.currentUser, profile);
}

async function signOutUser() {
  if (!isFirebaseReady) return;
  const f = await loadFirebase();
  await f.signOut(f.auth);
}

async function resetPassword(email) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  await f.sendPasswordResetEmail(f.auth, email);
}

async function firestoreApi() {
  if (!isFirebaseReady) return null;
  return loadFirebase();
}

const FIRESTORE_COLLECTION_SCHEMAS = {
  pulverizacoes: { name: 'Pulverizações & Calda', sort: ['dataAplicacao', 'desc'] },
  plantios: { name: 'Plantio & Variedades', sort: ['dataPlantio', 'desc'] },
  colheitas: { name: 'Colheita & Produtividade', sort: ['dataColheita', 'desc'] },
  revisoes: { name: 'Revisões & Manutenção de Frota', sort: ['dataRevisao', 'desc'] },
  diesel: { name: 'Controle de Diesel', sort: ['data', 'desc'] },
  estoqueGeral: { name: 'Almoxarifado & Estoque', sort: ['nome', 'asc'] },
  pluviometro: { name: 'Pluviômetro & Chuvas', sort: ['dataMedicao', 'desc'] },
  porcentagens: { name: '% Andamento da Safra', sort: ['dataAtualizacao', 'desc'] },
  talhoes: { name: 'Talhões & Georreferenciamento', sort: ['nome', 'asc'] },
  inventario: { name: 'Inventário & Máquinas', sort: ['marca', 'asc'] },
  manuais: { name: 'Biblioteca de Manuais & PDFs', sort: ['titulo', 'asc'] },
  manualCategorias: { name: 'Marcas e Categorias de Manuais', sort: ['nome', 'asc'] },
  auditoria_logs: { name: 'Logs de Auditoria & Atividades', sort: ['dataHora', 'desc'] }
};

/* ===== services/sessionService.js ===== */

let authUser = null;
let userProfile = null;
let currentRole = 'admin';

const sessionListeners = new Set();

function localAuthKey() { return 'w3labs-local-session'; }

async function bootstrapSession() {
  if (isFirebaseReady) {
    await loadFirebase();
    return new Promise(resolve => {
      onAuthChange(async (user) => {
        authUser = user || null;
        userProfile = user ? await loadProfile(user.uid) : null;
        currentRole = userProfile?.role || 'admin';
        globalThis.W3LABS_EFFECTIVE_UID = userProfile?.adminUid || authUser?.uid || null;
        sessionListeners.forEach(fn => fn(authUser));
        resolve(authUser);
      });
    });
  }
  const raw = localStorage.getItem(localAuthKey());
  authUser = raw ? JSON.parse(raw) : null;
  if (authUser) userProfile = await loadProfile(authUser.uid);
  currentRole = userProfile?.role || 'admin';
  globalThis.W3LABS_EFFECTIVE_UID = userProfile?.adminUid || authUser?.uid || null;
  return authUser;
}

async function loadProfile(uid) {
  const rows = await DataStore.list('users');
  return rows.find(r => r.uid === uid || r.id === uid) || null;
}

async function login(email, password) {
  if (isFirebaseReady) {
    const user = await signIn(email, password);
    authUser = user;
    userProfile = await loadProfile(user.uid);
  } else {
    if (!email || !password) throw new Error('Informe e-mail e senha.');
    const uid = `local-${btoa(email).replace(/=/g,'').slice(0,18)}`;
    const stored = { uid, email, displayName: email.split('@')[0], emailVerified: true };
    localStorage.setItem(localAuthKey(), JSON.stringify(stored));
    authUser = stored;
    userProfile = await loadProfile(uid);
    if (!userProfile) {
      userProfile = await DataStore.save('users', { uid, email, nome: stored.displayName, role: 'admin', propriedadeNome: 'Minha Fazenda (modo local)', codigoPropriedade: 'AGRO-LOCAL', adminUid: uid }, uid);
    }
  }
  currentRole = userProfile?.role || 'admin';
  globalThis.W3LABS_EFFECTIVE_UID = userProfile?.adminUid || authUser?.uid || null;
  return authUser;
}

async function register({ name, email, password, role, farmName, propertyCode }) {
  if (isFirebaseReady) {
    const user = await createUser(email, password);
    await updateUserProfile({ displayName: name });
    const uid = user.uid;
    const normalizedRole = role === 'membro' ? 'member' : 'admin';
    if (normalizedRole === 'admin') {
      const code = (propertyCode || generateLocalPropertyCode()).toUpperCase();
      userProfile = await DataStore.save('users', { uid, email, nome: name, role:'admin', propriedadeNome: farmName || 'Minha Fazenda', codigoPropriedade: code, adminUid:uid }, uid);
      await DataStore.save('propriedades', { id:code, codigo:code, adminUid:uid, adminNome:name, adminEmail:email, propriedadeNome:farmName || 'Minha Fazenda' }, code);
    } else {
      const prop = await findProperty(propertyCode);
      if (!prop) throw new Error('Código da propriedade não encontrado.');
      userProfile = await DataStore.save('users', { uid, email, nome:name, role:'member', propriedadeNome:prop.propriedadeNome, codigoPropriedade:prop.codigo, adminUid:prop.adminUid }, uid);
      await DataStore.save('membros', { uid, email, nome:name, role:'member', status:'ativo', vinculadoEm:new Date().toISOString(), criadoEm:new Date().toISOString() }, uid);
    }
    authUser = user;
  } else {
    const uid = `local-${btoa(email).replace(/=/g,'').slice(0,18)}`;
    const normalizedRole = role === 'membro' ? 'member' : 'admin';
    if (normalizedRole === 'member' && (!propertyCode || !(await findLocalProperty(propertyCode)))) throw new Error('Informe um código de propriedade válido.');
    authUser = { uid, email, displayName:name, emailVerified:true };
    localStorage.setItem(localAuthKey(), JSON.stringify(authUser));
    const code = normalizedRole === 'admin' ? generateLocalPropertyCode() : (propertyCode || 'AGRO-LOCAL');
    userProfile = await DataStore.save('users', { uid, email, nome:name, role:normalizedRole, propriedadeNome:farmName || 'Minha Fazenda', codigoPropriedade:code, adminUid:normalizedRole === 'admin' ? uid : await getAdminUidLocal(code) }, uid);
  }
  currentRole = userProfile?.role || 'admin';
  globalThis.W3LABS_EFFECTIVE_UID = userProfile?.adminUid || authUser?.uid || null;
  return authUser;
}

async function logout() {
  if (isFirebaseReady) await signOutUser();
  localStorage.removeItem(localAuthKey());
  authUser = null; userProfile = null; currentRole = 'admin'; globalThis.W3LABS_EFFECTIVE_UID = null;
}

async function forgotPassword(email) {
  if (isFirebaseReady) return resetPassword(email);
  return true;
}

function isAdmin() { return currentRole === 'admin'; }
function isMember() { return currentRole === 'member'; }
function effectiveUid() { return userProfile?.adminUid || authUser?.uid || null; }
function propertyName() { return userProfile?.propriedadeNome || 'Minha Fazenda'; }
function propertyCode() { return userProfile?.codigoPropriedade || '---'; }

function generateLocalPropertyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = ''; for (let i=0; i<4; i++) s += chars[Math.floor(Math.random()*chars.length)];
  return `AGRO-${s}`;
}
async function findProperty(code) {
  if (!code) return null;
  if (isFirebaseReady) {
    const f = await loadFirebase();
    const ref = f.doc(f.db, 'propriedades', String(code).trim().toUpperCase());
    const snap = await f.getDoc(ref);
    return snap.exists() ? { id:snap.id, ...snap.data() } : null;
  }
  return findLocalProperty(code);
}
async function findLocalProperty(code) {
  const state = JSON.parse(localStorage.getItem('w3labs-agro-local-v1') || '{}');
  const rows = state.propriedades || [];
  return rows.find(p => p.codigo === String(code).trim().toUpperCase() || p.id === String(code).trim().toUpperCase()) || (String(code).trim().toUpperCase() === 'AGRO-LOCAL' ? {codigo:'AGRO-LOCAL', adminUid:authUser?.uid || 'local-admin', propriedadeNome:'Minha Fazenda (modo local)'} : null);
}
async function getAdminUidLocal(code) { return (await findLocalProperty(code))?.adminUid || 'local-admin'; }
