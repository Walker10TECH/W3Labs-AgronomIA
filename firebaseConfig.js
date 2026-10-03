const FIREBASE_VERSION = '12.7.0';
const env = window.W3LABS_ENV || {};

const pick = (name) => env[name] || env[`EXPO_PUBLIC_${name}`] || '';

export const firebaseConfig = {
  apiKey: pick('FIREBASE_API_KEY'),
  authDomain: pick('FIREBASE_AUTH_DOMAIN'),
  projectId: pick('FIREBASE_PROJECT_ID'),
  storageBucket: pick('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: pick('FIREBASE_MESSAGING_SENDER_ID'),
  appId: pick('FIREBASE_APP_ID'),
  measurementId: pick('FIREBASE_MEASUREMENT_ID')
};

export const isFirebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let modulesPromise;
let firebase = {};

export async function loadFirebase() {
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

export async function getAuthState() {
  if (!isFirebaseReady) return null;
  const f = await loadFirebase();
  return await new Promise((resolve) => {
    const unsubscribe = f.onAuthStateChanged(f.auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

export async function onAuthChange(callback) {
  if (!isFirebaseReady) return () => {};
  const f = await loadFirebase();
  return f.onAuthStateChanged(f.auth, callback);
}

export async function signIn(email, password) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  return (await f.signInWithEmailAndPassword(f.auth, email, password)).user;
}

export async function createUser(email, password) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  return (await f.createUserWithEmailAndPassword(f.auth, email, password)).user;
}

export async function updateUserProfile(profile) {
  if (!isFirebaseReady) return;
  const f = await loadFirebase();
  if (f.auth.currentUser) await f.updateProfile(f.auth.currentUser, profile);
}

export async function signOutUser() {
  if (!isFirebaseReady) return;
  const f = await loadFirebase();
  await f.signOut(f.auth);
}

export async function resetPassword(email) {
  if (!isFirebaseReady) throw new Error('Firebase não configurado.');
  const f = await loadFirebase();
  await f.sendPasswordResetEmail(f.auth, email);
}

export async function firestoreApi() {
  if (!isFirebaseReady) return null;
  return loadFirebase();
}

export const FIRESTORE_COLLECTION_SCHEMAS = {
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
