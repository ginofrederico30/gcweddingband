/* ============================================
   firebase-db.js
   Shared Firebase init + DB/ADB cache layer
   Loaded before portal.js and artist.js
   ============================================ */

/* ---- FIREBASE CONFIG
   Replace every REPLACE_ME value with your project's config.
   Get it from: Firebase Console → Project Settings → Your apps → SDK setup
   ---- */
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_ME",
  authDomain:        "REPLACE_ME.firebaseapp.com",
  projectId:         "REPLACE_ME",
  storageBucket:     "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId:             "REPLACE_ME"
};

const ADMIN_EMAIL  = 'gino@gcweddingband.com';
const ARTIST_EMAIL = 'artist@gcweddingband.com';

/* ---- Init Firebase (compat SDK) ---- */
firebase.initializeApp(FIREBASE_CONFIG);
const _db      = firebase.firestore();
const _auth    = firebase.auth();
const _storage = firebase.storage();

/* ---- Firestore write error handler ---- */
function _fsErr(e) { console.error('Firestore sync error:', e); }

/* ============================================
   STORAGE HELPERS
   ============================================ */

/* Upload a canvas blob as a signature image; returns the download URL */
async function uploadSignature(clientId, role, blob) {
  const ref = _storage.ref('signatures/' + clientId + '/' + role + '.png');
  await ref.put(blob, { contentType: 'image/png' });
  return ref.getDownloadURL();
}

/* Upload a PDF File object; returns the download URL */
async function uploadPDF(clientId, file) {
  const ref = _storage.ref('pdfs/' + clientId + '/presigned.pdf');
  await ref.put(file, { contentType: 'application/pdf' });
  return ref.getDownloadURL();
}

/* ============================================
   SECONDARY APP — for creating client Firebase Auth
   accounts without signing out the admin
   ============================================ */
let _secondaryApp = null;

async function createClientAuth(email, password) {
  if (!_secondaryApp) {
    _secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, 'Secondary');
  }
  const cred = await _secondaryApp.auth().createUserWithEmailAndPassword(email, password);
  const uid  = cred.user.uid;
  await _secondaryApp.auth().signOut();
  return uid;
}

/* ============================================
   DB — Admin + Client portal data layer
   All get* methods read synchronously from _cache.
   All set* methods update _cache immediately AND
   write to Firestore asynchronously in the background.
   Call DB.loadAll() or DB.loadClientData(uid) once
   at login before using any other method.
   ============================================ */
const DB = {
  _cache: {
    clients:        [],
    contracts:      {},
    gcp:            {},
    masterSongs:    [],
    masterContract: {},
    setlists:       {}
  },

  /* Load everything — used by admin */
  async loadAll() {
    const [cliSnap, conSnap, gcpSnap, slSnap, cfgSnap] = await Promise.all([
      _db.collection('clients').get(),
      _db.collection('contracts').get(),
      _db.collection('gcp').get(),
      _db.collection('setlists').get(),
      _db.collection('config').get()
    ]);
    this._cache.clients   = cliSnap.docs.map(d => d.data());
    conSnap.docs.forEach(d => { this._cache.contracts[d.id] = d.data(); });
    gcpSnap.docs.forEach(d => { this._cache.gcp[d.id]       = d.data(); });
    slSnap.docs.forEach(d  => { this._cache.setlists[d.id]  = d.data(); });
    const msDoc = cfgSnap.docs.find(d => d.id === 'masterSongs');
    const mcDoc = cfgSnap.docs.find(d => d.id === 'masterContract');
    this._cache.masterSongs    = msDoc ? (msDoc.data().songs || []) : [];
    this._cache.masterContract = mcDoc ? mcDoc.data() : {};
  },

  /* Load only one client's data — used by client portal */
  async loadClientData(uid) {
    const [cliDoc, conDoc, gcpDoc, msDoc, mcDoc] = await Promise.all([
      _db.doc('clients/' + uid).get(),
      _db.doc('contracts/' + uid).get(),
      _db.doc('gcp/' + uid).get(),
      _db.doc('config/masterSongs').get(),
      _db.doc('config/masterContract').get()
    ]);
    if (cliDoc.exists) this._cache.clients = [cliDoc.data()];
    if (conDoc.exists) this._cache.contracts[uid] = conDoc.data();
    if (gcpDoc.exists) this._cache.gcp[uid]       = gcpDoc.data();
    this._cache.masterSongs    = msDoc.exists ? (msDoc.data().songs || []) : [];
    this._cache.masterContract = mcDoc.exists ? mcDoc.data() : {};
  },

  /* ---- Synchronous cache reads (same signatures as the old localStorage DB) ---- */
  getClients()        { return this._cache.clients || []; },
  getMasterSongs()    { return this._cache.masterSongs || []; },
  getMasterContract() { return this._cache.masterContract || {}; },

  getContract(cid) {
    return this._cache.contracts[cid] || { admin: {}, client: {}, signedAt: null, signatureData: null };
  },
  getGCP(cid) {
    const d = this._cache.gcp[cid] || {};
    return { songs: {}, songRequests: [], checklist: {}, ceremony: {}, ...d };
  },

  /* ---- Cache + Firestore writes ---- */
  setClients(arr) {
    this._cache.clients = arr;
    arr.forEach(c => _db.doc('clients/' + c.id).set(c).catch(_fsErr));
  },
  setMasterSongs(arr) {
    this._cache.masterSongs = arr;
    _db.doc('config/masterSongs').set({ songs: arr }).catch(_fsErr);
  },
  setMasterContract(obj) {
    this._cache.masterContract = obj;
    _db.doc('config/masterContract').set(obj).catch(_fsErr);
  },
  setContract(cid, data) {
    this._cache.contracts[cid] = data;
    _db.doc('contracts/' + cid).set(data).catch(_fsErr);
  },
  setGCP(cid, data) {
    this._cache.gcp[cid] = data;
    _db.doc('gcp/' + cid).set(data).catch(_fsErr);
  },

  /* Delete a client and all their data from cache + Firestore */
  async deleteClientData(cid) {
    this._cache.clients   = this._cache.clients.filter(c => c.id !== cid);
    delete this._cache.contracts[cid];
    delete this._cache.gcp[cid];
    delete this._cache.setlists[cid];
    await Promise.all([
      _db.doc('clients/'   + cid).delete(),
      _db.doc('contracts/' + cid).delete(),
      _db.doc('gcp/'       + cid).delete(),
      _db.doc('setlists/'  + cid).delete()
    ]);
  }
};

/* ============================================
   ADB — Artist portal data layer
   Same cache-first pattern; read-heavy, only
   writes setlists.
   ============================================ */
const ADB = {
  _cache: {
    clients:     [],
    contracts:   {},
    gcp:         {},
    masterSongs: [],
    setlists:    {}
  },

  async loadAll() {
    const [cliSnap, conSnap, gcpSnap, slSnap, msDoc] = await Promise.all([
      _db.collection('clients').get(),
      _db.collection('contracts').get(),
      _db.collection('gcp').get(),
      _db.collection('setlists').get(),
      _db.doc('config/masterSongs').get()
    ]);
    this._cache.clients = cliSnap.docs.map(d => d.data());
    conSnap.docs.forEach(d => { this._cache.contracts[d.id] = d.data(); });
    gcpSnap.docs.forEach(d => { this._cache.gcp[d.id]       = d.data(); });
    slSnap.docs.forEach(d  => { this._cache.setlists[d.id]  = d.data(); });
    this._cache.masterSongs = msDoc.exists ? (msDoc.data().songs || []) : [];
  },

  getClients()     { return this._cache.clients || []; },
  getContract(cid) { return this._cache.contracts[cid] || { admin:{}, client:{}, signedAt:null }; },
  getMasterSongs() { return this._cache.masterSongs || []; },
  getSetlists()    { return this._cache.setlists || {}; },
  getGCP(cid) {
    const d = this._cache.gcp[cid] || {};
    return { songs:{}, songRequests:[], checklist:{}, ceremony:{}, ...d };
  },

  /* Write all setlist entries back to Firestore */
  setSetlists(d) {
    this._cache.setlists = d;
    Object.entries(d).forEach(([cid, sl]) => {
      _db.doc('setlists/' + cid).set(sl).catch(_fsErr);
    });
  }
};
