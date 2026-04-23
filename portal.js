/* ============================================
   Good Company Wedding Band — Client Portal
   ============================================ */

/* ---- ADMIN CREDENTIALS ---- */
const ADMIN_EMAIL    = 'gino@gcweddingband.com';
const ADMIN_PASSWORD = 'GCBand2024!';
const SESSION_TTL    = 8 * 60 * 60 * 1000; // 8 hours

/* ---- SEED SONG LIST ---- */
const SEED_SONGS = [
  { title: "All Your'n",                                 artist: "Tyler Childers" },
  { title: "Ain't It Fun",                               artist: "Paramore" },
  { title: "Ain't No Mountain High Enough",              artist: "Marvin Gaye" },
  { title: "All Night Long",                             artist: "Lionel Richie" },
  { title: "All the Small Things",                       artist: "blink-182" },
  { title: "Are You Gonna Be My Girl",                   artist: "Jet" },
  { title: "Birthday",                                   artist: "Katy Perry" },
  { title: "Blame It on the Boogie",                     artist: "The Jacksons" },
  { title: "Boogie Shoes",                               artist: "KC & The Sunshine Band" },
  { title: "Brick House",                                artist: "Commodores" },
  { title: "Bust a Move",                                artist: "Young MC" },
  { title: "Cake By the Ocean",                          artist: "DNCE" },
  { title: "Canned Heat",                                artist: "Jamiroquai" },
  { title: "Celebration",                                artist: "Kool & The Gang" },
  { title: "Come and Get Your Love",                     artist: "Redbone" },
  { title: "Come On Eileen",                             artist: "Dexys Midnight Runners" },
  { title: "Crazy in Love",                              artist: "Beyoncé" },
  { title: "Dancing in the Moonlight",                   artist: "King Harvest" },
  { title: "Dancing on the Ceiling",                     artist: "Lionel Richie" },
  { title: "Dancing Queen",                              artist: "ABBA" },
  { title: "December 1963 (Oh, What a Night)",           artist: "Frankie Valli & The Four Seasons" },
  { title: "Don't Start Now",                            artist: "Dua Lipa" },
  { title: "Dreams",                                     artist: "Fleetwood Mac" },
  { title: "Funkytown",                                  artist: "Lipps Inc." },
  { title: "Get Down On It",                             artist: "Kool & The Gang" },
  { title: "Gimme! Gimme! Gimme!",                       artist: "ABBA" },
  { title: "Give It To Me Baby",                         artist: "Rick James" },
  { title: "Heaven",                                     artist: "Los Lonely Boys" },
  { title: "Hips Don't Lie",                             artist: "Shakira" },
  { title: "Hot Stuff",                                  artist: "Donna Summer" },
  { title: "HOT TO GO!",                                 artist: "Chappell Roan" },
  { title: "How Bizarre",                                artist: "OMC" },
  { title: "I Wanna Be Your Lover",                      artist: "Prince" },
  { title: "I Wanna Dance With Somebody",                artist: "Whitney Houston" },
  { title: "I Wish",                                     artist: "Stevie Wonder" },
  { title: "If I Ain't Got You",                         artist: "Alicia Keys" },
  { title: "Is This Love",                               artist: "Bob Marley & The Wailers" },
  { title: "Le Freak",                                   artist: "CHIC" },
  { title: "Levitating",                                 artist: "Dua Lipa" },
  { title: "Lil Boo Thang",                              artist: "Paul Russell" },
  { title: "Love Story",                                 artist: "Taylor Swift" },
  { title: "Man! I Feel Like a Woman!",                  artist: "Shania Twain" },
  { title: "Man I Need",                                 artist: "Olivia Dean" },
  { title: "Mr. Brightside",                             artist: "The Killers" },
  { title: "Music For a Sushi Restaurant",               artist: "Harry Styles" },
  { title: "My Girl",                                    artist: "The Temptations" },
  { title: "Pick Up the Pieces",                         artist: "Average White Band" },
  { title: "Pink Pony Club",                             artist: "Chappell Roan" },
  { title: "Play That Funky Music",                      artist: "Wild Cherry" },
  { title: "Red Wine Supernova",                         artist: "Chappell Roan" },
  { title: "Reelin' In The Years",                       artist: "Steely Dan" },
  { title: "Rich Girl",                                  artist: "Daryl Hall & John Oates" },
  { title: "Semi-Charmed Life",                          artist: "Third Eye Blind" },
  { title: "September",                                  artist: "Earth, Wind & Fire" },
  { title: "Shake Your Body (Down to the Ground)",       artist: "The Jacksons" },
  { title: "Shining Star",                               artist: "Earth, Wind & Fire" },
  { title: "Signed, Sealed, Delivered (I'm Yours)",      artist: "Stevie Wonder" },
  { title: "Sir Duke",                                   artist: "Stevie Wonder" },
  { title: "Stayin' Alive",                              artist: "Bee Gees" },
  { title: "Sunday Morning",                             artist: "Maroon 5" },
  { title: "Superstition",                               artist: "Stevie Wonder" },
  { title: "Tennessee Whiskey",                          artist: "Chris Stapleton" },
  { title: "Tequila",                                    artist: "The Champs" },
  { title: "The Real Slim Shady",                        artist: "Eminem" },
  { title: "This Will Be (An Everlasting Love)",         artist: "Natalie Cole" },
  { title: "Treasure",                                   artist: "Bruno Mars" },
  { title: "Unwritten",                                  artist: "Natasha Bedingfield" },
  { title: "Uptown Funk",                                artist: "Mark Ronson ft. Bruno Mars" },
  { title: "Valerie",                                    artist: "Mark Ronson ft. Amy Winehouse" },
  { title: "We Are Family",                              artist: "Sister Sledge" },
  { title: "What a Wonderful World",                     artist: "Louis Armstrong" },
  { title: "WHERE IS MY HUSBAND!",                       artist: "RAYE" },
  { title: "You Are the Best Thing",                     artist: "Ray LaMontagne" },
  { title: "You Make Me Feel Like Dancing",              artist: "Leo Sayer" },
  { title: "You Make My Dreams (Come True)",             artist: "Daryl Hall & John Oates" },
  { title: "You Sexy Thing",                             artist: "Hot Chocolate" },
  { title: "1999",                                       artist: "Prince" }
];

/* ============================================
   DATA STORE
   ============================================ */
const DB = {
  _get(key)      { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  getSession()   { return this._get('gc_session'); },
  setSession(v)  { this._set('gc_session', v); },
  clearSession() { localStorage.removeItem('gc_session'); },

  getClients()   { return this._get('gc_clients') || []; },
  setClients(v)  { this._set('gc_clients', v); },

  getMasterSongs()     { return this._get('gc_master_songs') || []; },
  setMasterSongs(v)    { this._set('gc_master_songs', v); },

  getMasterContract()  { return this._get('gc_master_contract') || {}; },
  setMasterContract(v) { this._set('gc_master_contract', v); },

  getContract(cid) {
    return (this._get('gc_contracts') || {})[cid] || { admin: {}, client: {}, signedAt: null, signatureData: null };
  },
  setContract(cid, data) {
    const all = this._get('gc_contracts') || {};
    all[cid] = data;
    this._set('gc_contracts', all);
  },

  getGCP(cid) {
    const all = this._get('gc_gcp') || {};
    const d = all[cid] || {};
    return { songs: {}, songRequests: [], checklist: {}, ceremony: {}, ...d };
  },
  setGCP(cid, data) {
    const all = this._get('gc_gcp') || {};
    all[cid] = data;
    this._set('gc_gcp', all);
  }
};

/* ============================================
   INIT — seed songs on first load
   ============================================ */
function initSeedData() {
  if (!DB.getMasterSongs().length) {
    const songs = SEED_SONGS.map((s, i) => ({
      id: 'seed_' + i,
      title: s.title,
      artist: s.artist,
      addedAt: 1  // epoch 1ms — always predates any client
    }));
    DB.setMasterSongs(songs);
  }
}

/* ============================================
   AUTH
   ============================================ */
function login(email, password) {
  const em = (email || '').trim().toLowerCase();
  const pw = (password || '').trim();

  if (em === ADMIN_EMAIL.toLowerCase() && pw === ADMIN_PASSWORD) {
    DB.setSession({ role: 'admin', clientId: null, email: em, expiresAt: Date.now() + SESSION_TTL });
    return { ok: true, role: 'admin' };
  }

  const client = DB.getClients().find(c => c.email.toLowerCase() === em && c.password === pw);
  if (client) {
    DB.setSession({ role: 'client', clientId: client.id, email: em, expiresAt: Date.now() + SESSION_TTL });
    return { ok: true, role: 'client', clientId: client.id };
  }

  return { ok: false, error: 'Invalid email or password.' };
}

function getSession() {
  const s = DB.getSession();
  if (!s) return null;
  if (s.expiresAt && Date.now() > s.expiresAt) { DB.clearSession(); return null; }
  return s;
}

function logout() {
  DB.clearSession();
  showView('view-login');
  updateNav(null);
}

/* ============================================
   VIEW ROUTING
   ============================================ */
const VIEWS = [
  'view-login', 'view-admin-dash', 'view-admin-client',
  'view-admin-songs', 'view-master-contract', 'view-client-dash', 'view-contract',
  'view-songs', 'view-checklist', 'view-ceremony'
];

function showView(id) {
  VIEWS.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.toggle('hidden', v !== id);
  });
  window.scrollTo(0, 0);
}

function updateNav(session) {
  const section  = document.getElementById('pnav-section');
  const userEl   = document.getElementById('pnav-user');
  const logoutEl = document.getElementById('pnav-logout');
  if (!session) {
    section.textContent = '';
    userEl.textContent  = '';
    logoutEl.classList.add('hidden');
    return;
  }
  section.textContent = session.role === 'admin' ? 'Admin Portal' : 'Client Portal';
  userEl.textContent  = session.email;
  logoutEl.classList.remove('hidden');
}

function setNavSection(text) {
  document.getElementById('pnav-section').textContent = text;
}

/* ============================================
   TOAST
   ============================================ */
let _toastTimer;
function showToast(msg, duration) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  t.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, duration || 2800);
}

/* ============================================
   MODALS
   ============================================ */
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

/* ============================================
   HELPERS
   ============================================ */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function fmtDate(val) {
  if (!val) return '—';
  const [y, m, d] = val.split('-');
  if (!y || !m || !d) return val;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(m,10)-1] + ' ' + parseInt(d,10) + ', ' + y;
}

function fmtDateFromTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
}

function fmtMoney(val) {
  if (val === null || val === undefined || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTime12(val) {
  if (!val) return '—';
  const [hStr, mStr] = val.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  return (h % 12 || 12) + ':' + m + ' ' + ampm;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function flashSaved(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2200);
}

/* ---- Phone auto-format ---- */
function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4)  return digits;
  if (digits.length < 7)  return '(' + digits.slice(0,3) + ') ' + digits.slice(3);
  return '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6);
}

/* ============================================
   CONTRACT STATUS HELPERS
   ============================================ */
function contractStatus(cid) {
  const c = DB.getContract(cid);
  if (c.signedAt && c.adminSignedAt) return { label: 'Fully Executed', cls: 'status-signed' };
  if (c.signedAt) return { label: 'Awaiting Counter-Sig', cls: 'status-alert' };
  const hasAdmin = c.admin && (c.admin.clientName || c.admin.performanceFee);
  if (hasAdmin) return { label: 'Ready to Sign', cls: 'status-ready' };
  return { label: 'Pending', cls: 'status-pending' };
}

function checklistProgress(cid) {
  const cl = DB.getGCP(cid).checklist || {};

  // Core fields always counted
  const core = [
    'cl-arrival-time','cl-guest-arrival','cl-loadinlocation','cl-parking',
    'cl-parking-payment','cl-dressing-room',
    'cl-cocktail-sep','cl-cocktail-outdoor','cl-cocktail-start','cl-cocktail-end',
    'cl-coordinator','cl-wifi-name','cl-wifi-pass','cl-stage-size','cl-outdoor',
    'cl-power','cl-reception-start','cl-dinner-time','cl-dinner-style',
    'cl-table-announce','cl-meals','cl-band-eat','cl-speeches',
    'cl-first-dance','cl-parent-dances','cl-dance-floor','cl-reception-end',
    'cl-attendance','cl-loadout',
    'cl-announce-party','cl-grand-entrance',
    'cl-spotify-dinner','cl-spotify-break'
  ];

  // Conditional sub-fields only count when parent toggle is Yes
  const required = [...core];
  if (cl['cl-announce-party'] === 'Yes') {
    required.push('cl-announce-party-how','cl-party-names','cl-spotify-party');
  }
  if (cl['cl-grand-entrance'] === 'Yes') {
    required.push('cl-couple-announce','cl-spotify-couple');
  }

  const filled = required.filter(id => cl[id] !== '' && cl[id] != null).length;
  return Math.min(100, Math.round((filled / required.length) * 100));
}

function ceremonyProgress(cid) {
  const cer = DB.getGCP(cid).ceremony || {};
  const contract = DB.getContract(cid);
  const scope = (contract.admin && contract.admin.scopeOfServices) || [];
  const logistics = ['cer-start','cer-end','cer-officiant-mic','cer-readers-mic','cer-sep-location','cer-distance','cer-outdoor','cer-power'];
  let musicFields = [];
  if (scope.includes('Live Ceremony Music')) {
    musicFields = ['cer-seating-genre','cer-live-family-song','cer-live-bride-song','cer-live-exit-song'];
  } else if (scope.includes('Ceremony Duties')) {
    musicFields = ['cer-duties-seating-link','cer-duties-family-link','cer-duties-bride-link','cer-duties-exit-link'];
  }
  const required = [...logistics, ...musicFields];
  if (!required.length) return 0;
  const filled = required.filter(id => cer[id] !== '' && cer[id] != null).length;
  return Math.min(100, Math.round((filled / required.length) * 100));
}

function countNewSongs(clientId) {
  const client = DB.getClients().find(c => c.id === clientId);
  if (!client) return 0;
  const songs = DB.getGCP(clientId).songs || {};
  return DB.getMasterSongs().filter(s => s.addedAt > client.createdAt && !songs[s.id]).length;
}

function countSelectedSongs(clientId) {
  const gcp     = DB.getGCP(clientId);
  const songs   = gcp.songs || {};
  const catalog = Object.values(songs).filter(v => v === 'Priority' || v === 'Yes').length;
  const reqs    = (gcp.songRequests || []).length;
  return catalog + reqs;
}

/* ============================================
   CONTRACT AUTO-CALC (admin side)
   ============================================ */
function calcContractTotals() {
  const fee   = parseFloat(document.getElementById('ac-performance-fee').value) || 0;
  const trans = parseFloat(document.getElementById('ac-transportation').value)  || 0;
  const lodge = parseFloat(document.getElementById('ac-lodging').value)          || 0;
  const total   = fee + trans + lodge;
  const deposit = total * 0.25;
  const balance = total - deposit;

  document.getElementById('ac-total-cost-display').textContent    = '$' + total.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('ac-deposit-display').textContent       = '$' + deposit.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('ac-final-balance-display').textContent = '$' + balance.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
}

/* ============================================
   GOOGLE MAPS AUTOCOMPLETE (if key is configured)
   ============================================ */
function attachPlacesAutocomplete(inputId, types) {
  function init() {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    const input = document.getElementById(inputId);
    if (!input) return;
    const ac = new window.google.maps.places.Autocomplete(input, {
      types: types || ['address'],
      componentRestrictions: { country: 'us' }
    });
    ac.addListener('place_changed', function() {
      const place = ac.getPlace();
      if (types && types[0] === 'establishment') {
        const addr = place.formatted_address || '';
        const name = place.name || '';
        input.value = name + (addr ? ', ' + addr : '');
      }
      input.dispatchEvent(new Event('input'));
    });
    // Mark as GM-enhanced so Nominatim doesn't double-attach
    input._gmAttached = true;
  }
  if (window._gmReady) { init(); }
  else { window._gmQueue = window._gmQueue || []; window._gmQueue.push(init); }
}


/* ============================================
   ADMIN DASHBOARD
   ============================================ */
function renderAdminDash() {
  const clients = DB.getClients();
  const statsEl = document.getElementById('admin-stats');
  const signed  = clients.filter(c => DB.getContract(c.id).signedAt).length;

  const awaitingCounter = clients.filter(c => { const ct = DB.getContract(c.id); return ct.signedAt && !ct.adminSignedAt; }).length;
  const executed        = clients.filter(c => { const ct = DB.getContract(c.id); return ct.signedAt && ct.adminSignedAt; }).length;

  statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-number">${clients.length}</div><div class="stat-label">Clients</div></div>
    <div class="stat-card"><div class="stat-number">${executed}</div><div class="stat-label">Executed Contracts</div></div>
    <div class="stat-card"><div class="stat-number">${awaitingCounter}</div><div class="stat-label">Awaiting Counter-Sig</div></div>
    <div class="stat-card"><div class="stat-number">${DB.getMasterSongs().length}</div><div class="stat-label">Songs in Catalog</div></div>
  `;

  const query    = (document.getElementById('client-search').value || '').toLowerCase();
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
  );

  const tbody = document.getElementById('clients-tbody');
  const noMsg = document.getElementById('no-clients-msg');

  if (!filtered.length) {
    tbody.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }
  noMsg.classList.add('hidden');

  tbody.innerHTML = filtered.map(c => {
    const cs       = contractStatus(c.id);
    const selCount = countSelectedSongs(c.id);
    const clProg   = checklistProgress(c.id);
    const cerProg  = ceremonyProgress(c.id);

    return `
      <tr>
        <td>
          <div class="table-client-name">${escHtml(c.name)}</div>
          <div style="font-size:11px;color:#aaa;font-family:var(--font-sans)">${escHtml(c.email)}</div>
        </td>
        <td>${fmtDate(c.eventDate) || '—'}</td>
        <td><span class="status-badge ${cs.cls}">${cs.label}</span></td>
        <td><span class="status-badge ${selCount > 0 ? 'status-signed' : 'status-none'}">${selCount > 0 ? selCount + ' selected' : 'None'}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="gcp-progress-bar" style="width:80px"><div class="gcp-progress-fill" style="width:${clProg}%"></div></div>
            <span style="font-size:11px;color:#999;font-family:var(--font-sans)">${clProg}%</span>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="gcp-progress-bar" style="width:80px"><div class="gcp-progress-fill" style="width:${cerProg}%"></div></div>
            <span style="font-size:11px;color:#999;font-family:var(--font-sans)">${cerProg}%</span>
          </div>
        </td>
        <td><button class="table-action-btn" onclick="openClientDetail('${c.id}')">View <i class="fas fa-chevron-right"></i></button></td>
      </tr>
    `;
  }).join('');
}

/* ============================================
   ADMIN CLIENT DETAIL
   ============================================ */
let currentAdminClientId = null;

function openClientDetail(clientId) {
  currentAdminClientId = clientId;
  const client   = DB.getClients().find(c => c.id === clientId);
  const contract = DB.getContract(clientId);

  document.getElementById('admin-client-name').textContent     = client.name;
  document.getElementById('admin-client-eventdate').textContent = client.eventDate ? 'Wedding: ' + fmtDate(client.eventDate) : '';

  const cs = contractStatus(clientId);
  const badge = document.getElementById('admin-contract-badge');
  badge.className   = 'status-badge ' + cs.cls;
  badge.textContent = cs.label;

  // Date created (auto from client record)
  document.getElementById('ac-date-created-display').textContent = fmtDateFromTimestamp(client.createdAt);

  // Admin fields
  const a = contract.admin || {};
  document.getElementById('ac-client-name').value     = a.clientName    || client.name;
  document.getElementById('ac-event-date').value       = a.eventDate     || client.eventDate || '';
  document.getElementById('ac-performance-fee').value  = a.performanceFee || '';
  document.getElementById('ac-transportation').value   = a.transportation || '';
  document.getElementById('ac-lodging').value          = a.lodging        || '';
  calcContractTotals();

  // Scope of services checkboxes — only check what was explicitly saved
  const savedServices = a.scopeOfServices || [];
  document.querySelectorAll('input[name="scope-service"]').forEach(cb => {
    cb.checked = savedServices.includes(cb.value);
  });

  // Client-filled fields (readonly)
  const cl = contract.client || {};
  document.getElementById('ac-start-time').value            = cl.startTime ? fmtTime12(cl.startTime) : '';
  document.getElementById('ac-end-time').value              = cl.endTime   ? fmtTime12(cl.endTime)   : '';
  document.getElementById('ac-location').value              = cl.venue     || '';
  document.getElementById('ac-client-address').value        = cl.address   || '';
  document.getElementById('ac-client-email-contract').value = cl.email     || '';
  document.getElementById('ac-client-phone').value          = cl.phone     || '';
  document.getElementById('ac-dress-code').value            = cl.dressCode || '';
  document.getElementById('ac-payment-method').value        = cl.paymentMethod || '';
  document.getElementById('ac-consent').value               = cl.consent   || '';
  document.getElementById('ac-signed-status').value         = contract.signedAt
    ? 'Signed — ' + new Date(contract.signedAt).toLocaleDateString() : 'Not signed';

  // Counter-signature / executed cards
  const countersignCard = document.getElementById('admin-countersign-card');
  const executedCard    = document.getElementById('admin-executed-card');
  if (contract.signedAt && contract.adminSignedAt) {
    countersignCard.classList.add('hidden');
    executedCard.classList.remove('hidden');
    const execClientSig  = document.getElementById('admin-executed-client-sig');
    const execArtistSig  = document.getElementById('admin-executed-artist-sig');
    const execClientDate = document.getElementById('admin-executed-client-date');
    const execArtistDate = document.getElementById('admin-executed-artist-date');
    if (execClientSig)  execClientSig.src  = contract.signatureData || '';
    if (execArtistSig)  execArtistSig.src  = contract.adminSignatureData || '';
    if (execClientDate) execClientDate.textContent = 'Signed: ' + new Date(contract.signedAt).toLocaleDateString();
    if (execArtistDate) execArtistDate.textContent = 'Signed: ' + new Date(contract.adminSignedAt).toLocaleDateString();
  } else if (contract.signedAt) {
    countersignCard.classList.remove('hidden');
    executedCard.classList.add('hidden');
    const viewClientSig  = document.getElementById('admin-view-client-sig');
    const viewClientDate = document.getElementById('admin-view-client-sig-date');
    if (viewClientSig)  viewClientSig.src  = contract.signatureData || '';
    if (viewClientDate) viewClientDate.textContent = 'Signed: ' + new Date(contract.signedAt).toLocaleDateString();
    // Pre-fill today's date in admin sig date field
    const adminSigDateEl = document.getElementById('admin-sig-date');
    if (adminSigDateEl && !adminSigDateEl.value) adminSigDateEl.value = new Date().toISOString().slice(0,10);
    initAdminSigCanvas();
  } else {
    countersignCard.classList.add('hidden');
    executedCard.classList.add('hidden');
  }

  // Language editor
  renderLangEditor(clientId);

  // GCP overview
  const gcp    = DB.getGCP(clientId);
  const reqCnt = (gcp.songRequests || []).length;
  const selCnt = countSelectedSongs(clientId);
  const clProg = checklistProgress(clientId);
  const cerProg = ceremonyProgress(clientId);

  document.getElementById('admin-gcp-overview').innerHTML = `
    <div class="gcp-overview-item">
      <h4>Song Selector</h4>
      <div>${selCnt} total (catalog marks + ${reqCnt} request${reqCnt !== 1 ? 's' : ''})</div>
      <div class="gcp-progress-bar" style="margin-top:8px"><div class="gcp-progress-fill" style="width:${Math.min(100,selCnt*2)}%"></div></div>
    </div>
    <div class="gcp-overview-item">
      <h4>Day-of Checklist</h4>
      <div>${clProg}% complete</div>
      <div class="gcp-progress-bar" style="margin-top:8px"><div class="gcp-progress-fill" style="width:${clProg}%"></div></div>
    </div>
    <div class="gcp-overview-item">
      <h4>Ceremony Planner</h4>
      <div>${cerProg}% complete</div>
      <div class="gcp-progress-bar" style="margin-top:8px"><div class="gcp-progress-fill" style="width:${cerProg}%"></div></div>
    </div>
  `;

  renderAdminSongSelections(clientId);
  showView('view-admin-client');
  setNavSection('Admin Portal');
}

function renderAdminSongSelections(clientId) {
  const gcp      = DB.getGCP(clientId);
  const songs    = gcp.songs || {};
  const requests = gcp.songRequests || [];
  const allSongs = DB.getMasterSongs();
  const container = document.getElementById('admin-song-selections');

  // Normalize catalog prefs
  const normSongs = {};
  Object.keys(songs).forEach(k => { normSongs[k] = _normalizePref(songs[k]); });

  const selected = allSongs.filter(s => normSongs[s.id] && normSongs[s.id] !== '');
  const hasAnything = selected.length || requests.length;

  if (!hasAnything) {
    container.innerHTML = '<p style="padding:16px 24px;color:#aaa;font-family:var(--font-sans);font-size:13px">No songs selected yet.</p>';
    return;
  }

  const priority = selected.filter(s => normSongs[s.id] === 'Priority');
  const yes      = selected.filter(s => normSongs[s.id] === 'Yes');
  const dnp      = selected.filter(s => normSongs[s.id] === 'Do Not Play');

  function catalogGroup(label, list, cls) {
    if (!list.length) return '';
    return `<div style="padding:12px 24px 4px">
      <div style="font-family:var(--font-sans);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px">${label}</div>
      ${list.map(s => `
        <div style="padding:8px 0;display:flex;align-items:center;gap:14px;border-bottom:1px solid #f4f3f0">
          <div class="song-info">
            <div class="song-title">${escHtml(s.title)}</div>
            <div class="song-artist">${escHtml(s.artist)}</div>
          </div>
          <span class="status-badge ${cls}" style="flex-shrink:0">${normSongs[s.id]}</span>
        </div>
      `).join('')}
    </div>`;
  }

  let html = catalogGroup('Catalog — Priority', priority, 'status-alert') +
             catalogGroup('Catalog — Yes', yes, 'status-signed') +
             catalogGroup('Catalog — Do Not Play', dnp, 'status-none');

  if (requests.length) {
    const prioReqs  = requests.filter(r => r.type === 'Priority');
    const otherReqs = requests.filter(r => r.type === 'Other');

    function reqGroup(label, list, cls) {
      if (!list.length) return '';
      return `<div style="padding:12px 24px 4px">
        <div style="font-family:var(--font-sans);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px">${label}</div>
        ${list.map(r => `
          <div style="padding:8px 0;display:flex;align-items:center;gap:14px;border-bottom:1px solid #f4f3f0">
            <div class="song-info">
              <div class="song-title">${escHtml(r.title)}</div>
              <div class="song-artist">${escHtml(r.artist)}</div>
            </div>
            <span class="status-badge ${cls}" style="flex-shrink:0">${r.type}</span>
          </div>
        `).join('')}
      </div>`;
    }

    html += reqGroup('Song Requests — Priority', prioReqs, 'status-alert') +
            reqGroup('Song Requests — Other', otherReqs, 'status-signed');
  }

  container.innerHTML = html;
}

/* ============================================
   ADMIN MASTER SONG LIST
   ============================================ */
function renderMasterSongList() {
  const query = (document.getElementById('song-search').value || '').toLowerCase();
  const songs = DB.getMasterSongs().filter(s =>
    !query || s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
  );
  document.getElementById('song-count-label').textContent = DB.getMasterSongs().length + ' songs';
  const container = document.getElementById('master-song-list');
  if (!songs.length) { container.innerHTML = '<p class="empty-state">No songs found.</p>'; return; }
  container.innerHTML = songs.map(s => `
    <div class="song-item">
      <div class="song-info">
        <div class="song-title">${escHtml(s.title)}</div>
        <div class="song-artist">${escHtml(s.artist)}</div>
      </div>
      ${s.addedAt > 1 ? '<span class="song-new-badge">New</span>' : ''}
      <span style="font-size:11px;color:#ccc;font-family:var(--font-sans);margin-left:auto;padding-right:8px">
        ${s.addedAt > 1 ? 'Added ' + new Date(s.addedAt).toLocaleDateString() : 'Original catalog'}
      </span>
      <button class="song-delete-btn" onclick="confirmDeleteSong('${s.id}')" title="Remove song">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join('');
}

function addSong(title, artist) {
  const songs = DB.getMasterSongs();
  const dup = songs.find(s => s.title.toLowerCase() === title.toLowerCase() && s.artist.toLowerCase() === artist.toLowerCase());
  if (dup) return false;
  songs.push({ id: uid(), title: title.trim(), artist: artist.trim(), addedAt: Date.now() });
  DB.setMasterSongs(songs);
  return true;
}

let _deleteSongId = null;
function confirmDeleteSong(songId) {
  _deleteSongId = songId;
  const song = DB.getMasterSongs().find(s => s.id === songId);
  document.getElementById('confirm-title').textContent = 'Remove Song';
  document.getElementById('confirm-body').textContent  = `Remove "${song ? song.title : 'this song'}" from the master list?`;
  openModal('modal-confirm');
}

function deleteSong(songId) {
  DB.setMasterSongs(DB.getMasterSongs().filter(s => s.id !== songId));
  renderMasterSongList();
  showToast('Song removed.');
}

/* ============================================
   CLIENT DASHBOARD
   ============================================ */
function renderClientDash(clientId) {
  const client = DB.getClients().find(c => c.id === clientId);
  if (!client) return logout();

  document.getElementById('client-welcome-name').textContent = client.name + "'s Portal";
  document.getElementById('client-welcome-date').textContent = client.eventDate
    ? 'Wedding Date: ' + fmtDate(client.eventDate) : '';

  // New songs banner
  const newCount = countNewSongs(clientId);
  const banner   = document.getElementById('new-songs-banner');
  if (newCount > 0) {
    document.getElementById('new-songs-banner-text').textContent = newCount === 1
      ? '1 new song was added to the catalog — check it out!'
      : newCount + ' new songs were added to the catalog — check them out!';
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }

  // Contract status
  const cs = contractStatus(clientId);
  const cb = document.getElementById('status-contract');
  cb.className   = 'module-status status-badge ' + cs.cls;
  cb.textContent = cs.label;

  // Dim the contract card and update its description when not yet ready
  const contractCard = document.getElementById('module-contract');
  const contractDesc = contractCard ? contractCard.querySelector('.module-info p') : null;
  const isPending = cs.label === 'Pending';
  if (contractCard) contractCard.classList.toggle('module-card-pending', isPending);
  if (contractDesc) {
    contractDesc.textContent = isPending
      ? 'Your contract is being prepared — check back soon'
      : 'Review and sign your contract';
  }

  // Songs status
  const selCnt = countSelectedSongs(clientId);
  const newSongCnt = countNewSongs(clientId);
  const sb = document.getElementById('status-songs');
  if (newSongCnt > 0) {
    sb.className   = 'module-status status-badge status-new';
    sb.textContent = newSongCnt + ' NEW';
  } else {
    sb.className   = 'module-status status-badge ' + (selCnt > 0 ? 'status-signed' : 'status-none');
    sb.textContent = selCnt > 0 ? selCnt + ' marked' : 'Not started';
  }

  // Checklist
  const clProg = checklistProgress(clientId);
  const clb = document.getElementById('status-checklist');
  clb.className   = 'module-status status-badge ' + (clProg === 100 ? 'status-signed' : clProg > 0 ? 'status-ready' : 'status-none');
  clb.textContent = clProg === 100 ? 'Complete' : clProg > 0 ? clProg + '% done' : 'Not started';

  // Ceremony
  const contract = DB.getContract(clientId);
  const scope = (contract.admin && contract.admin.scopeOfServices) || [];
  const hasCeremony = scope.includes('Live Ceremony Music') || scope.includes('Ceremony Duties');
  const cerCard = document.getElementById('module-ceremony');
  if (cerCard) cerCard.classList.toggle('hidden', !hasCeremony);

  const cerProg = ceremonyProgress(clientId);
  const cerb = document.getElementById('status-ceremony');
  if (cerb) {
    cerb.className   = 'module-status status-badge ' + (cerProg === 100 ? 'status-signed' : cerProg > 0 ? 'status-ready' : 'status-none');
    cerb.textContent = cerProg === 100 ? 'Complete' : cerProg > 0 ? cerProg + '% done' : 'Not started';
  }
}

/* ============================================
   CLIENT CONTRACT
   ============================================ */
function renderClientContract(clientId) {
  const client   = DB.getClients().find(c => c.id === clientId);
  if (!client) return;
  const contract = DB.getContract(clientId);
  const a  = contract.admin  || {};
  const cl = contract.client || {};

  // Apply any admin language overrides
  applyLangOverrides(contract);

  // Date created from when admin created the client account
  const dateCreatedText = fmtDateFromTimestamp(client.createdAt);
  document.getElementById('cc-date-created').textContent     = dateCreatedText;
  document.getElementById('cc-client-name-text').textContent = a.clientName || client.name;

  // Admin-populated fields (read-only in client view)
  document.getElementById('cc-event-date').textContent        = fmtDate(a.eventDate || client.eventDate);
  document.getElementById('cc-fee').textContent               = fmtMoney(a.performanceFee);
  document.getElementById('cc-transportation').textContent    = fmtMoney(a.transportation);
  document.getElementById('cc-lodging').textContent           = fmtMoney(a.lodging);

  const fee     = parseFloat(a.performanceFee) || 0;
  const trans   = parseFloat(a.transportation)  || 0;
  const lodge   = parseFloat(a.lodging)          || 0;
  const total   = fee + trans + lodge;
  const deposit = total * 0.25;
  const balance = total - deposit;
  document.getElementById('cc-total').textContent         = fmtMoney(total);
  document.getElementById('cc-deposit').textContent       = fmtMoney(deposit);
  document.getElementById('cc-final-balance').textContent = fmtMoney(balance);
  const balDueDateEl = document.getElementById('cc-balance-due-date');
  if (balDueDateEl) balDueDateEl.textContent = fmtDate(a.eventDate || client.eventDate) || '—';

  // Populate scope-services-list from admin's checkbox selections.
  // scope section is excluded from CONTRACT_SECTIONS so applyLangOverrides never touches it.
  const servicesList = document.getElementById('scope-services-list');
  if (servicesList) {
    if (a.scopeOfServices && a.scopeOfServices.length) {
      servicesList.innerHTML = a.scopeOfServices.map(s => `<li>${escHtml(s)}</li>`).join('');
    } else {
      servicesList.innerHTML = '<li style="color:#aaa;font-style:italic">Scope of services to be confirmed by Good Company.</li>';
    }
  }

  const unsignedSection    = document.getElementById('contract-unsigned-section');
  const clientSignedSection = document.getElementById('contract-client-signed-section');
  const executedSection    = document.getElementById('contract-executed-section');

  // Strip highlights once fully executed
  const contractCard = document.getElementById('contract-print-area');
  if (contractCard) {
    contractCard.classList.toggle('contract-executed', !!(contract.signedAt && contract.adminSignedAt));
  }

  if (contract.signedAt && contract.adminSignedAt) {
    // FULLY EXECUTED
    unsignedSection.classList.add('hidden');
    clientSignedSection.classList.add('hidden');
    executedSection.classList.remove('hidden');

    const execDate = document.getElementById('contract-executed-date');
    if (execDate) execDate.textContent = ' — ' + new Date(contract.adminSignedAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

    toggleContractFieldsReadonly(true, cl);

    const execFields = document.getElementById('executed-fields-summary');
    if (execFields) execFields.innerHTML = _signedFieldsSummaryHTML(cl);

    const execSigBlock = document.getElementById('executed-sig-block');
    if (execSigBlock) execSigBlock.innerHTML = _sigBlockHTML(contract, true);

  } else if (contract.signedAt) {
    // CLIENT SIGNED — AWAITING COUNTER-SIG
    unsignedSection.classList.add('hidden');
    clientSignedSection.classList.remove('hidden');
    executedSection.classList.add('hidden');

    toggleContractFieldsReadonly(true, cl);

    const signedFields = document.getElementById('signed-fields-summary');
    if (signedFields) signedFields.innerHTML = _signedFieldsSummaryHTML(cl);

    const signedSigBlock = document.getElementById('signed-sig-display-block');
    if (signedSigBlock) signedSigBlock.innerHTML = _sigBlockHTML(contract, false);

  } else {
    // UNSIGNED — client can fill in fields
    unsignedSection.classList.remove('hidden');
    clientSignedSection.classList.add('hidden');
    executedSection.classList.add('hidden');

    toggleContractFieldsReadonly(false, cl);

    // Pre-fill Event Details inputs
    document.getElementById('cc-start-time').value = cl.startTime || '';
    document.getElementById('cc-end-time').value   = cl.endTime   || '';
    document.getElementById('cc-venue').value      = cl.venue     || '';

    // Pre-fill Section 22 contact inputs
    document.getElementById('cc-contact-name').value = cl.contactName || client.name || '';
    document.getElementById('cc-address').value      = cl.address   || '';
    document.getElementById('cc-email').value        = cl.email     || '';
    document.getElementById('cc-phone').value        = cl.phone     || '';

    document.getElementById('cc-sig-client-name').textContent = a.clientName || client.name;
    document.getElementById('cc-sig-date').value = cl.sigDate || new Date().toISOString().slice(0,10);

    if (cl.dressCode) {
      document.querySelectorAll('input[name="dress-code"]').forEach(r => { r.checked = r.value === cl.dressCode; });
    }
    if (cl.paymentMethod) {
      document.querySelectorAll('input[name="payment-method"]').forEach(r => { r.checked = r.value === cl.paymentMethod; });
    }
    if (cl.consent) {
      document.querySelectorAll('input[name="consent"]').forEach(r => { r.checked = r.value === cl.consent; });
    }

    initSignatureCanvas();

  }
}

function _signedFieldsSummaryHTML(cl) {
  const row = (label, val) => `<div style="display:flex;gap:16px;padding:8px 0;border-bottom:1px solid #f0efec;font-family:var(--font-sans);font-size:13px">
    <span style="width:160px;color:#888;flex-shrink:0">${label}</span>
    <span style="color:var(--navy);font-weight:600">${escHtml(val||'—')}</span>
  </div>`;
  return `<div style="margin:16px 0;border:1px solid #e8e6e0;border-radius:8px;padding:4px 16px 4px;background:#fafaf8">
    ${row('Start Time', cl.startTime ? fmtTime12(cl.startTime) : '—')}
    ${row('End Time',   cl.endTime   ? fmtTime12(cl.endTime)   : '—')}
    ${row('Venue',      cl.venue)}
    ${row('Name',       cl.contactName)}
    ${row('Address',    cl.address)}
    ${row('Email',      cl.email)}
    ${row('Phone',      cl.phone)}
    ${row('Dress Code', cl.dressCode)}
    ${row('Payment Method', cl.paymentMethod)}
    ${row('Photo/Video Consent', cl.consent)}
  </div>`;
}

function _sigBlockHTML(contract, showAdmin) {
  const cl        = contract.client || {};
  const clientSig = contract.signatureData ? `<img src="${contract.signatureData}" class="signature-img" alt="Client signature">` : '<div style="height:80px;border:1px dashed #ccc;border-radius:6px"></div>';
  const clientDate = contract.signedAt ? 'Signed: ' + new Date(contract.signedAt).toLocaleDateString() : '';
  let adminCol = '';
  if (showAdmin) {
    const artistSig  = contract.adminSignatureData ? `<img src="${contract.adminSignatureData}" class="signature-img" alt="Artist signature">` : '';
    const artistDate = contract.adminSignedAt ? 'Signed: ' + new Date(contract.adminSignedAt).toLocaleDateString() : '';
    adminCol = `<div class="sig-col">
      <div class="sig-col-label">Good Company (Artist)</div>
      ${artistSig}
      <div style="font-family:var(--font-sans);font-size:11px;color:#888;margin-top:6px">${artistDate}</div>
    </div>`;
  }
  return `<div class="sig-col">
    <div class="sig-col-label">Client Signature</div>
    ${clientSig}
    <div style="font-family:var(--font-sans);font-size:11px;color:#888;margin-top:6px">${clientDate}</div>
  </div>${adminCol}`;
}

function toggleContractFieldsReadonly(signed, cl) {
  // Hide time hints when signed
  ['cc-start-time-hint', 'cc-end-time-hint'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', signed);
  });

  const pairs = [
    { input: 'cc-start-time',    display: 'cc-start-time-display',    val: cl.startTime   ? fmtTime12(cl.startTime) : '—' },
    { input: 'cc-end-time',      display: 'cc-end-time-display',      val: cl.endTime     ? fmtTime12(cl.endTime)   : '—' },
    { input: 'cc-venue',         display: 'cc-venue-display',         val: cl.venue       || '—' },
    { input: 'cc-contact-name',  display: 'cc-contact-name-display',  val: cl.contactName || '—' },
    { input: 'cc-address',       display: 'cc-address-display',       val: cl.address     || '—' },
    { input: 'cc-email',         display: 'cc-email-display',         val: cl.email       || '—' },
    { input: 'cc-phone',         display: 'cc-phone-display',         val: cl.phone       || '—' }
  ];
  pairs.forEach(p => {
    const inp = document.getElementById(p.input);
    const dis = document.getElementById(p.display);
    if (inp) inp.classList.toggle('hidden', signed);
    if (dis) { dis.classList.toggle('hidden', !signed); dis.textContent = p.val; }
  });

  // Payment method radio group
  const pmOptions = document.getElementById('payment-method-options');
  const pmSigned  = document.getElementById('payment-method-signed-display');
  const pmLabelU  = document.getElementById('payment-method-label-unsigned');
  const pmLabelS  = document.getElementById('payment-method-label-signed');
  if (pmOptions) pmOptions.classList.toggle('hidden', signed);
  if (pmSigned)  { pmSigned.classList.toggle('hidden', !signed); pmSigned.textContent = cl.paymentMethod || '—'; }
  if (pmLabelU)  pmLabelU.classList.toggle('hidden', signed);
  if (pmLabelS)  pmLabelS.classList.toggle('hidden', !signed);

  // Attire radio group
  const atOptions = document.getElementById('attire-options');
  const atSigned  = document.getElementById('attire-signed-display');
  const atLabelU  = document.getElementById('attire-label-unsigned');
  const atLabelS  = document.getElementById('attire-label-signed');
  if (atOptions) atOptions.classList.toggle('hidden', signed);
  if (atSigned)  { atSigned.classList.toggle('hidden', !signed); atSigned.textContent = cl.dressCode || '—'; }
  if (atLabelU)  atLabelU.classList.toggle('hidden', signed);
  if (atLabelS)  atLabelS.classList.toggle('hidden', !signed);

  // Consent radio group
  const cnOptions = document.getElementById('consent-options');
  const cnSigned  = document.getElementById('consent-signed-display');
  const cnLabelU  = document.getElementById('consent-label-unsigned');
  const cnLabelS  = document.getElementById('consent-label-signed');
  if (cnOptions) cnOptions.classList.toggle('hidden', signed);
  if (cnSigned)  { cnSigned.classList.toggle('hidden', !signed); cnSigned.textContent = cl.consent || '—'; }
  if (cnLabelU)  cnLabelU.classList.toggle('hidden', signed);
  if (cnLabelS)  cnLabelS.classList.toggle('hidden', !signed);
}

/* ---- Signature Canvas ---- */
let _sigCanvas, _sigCtx, _sigDrawing = false;

function initSignatureCanvas() {
  _sigCanvas  = document.getElementById('signature-canvas');
  if (!_sigCanvas) return;
  _sigCtx     = _sigCanvas.getContext('2d');
  _sigDrawing = false;

  const dpr  = window.devicePixelRatio || 1;
  const rect = _sigCanvas.getBoundingClientRect();
  if (rect.width > 0) {
    _sigCanvas.width  = rect.width  * dpr;
    _sigCanvas.height = rect.height * dpr;
    _sigCtx.scale(dpr, dpr);
  }
  _sigCtx.strokeStyle = '#153147';
  _sigCtx.lineWidth   = 2;
  _sigCtx.lineCap     = 'round';
  _sigCtx.lineJoin    = 'round';

  function pos(e) {
    const r = _sigCanvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: s.clientX - r.left, y: s.clientY - r.top };
  }
  const start = e => { e.preventDefault(); _sigDrawing=true; const p=pos(e); _sigCtx.beginPath(); _sigCtx.moveTo(p.x,p.y); };
  const draw  = e => { if(!_sigDrawing)return; e.preventDefault(); const p=pos(e); _sigCtx.lineTo(p.x,p.y); _sigCtx.stroke(); };
  const stop  = ()  => { _sigDrawing=false; };

  const clone = _sigCanvas.cloneNode(true);
  _sigCanvas.parentNode.replaceChild(clone, _sigCanvas);
  _sigCanvas = clone;
  _sigCtx    = _sigCanvas.getContext('2d');
  if (rect.width > 0) { _sigCanvas.width=rect.width*dpr; _sigCanvas.height=rect.height*dpr; _sigCtx.scale(dpr,dpr); }
  _sigCtx.strokeStyle='#153147'; _sigCtx.lineWidth=2; _sigCtx.lineCap='round'; _sigCtx.lineJoin='round';

  _sigCanvas.addEventListener('mousedown',  start, {passive:false});
  _sigCanvas.addEventListener('mousemove',  draw,  {passive:false});
  _sigCanvas.addEventListener('mouseup',    stop);
  _sigCanvas.addEventListener('mouseleave', stop);
  _sigCanvas.addEventListener('touchstart', start, {passive:false});
  _sigCanvas.addEventListener('touchmove',  draw,  {passive:false});
  _sigCanvas.addEventListener('touchend',   stop);

  // Re-wire clear button after canvas swap
  const clearBtn = document.getElementById('sig-clear');
  if (clearBtn) {
    clearBtn.onclick = () => _sigCtx.clearRect(0, 0, _sigCanvas.width, _sigCanvas.height);
  }
}

function isSignatureEmpty() {
  if (!_sigCanvas || !_sigCtx) return true;
  const d = _sigCtx.getImageData(0, 0, _sigCanvas.width, _sigCanvas.height).data;
  return !Array.from(d).some((v, i) => i % 4 === 3 && v > 0);
}

/* ---- Admin counter-signature canvas ---- */
let _adminSigCanvas, _adminSigCtx, _adminSigDrawing = false;

function initAdminSigCanvas() {
  _adminSigCanvas = document.getElementById('admin-sig-canvas');
  if (!_adminSigCanvas) return;

  const dpr  = window.devicePixelRatio || 1;
  const rect = _adminSigCanvas.getBoundingClientRect();

  const clone = _adminSigCanvas.cloneNode(true);
  _adminSigCanvas.parentNode.replaceChild(clone, _adminSigCanvas);
  _adminSigCanvas = clone;
  _adminSigCtx    = _adminSigCanvas.getContext('2d');
  _adminSigDrawing = false;

  if (rect.width > 0) {
    _adminSigCanvas.width  = rect.width  * dpr;
    _adminSigCanvas.height = rect.height * dpr;
    _adminSigCtx.scale(dpr, dpr);
  }
  _adminSigCtx.strokeStyle = '#153147';
  _adminSigCtx.lineWidth   = 2;
  _adminSigCtx.lineCap     = 'round';
  _adminSigCtx.lineJoin    = 'round';

  function pos(e) {
    const r = _adminSigCanvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: s.clientX - r.left, y: s.clientY - r.top };
  }
  const start = e => { e.preventDefault(); _adminSigDrawing=true; const p=pos(e); _adminSigCtx.beginPath(); _adminSigCtx.moveTo(p.x,p.y); };
  const draw  = e => { if(!_adminSigDrawing)return; e.preventDefault(); const p=pos(e); _adminSigCtx.lineTo(p.x,p.y); _adminSigCtx.stroke(); };
  const stop  = ()  => { _adminSigDrawing=false; };

  _adminSigCanvas.addEventListener('mousedown',  start, {passive:false});
  _adminSigCanvas.addEventListener('mousemove',  draw,  {passive:false});
  _adminSigCanvas.addEventListener('mouseup',    stop);
  _adminSigCanvas.addEventListener('mouseleave', stop);
  _adminSigCanvas.addEventListener('touchstart', start, {passive:false});
  _adminSigCanvas.addEventListener('touchmove',  draw,  {passive:false});
  _adminSigCanvas.addEventListener('touchend',   stop);

  const clearBtn = document.getElementById('admin-sig-clear');
  if (clearBtn) clearBtn.onclick = () => _adminSigCtx.clearRect(0, 0, _adminSigCanvas.width, _adminSigCanvas.height);
}

function isAdminSigEmpty() {
  if (!_adminSigCanvas || !_adminSigCtx) return true;
  const d = _adminSigCtx.getImageData(0, 0, _adminSigCanvas.width, _adminSigCanvas.height).data;
  return !Array.from(d).some((v, i) => i % 4 === 3 && v > 0);
}

function adminCounterSign(clientId) {
  if (isAdminSigEmpty()) { showToast('Please provide your signature.'); return; }
  const sigDate = document.getElementById('admin-sig-date').value;
  if (!sigDate) { showToast('Please enter the date.'); return; }

  const contract             = DB.getContract(clientId);
  contract.adminSignatureData = _adminSigCanvas.toDataURL('image/png');
  contract.adminSignedAt     = new Date(sigDate).getTime() || Date.now();
  DB.setContract(clientId, contract);

  showToast('Agreement fully executed!');
  openClientDetail(clientId);
}

/* ============================================
   CONTRACT LANGUAGE EDITOR
   ============================================ */

// Snapshot of original section HTML captured at DOMContentLoaded, before any render
// modifies the live DOM. _sectionBaseHTML uses this so the comparison baseline never drifts.
const _CONTRACT_HTML_DEFAULTS = {};

const CONTRACT_SECTIONS = [
  { key: 'clientReqs',      label: '3. Client Requirements' },
  { key: 'gcp',             label: '6. Good Company Planner' },
  { key: 'songRequests',    label: '7. Song Requests' },
  { key: 'attire',          label: '8. Attire' },
  { key: 'serviceGuarantee',label: '9. Personal Service Guarantee' },
  { key: 'accessSetup',     label: '10. Access and Setup' },
  { key: 'attendance',      label: '11. Attendance' },
  { key: 'legal',           label: '13. Legal and Liability' },
  { key: 'actsOfGod',       label: '14. Acts of God' },
  { key: 'indemnification', label: '15. Client Indemnification' },
  { key: 'assignability',   label: '16. Assignability' },
  { key: 'contractor',      label: '17. Independent Contractor' },
  { key: 'entireAgreement', label: '18. Entire Agreement' },
  { key: 'modification',    label: '19. Modification' },
  { key: 'waiver',          label: '20. Waiver' },
  { key: 'governingLaw',    label: '21. Governing Law' }
];

function _sectionBaseHTML(key) {
  // Priority: master contract override, then the original page HTML (captured at load time).
  // Never reads the live DOM — renderClientContract modifies scope-services-list, so reading
  // the live DOM would give a drifting baseline that causes false "modified" detections.
  const master = DB.getMasterContract();
  if (master[key]) return master[key];
  return _CONTRACT_HTML_DEFAULTS[key] || '';
}

function renderLangEditor(clientId) {
  const container = document.getElementById('lang-editor-sections');
  if (!container) return;
  const contract   = DB.getContract(clientId);
  const customText = contract.customText || {};

  container.innerHTML = CONTRACT_SECTIONS.map(s => {
    const baseHTML    = _sectionBaseHTML(s.key);
    const currentHTML = customText[s.key] || baseHTML;
    const isCustom    = !!customText[s.key];
    return `<div class="lang-section-block">
      <div class="lang-section-block-label">
        <span>${escHtml(s.label)}${isCustom ? ' <span class="lang-custom-badge">Custom</span>' : ''}</span>
        <button type="button" class="lang-reset-btn" data-section="${s.key}" title="Reset to master/default">Reset</button>
      </div>
      <div class="lang-section-edit" id="lang-${s.key}" contenteditable="true">${currentHTML}</div>
    </div>`;
  }).join('');

  container.querySelectorAll('.lang-reset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const edit = document.getElementById('lang-' + this.dataset.section);
      if (edit) edit.innerHTML = _sectionBaseHTML(this.dataset.section);
    });
  });
}

function saveLangOverrides(clientId) {
  const contract   = DB.getContract(clientId);
  const customText = {};
  CONTRACT_SECTIONS.forEach(s => {
    const el = document.getElementById('lang-' + s.key);
    if (!el) return;
    const currentHTML = el.innerHTML.trim();
    const baseHTML    = _sectionBaseHTML(s.key);
    if (currentHTML !== baseHTML) customText[s.key] = currentHTML;
  });
  contract.customText = customText;
  DB.setContract(clientId, contract);
  flashSaved('lang-saved-confirm');
  showToast('Contract language saved.');
}

function applyLangOverrides(contract) {
  const masterText = DB.getMasterContract();
  const customText = contract.customText || {};
  CONTRACT_SECTIONS.forEach(s => {
    const el = document.querySelector('[data-contract-section="' + s.key + '"]');
    if (!el) return;
    // Priority: per-client override → master contract → HTML default
    if (customText[s.key]) {
      el.innerHTML = customText[s.key];
    } else if (masterText[s.key]) {
      el.innerHTML = masterText[s.key];
    }
  });
}

/* ============================================
   ADMIN MASTER CONTRACT EDITOR
   ============================================ */

function renderMasterContractEditor() {
  const container  = document.getElementById('master-contract-sections');
  if (!container) return;
  const masterText = DB.getMasterContract();

  container.innerHTML = CONTRACT_SECTIONS.map(s => {
    const htmlDefault = _CONTRACT_HTML_DEFAULTS[s.key] || '';
    const currentHTML = masterText[s.key] || htmlDefault;
    const isOverride  = !!masterText[s.key];
    return `<div class="lang-section-block">
      <div class="lang-section-block-label">
        <span>${escHtml(s.label)}${isOverride ? ' <span class="lang-custom-badge">Modified</span>' : ''}</span>
        <button type="button" class="lang-reset-btn master-reset-btn" data-section="${s.key}" title="Reset to original HTML default">Reset to Original</button>
      </div>
      <div class="lang-section-edit" id="master-lang-${s.key}" contenteditable="true">${currentHTML}</div>
    </div>`;
  }).join('');

  container.querySelectorAll('.master-reset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const edit = document.getElementById('master-lang-' + this.dataset.section);
      if (edit) edit.innerHTML = _CONTRACT_HTML_DEFAULTS[this.dataset.section] || '';
    });
  });
}

function saveMasterContract() {
  const masterText = {};
  CONTRACT_SECTIONS.forEach(s => {
    const el = document.getElementById('master-lang-' + s.key);
    if (!el) return;
    const htmlDefault = _CONTRACT_HTML_DEFAULTS[s.key] || '';
    const currentHTML = el.innerHTML.trim();
    if (currentHTML !== htmlDefault) masterText[s.key] = currentHTML;
  });
  DB.setMasterContract(masterText);
  flashSaved('master-contract-saved');
  showToast('Master contract saved. All future contracts will use this language.');
}

/* ============================================
   CLIENT SONG SELECTOR (checkbox version)
   ============================================ */

function _normalizePref(v) {
  // Migrate old 'Other Request' value → 'Yes'
  if (v === 'Other Request') return 'Yes';
  return v;
}

function _songSelectionCounts(prefs) {
  const priorityCount = Object.values(prefs).filter(v => v === 'Priority').length;
  const yesCount      = Object.values(prefs).filter(v => v === 'Yes').length;
  return { priorityCount, yesCount, total: priorityCount + yesCount };
}

function renderSongSelector(clientId) {
  const client   = DB.getClients().find(c => c.id === clientId);
  const gcp      = DB.getGCP(clientId);
  const rawPrefs = gcp.songs || {};
  const prefs    = {};
  Object.keys(rawPrefs).forEach(k => { prefs[k] = _normalizePref(rawPrefs[k]); });

  const query    = (document.getElementById('song-selector-search').value || '').toLowerCase();
  const allSongs = DB.getMasterSongs().filter(s =>
    !query || s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
  );
  const newSongs = allSongs.filter(s => s.addedAt > client.createdAt);

  const { total } = _songSelectionCounts(prefs);
  const labelEl = document.getElementById('songs-selected-count');
  if (labelEl) labelEl.textContent = total + ' song' + (total === 1 ? '' : 's') + ' marked';


  function songHTML(s) {
    const isNew = s.addedAt > client.createdAt;
    const pref  = prefs[s.id] || '';
    const newBadge = (isNew && !pref) ? ' <span class="song-new-badge">New</span>' : '';
    const chk = (val) => pref === val ? 'checked' : '';
    return `<div class="song-item">
      <div class="song-info">
        <div class="song-title">${escHtml(s.title)}${newBadge}</div>
        <div class="song-artist">${escHtml(s.artist)}</div>
      </div>
      <div class="song-check-cell priority-cell">
        <input type="checkbox" data-song-id="${s.id}" data-pref="Priority"
          onchange="updateSongPref('${clientId}','${s.id}','Priority',this.checked)"
          ${chk('Priority')}>
      </div>
      <div class="song-check-cell yes-cell">
        <input type="checkbox" data-song-id="${s.id}" data-pref="Yes"
          onchange="updateSongPref('${clientId}','${s.id}','Yes',this.checked)"
          ${chk('Yes')}>
      </div>
      <div class="song-check-cell dnp-cell">
        <input type="checkbox" data-song-id="${s.id}" data-pref="Do Not Play"
          onchange="updateSongPref('${clientId}','${s.id}','Do Not Play',this.checked)"
          ${chk('Do Not Play')}>
      </div>
    </div>`;
  }

  const newSection = document.getElementById('new-songs-section');
  const newList    = document.getElementById('new-songs-list');
  if (newSongs.length && !query) {
    newSection.classList.remove('hidden');
    newList.innerHTML = newSongs.map(songHTML).join('');
  } else {
    newSection.classList.add('hidden');
  }
  document.getElementById('all-songs-list').innerHTML = allSongs.map(songHTML).join('');

  renderSongRequests(clientId);
}

function updateSongPref(clientId, songId, pref, checked) {
  const gcp   = DB.getGCP(clientId);
  const prefs = {};
  Object.keys(gcp.songs || {}).forEach(k => { prefs[k] = _normalizePref(gcp.songs[k]); });

  // Radio behavior: one option per song
  if (checked) {
    prefs[songId] = pref;
  } else {
    delete prefs[songId];
  }

  gcp.songs = prefs;
  DB.setGCP(clientId, gcp);
  renderSongSelector(clientId);
}

function renderSongRequests(clientId) {
  const gcp      = DB.getGCP(clientId);
  const requests = gcp.songRequests || [];

  const priority = requests.filter(r => r.type === 'Priority');
  const other    = requests.filter(r => r.type === 'Other');

  const prioEl = document.getElementById('req-priority-count');
  const otherEl = document.getElementById('req-other-count');
  if (prioEl)  prioEl.textContent  = priority.length;
  if (otherEl) otherEl.textContent = other.length;

  const container = document.getElementById('song-requests-list');
  if (!container) return;

  if (!requests.length) {
    container.innerHTML = '<p class="req-empty-msg">No song requests yet. Add one below.</p>';
    return;
  }

  function reqHTML(r) {
    const cls = r.type === 'Priority' ? 'req-item-priority' : 'req-item-other';
    const badge = r.type === 'Priority'
      ? '<span class="req-type-badge req-badge-priority"><i class="fas fa-star"></i> Priority</span>'
      : '<span class="req-type-badge req-badge-other"><i class="fas fa-music"></i> Other</span>';
    return `<div class="song-request-item ${cls}">
      <div class="song-info">
        <div class="song-title">${escHtml(r.title)}</div>
        <div class="song-artist">${escHtml(r.artist)}</div>
      </div>
      ${badge}
      <button class="song-delete-btn" onclick="deleteSongRequest('${clientId}','${r.id}')" title="Remove request">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>`;
  }

  container.innerHTML =
    priority.map(reqHTML).join('') +
    other.map(reqHTML).join('');
}

function addSongRequest(clientId) {
  const titleEl  = document.getElementById('req-title');
  const artistEl = document.getElementById('req-artist');
  const typeEl   = document.querySelector('input[name="req-type"]:checked');

  const title  = (titleEl  ? titleEl.value.trim()  : '');
  const artist = (artistEl ? artistEl.value.trim() : '');
  const type   = typeEl ? typeEl.value : 'Other';

  if (!title || !artist) { showToast('Please enter both a song title and artist.'); return; }

  const gcp      = DB.getGCP(clientId);
  const requests = gcp.songRequests || [];

  if (type === 'Priority') {
    const prioCount = requests.filter(r => r.type === 'Priority').length;
    if (prioCount >= 2) {
      showToast('Maximum 2 Priority song requests. Remove one first.');
      return;
    }
  }

  const total = requests.length;
  if (total >= 20) { showToast('Maximum 20 song requests reached.'); return; }

  requests.push({ id: uid(), title, artist, type, addedAt: Date.now() });
  gcp.songRequests = requests;
  DB.setGCP(clientId, gcp);

  if (titleEl)  titleEl.value  = '';
  if (artistEl) artistEl.value = '';
  // Reset type to Other
  const otherRadio = document.querySelector('input[name="req-type"][value="Other"]');
  if (otherRadio) otherRadio.checked = true;

  renderSongRequests(clientId);
}

function deleteSongRequest(clientId, requestId) {
  const gcp      = DB.getGCP(clientId);
  gcp.songRequests = (gcp.songRequests || []).filter(r => r.id !== requestId);
  DB.setGCP(clientId, gcp);
  renderSongRequests(clientId);
}

function saveSongSelections(clientId) {
  const songs      = DB.getGCP(clientId).songs || {};
  const catalog    = DB.getMasterSongs();
  const dnpCount   = catalog.filter(s => songs[s.id] === 'Do Not Play').length;
  const maxAllowed = Math.floor(catalog.length * 0.5);

  if (dnpCount > maxAllowed) {
    showToast(
      "You’ve marked more than 50% of our catalog as Do Not Play. " +
      "Please remove some selections so the band has enough material to fill your event.",
      6000
    );
    return;
  }

  showToast('Song selections saved!');
  renderClientDash(clientId);
  showView('view-client-dash');
  setNavSection('Client Portal');
}

/* ============================================
   CLIENT CHECKLIST
   ============================================ */
const CHECKLIST_FIELDS = [
  'cl-arrival-time','cl-loadinlocation','cl-parking','cl-parking-payment',
  'cl-dressing-room','cl-guest-arrival','cl-cocktail-sep','cl-cocktail-outdoor',
  'cl-cocktail-start','cl-cocktail-end','cl-cocktail-spotify','cl-coordinator',
  'cl-wifi-name','cl-wifi-pass','cl-stage-size','cl-outdoor','cl-power',
  'cl-reception-start','cl-dinner-time','cl-dinner-style','cl-table-announce',
  'cl-meals','cl-band-eat','cl-speeches','cl-first-dance','cl-parent-dances',
  'cl-dance-floor','cl-reception-end','cl-attendance','cl-loadout',
  'cl-announce-party','cl-announce-party-how','cl-party-names','cl-spotify-party',
  'cl-grand-entrance','cl-couple-announce','cl-spotify-couple',
  'cl-spotify-dinner','cl-spotify-break'
];

function _applyChecklistVisibility(clientId) {
  // Cocktail Spotify: hide when Jazz Cocktail Band is in scope
  const contract = DB.getContract(clientId);
  const scope = (contract.admin && contract.admin.scopeOfServices) || [];
  const wrap = document.getElementById('cl-cocktail-spotify-wrap');
  if (wrap) wrap.classList.toggle('hidden', scope.includes('Jazz Cocktail Band'));

  // Wedding party entrance
  const announceParty = document.getElementById('cl-announce-party');
  const showParty = announceParty && announceParty.value === 'Yes';
  ['cl-announce-party-how-wrap','cl-party-names-wrap','cl-spotify-party-wrap'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !showParty);
  });

  // Couple grand entrance
  const grandEntrance = document.getElementById('cl-grand-entrance');
  const showCouple = grandEntrance && grandEntrance.value === 'Yes';
  ['cl-couple-announce-wrap','cl-spotify-couple-wrap'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !showCouple);
  });
}

function loadChecklist(clientId) {
  const cl = DB.getGCP(clientId).checklist || {};
  CHECKLIST_FIELDS.forEach(id => { const el = document.getElementById(id); if (el && cl[id] !== undefined) el.value = cl[id]; });
  _applyChecklistVisibility(clientId);
}

function saveChecklist(clientId) {
  const gcp = DB.getGCP(clientId);
  const cl  = {};
  CHECKLIST_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) cl[id] = el.value; });
  gcp.checklist = cl;
  DB.setGCP(clientId, gcp);
  showToast('Checklist saved!');
  flashSaved('checklist-saved-confirm');
}

/* ============================================
   CLIENT CEREMONY PLANNER
   ============================================ */
const CEREMONY_FIELDS = [
  'cer-start','cer-end','cer-officiant-mic','cer-readers-mic',
  'cer-sep-location','cer-distance','cer-outdoor','cer-power',
  'cer-seating-genre',
  'cer-live-family-song','cer-live-family-link',
  'cer-live-bride-song','cer-live-bride-link',
  'cer-live-exit-song','cer-live-exit-link','cer-live-notes',
  'cer-duties-seating-link','cer-duties-family-link',
  'cer-duties-bride-link','cer-duties-exit-link','cer-duties-notes'
];

function loadCeremony(clientId) {
  const cer = DB.getGCP(clientId).ceremony || {};
  const contract = DB.getContract(clientId);
  const scope = (contract.admin && contract.admin.scopeOfServices) || [];
  const isLive = scope.includes('Live Ceremony Music');
  const isDuties = scope.includes('Ceremony Duties');
  const livePanel = document.getElementById('cer-music-live');
  const dutiesPanel = document.getElementById('cer-music-duties');
  if (livePanel) livePanel.classList.toggle('hidden', !isLive);
  if (dutiesPanel) dutiesPanel.classList.toggle('hidden', !isDuties);
  CEREMONY_FIELDS.forEach(id => { const el = document.getElementById(id); if (el && cer[id] !== undefined) el.value = cer[id]; });
}

function saveCeremony(clientId) {
  const gcp = DB.getGCP(clientId);
  const cer = {};
  CEREMONY_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) cer[id] = el.value; });
  gcp.ceremony = cer;
  DB.setGCP(clientId, gcp);
  showToast('Ceremony planner saved!');
  flashSaved('ceremony-saved-confirm');
}

/* ============================================
   CLIENT MANAGEMENT
   ============================================ */
function addClient(name, email, password, eventDate) {
  const clients = DB.getClients();
  if (clients.find(c => c.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, error: 'A client with this email already exists.' };
  const client = { id: uid(), name: name.trim(), email: email.trim().toLowerCase(), password, eventDate: eventDate || '', createdAt: Date.now() };
  clients.push(client);
  DB.setClients(clients);
  return { ok: true, client };
}

let _deleteClientId = null;
function confirmDeleteClient(clientId) {
  _deleteClientId = clientId;
  const client = DB.getClients().find(c => c.id === clientId);
  document.getElementById('confirm-title').textContent = 'Delete Client';
  document.getElementById('confirm-body').textContent  =
    `Delete ${client ? client.name : 'this client'}? This permanently removes all their data.`;
  openModal('modal-confirm');
}

function deleteClient(clientId) {
  DB.setClients(DB.getClients().filter(c => c.id !== clientId));
  ['gc_contracts','gc_gcp'].forEach(key => {
    const all = DB._get(key) || {};
    delete all[clientId];
    DB._set(key, all);
  });
  showToast('Client deleted.');
  renderAdminDash();
  showView('view-admin-dash');
}

/* ============================================
   BOOTSTRAP
   ============================================ */
function bootstrap() {
  initSeedData();
  const session = getSession();
  if (!session) { showView('view-login'); updateNav(null); return; }
  updateNav(session);
  if (session.role === 'admin') { renderAdminDash(); showView('view-admin-dash'); }
  else { renderClientDash(session.clientId); showView('view-client-dash'); }
}

/* ============================================
   EVENT LISTENERS
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
  // Capture original contract section HTML before any renders modify the DOM.
  CONTRACT_SECTIONS.forEach(s => {
    const el = document.querySelector('[data-contract-section="' + s.key + '"]');
    if (el) _CONTRACT_HTML_DEFAULTS[s.key] = el.innerHTML.trim();
  });

  bootstrap();

  /* ---- Login ---- */
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const errEl  = document.getElementById('login-error');
    const result = login(
      document.getElementById('login-email').value,
      document.getElementById('login-password').value
    );
    if (!result.ok) { errEl.textContent = result.error; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    updateNav(getSession());
    if (result.role === 'admin') { renderAdminDash(); showView('view-admin-dash'); }
    else { renderClientDash(result.clientId); showView('view-client-dash'); }
  });

  /* ---- Logout ---- */
  document.getElementById('pnav-logout').addEventListener('click', logout);

  /* ---- Admin: client search ---- */
  document.getElementById('client-search').addEventListener('input', renderAdminDash);

  /* ---- Admin: Add client ---- */
  document.getElementById('btn-add-client').addEventListener('click', function() {
    document.getElementById('add-client-form').reset();
    document.getElementById('add-client-error').classList.add('hidden');
    openModal('modal-add-client');
  });

  document.getElementById('add-client-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name  = document.getElementById('new-client-name').value.trim();
    const email = document.getElementById('new-client-email').value.trim();
    const pw    = document.getElementById('new-client-password').value;
    const date  = document.getElementById('new-client-event-date').value;
    const errEl = document.getElementById('add-client-error');
    if (!name || !email || !pw) { errEl.textContent='Name, email, and password are required.'; errEl.classList.remove('hidden'); return; }
    const result = addClient(name, email, pw, date);
    if (!result.ok) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    closeModal('modal-add-client');
    renderAdminDash();
    showToast('Client added: ' + name);
  });

  /* ---- Admin: contract auto-calc ---- */
  ['ac-performance-fee','ac-transportation','ac-lodging'].forEach(id => {
    document.getElementById(id).addEventListener('input', calcContractTotals);
  });

  /* ---- Admin: save contract ---- */
  document.getElementById('admin-contract-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentAdminClientId) return;
    const contract = DB.getContract(currentAdminClientId);
    const fee   = parseFloat(document.getElementById('ac-performance-fee').value) || 0;
    const trans = parseFloat(document.getElementById('ac-transportation').value)  || 0;
    const lodge = parseFloat(document.getElementById('ac-lodging').value)          || 0;
    const checkedServices = Array.from(
      document.querySelectorAll('input[name="scope-service"]:checked')
    ).map(cb => cb.value);

    contract.admin = {
      clientName:      document.getElementById('ac-client-name').value,
      eventDate:       document.getElementById('ac-event-date').value,
      performanceFee:  document.getElementById('ac-performance-fee').value,
      transportation:  document.getElementById('ac-transportation').value,
      lodging:         document.getElementById('ac-lodging').value,
      totalCost:       fee + trans + lodge,
      deposit:         (fee + trans + lodge) * 0.25,
      finalBalance:    (fee + trans + lodge) * 0.75,
      scopeOfServices: checkedServices
    };
    DB.setContract(currentAdminClientId, contract);
    flashSaved('admin-contract-saved');
    showToast('Contract info saved.');
    const cs = contractStatus(currentAdminClientId);
    const badge = document.getElementById('admin-contract-badge');
    badge.className   = 'status-badge ' + cs.cls;
    badge.textContent = cs.label;
  });

  /* ---- Admin: back from client detail ---- */
  document.getElementById('admin-client-back').addEventListener('click', function() {
    renderAdminDash(); showView('view-admin-dash'); setNavSection('Admin Portal');
  });

  /* ---- Admin: delete client ---- */
  document.getElementById('btn-delete-client').addEventListener('click', function() {
    if (currentAdminClientId) confirmDeleteClient(currentAdminClientId);
  });

  /* ---- Admin: master contract ---- */
  document.getElementById('btn-master-contract').addEventListener('click', function() {
    renderMasterContractEditor(); showView('view-master-contract'); setNavSection('Master Contract');
  });
  document.getElementById('master-contract-back').addEventListener('click', function() {
    renderAdminDash(); showView('view-admin-dash'); setNavSection('Admin Portal');
  });
  document.getElementById('btn-save-master-contract').addEventListener('click', function() {
    saveMasterContract();
  });

  /* ---- Admin: manage songs ---- */
  document.getElementById('btn-manage-songs').addEventListener('click', function() {
    renderMasterSongList(); showView('view-admin-songs'); setNavSection('Master Song List');
  });
  document.getElementById('admin-songs-back').addEventListener('click', function() {
    renderAdminDash(); showView('view-admin-dash'); setNavSection('Admin Portal');
  });

  /* ---- Admin: add song ---- */
  document.getElementById('btn-add-song').addEventListener('click', function() {
    document.getElementById('add-song-form').reset();
    document.getElementById('add-song-error').classList.add('hidden');
    openModal('modal-add-song');
  });
  document.getElementById('add-song-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title  = document.getElementById('new-song-title').value.trim();
    const artist = document.getElementById('new-song-artist').value.trim();
    const errEl  = document.getElementById('add-song-error');
    if (!title || !artist) { errEl.textContent='Title and artist are required.'; errEl.classList.remove('hidden'); return; }
    if (!addSong(title, artist)) { errEl.textContent='That song is already in the list.'; errEl.classList.remove('hidden'); return; }
    closeModal('modal-add-song');
    renderMasterSongList();
    showToast('"' + title + '" added to catalog.');
  });
  document.getElementById('song-search').addEventListener('input', renderMasterSongList);

  /* ---- Client: back buttons ---- */
  document.querySelectorAll('.client-back').forEach(btn => {
    btn.addEventListener('click', function() {
      const s = getSession();
      if (s) renderClientDash(s.clientId);
      showView('view-client-dash');
      setNavSection('Client Portal');
    });
  });

  /* ---- Client: module cards ---- */
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', function() {
      const target = this.dataset.view;
      const s = getSession();
      if (!s || s.role !== 'client') return;
      if (target === 'view-contract') {
        const cs = contractStatus(s.clientId);
        if (cs.label === 'Pending') {
          showToast('Your contract is being prepared by Good Company. Check back soon.');
          return;
        }
        renderClientContract(s.clientId); setNavSection('Performance Agreement');
      } else if (target === 'view-songs') {
        renderSongSelector(s.clientId); setNavSection('Song Selector');
      } else if (target === 'view-checklist') {
        loadChecklist(s.clientId); setNavSection('Day-of Checklist');
      } else if (target === 'view-ceremony') {
        loadCeremony(s.clientId); setNavSection('Ceremony Planner');
      }
      showView(target);
    });
  });

  /* ---- Client: new songs banner ---- */
  document.getElementById('new-songs-go').addEventListener('click', function() {
    const s = getSession();
    if (!s) return;
    renderSongSelector(s.clientId); setNavSection('Song Selector'); showView('view-songs');
  });

  /* ---- Client: contract sign ---- */
  document.getElementById('client-contract-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const s = getSession();
    if (!s) return;

    const contactName   = document.getElementById('cc-contact-name').value.trim();
    const address       = document.getElementById('cc-address').value.trim();
    const email         = document.getElementById('cc-email').value.trim();
    const phone         = document.getElementById('cc-phone').value.trim();
    const start         = document.getElementById('cc-start-time').value;
    const end           = document.getElementById('cc-end-time').value;
    const venue         = document.getElementById('cc-venue').value.trim();
    const dressCode     = document.querySelector('input[name="dress-code"]:checked');
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    const consent       = document.querySelector('input[name="consent"]:checked');
    const sigDate       = document.getElementById('cc-sig-date').value;

    if (!start || !end)    { showToast('Please enter the performance start and end times.'); return; }
    if (!venue)            { showToast('Please enter the venue / location.'); return; }
    if (!contactName || !address || !email || !phone) { showToast('Please fill in all contact fields (Section 22).'); return; }
    if (!paymentMethod)    { showToast('Please select a payment method (Section 5).'); return; }
    if (!dressCode)        { showToast('Please select a dress code (Section 8).'); return; }
    if (!consent)          { showToast('Please select a photo/video consent option (Section 12).'); return; }
    if (isSignatureEmpty()) { showToast('Please provide your signature (Section 23).'); return; }

    const sigData  = _sigCanvas.toDataURL('image/png');
    const contract = DB.getContract(s.clientId);
    contract.client = {
      contactName, startTime: start, endTime: end, venue,
      address, email, phone,
      paymentMethod: paymentMethod.value,
      dressCode: dressCode.value,
      consent: consent.value,
      sigDate
    };
    contract.signedAt      = Date.now();
    contract.signatureData = sigData;
    DB.setContract(s.clientId, contract);

    showToast('Agreement signed! Awaiting counter-signature from Good Company.');
    renderClientContract(s.clientId);
    renderClientDash(s.clientId);
  });

  /* ---- Client: print contract ---- */
  document.getElementById('btn-print-contract').addEventListener('click', () => window.print());

  /* ---- Client: phone format ---- */
  document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'cc-phone') {
      const cur = e.target.value;
      e.target.value = formatPhone(cur);
    }
  });

  /* ---- Client: song selector search ---- */
  document.getElementById('song-selector-search').addEventListener('input', function() {
    const s = getSession();
    if (s) renderSongSelector(s.clientId);
  });

  /* ---- Client: add song request ---- */
  document.getElementById('btn-add-request').addEventListener('click', function() {
    const s = getSession();
    if (s) addSongRequest(s.clientId);
  });

  /* ---- Client: save songs → back to dash ---- */
  document.getElementById('btn-save-songs').addEventListener('click', function() {
    const s = getSession();
    if (s) saveSongSelections(s.clientId);
  });

  /* ---- Client: save checklist ---- */
  function handleSaveChecklist() { const s=getSession(); if(s) saveChecklist(s.clientId); }
  document.getElementById('btn-save-checklist').addEventListener('click', handleSaveChecklist);
  document.getElementById('btn-save-checklist-bottom').addEventListener('click', handleSaveChecklist);

  /* ---- Checklist: conditional field toggles (attached once) ---- */
  function clToggle(selectId, wrapIds) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.addEventListener('change', function() {
      const show = this.value === 'Yes';
      wrapIds.forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !show); });
    });
  }
  clToggle('cl-announce-party', ['cl-announce-party-how-wrap','cl-party-names-wrap','cl-spotify-party-wrap']);
  clToggle('cl-grand-entrance', ['cl-couple-announce-wrap','cl-spotify-couple-wrap']);

  /* ---- Admin: ceremony service mutual exclusivity ---- */
  const _liveCb   = document.querySelector('input[name="scope-service"][value="Live Ceremony Music"]');
  const _dutiesCb = document.querySelector('input[name="scope-service"][value="Ceremony Duties"]');
  if (_liveCb)   _liveCb.addEventListener('change',   function() { if (this.checked && _dutiesCb) _dutiesCb.checked = false; });
  if (_dutiesCb) _dutiesCb.addEventListener('change', function() { if (this.checked && _liveCb)   _liveCb.checked   = false; });

  /* ---- Client: save ceremony ---- */
  function handleSaveCeremony() { const s=getSession(); if(s) saveCeremony(s.clientId); }
  document.getElementById('btn-save-ceremony').addEventListener('click', handleSaveCeremony);
  document.getElementById('btn-save-ceremony-bottom').addEventListener('click', handleSaveCeremony);

  /* ---- Modals: close ---- */
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() { const id=this.dataset.modal; if(id) closeModal(id); });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) { if(e.target===this) closeModal(this.id); });
  });

  /* ---- Admin: download contract PDF ---- */
  document.getElementById('btn-admin-dl-contract').addEventListener('click', function() {
    if (!currentAdminClientId) return;
    // Render contract in readonly mode from admin, then print
    renderClientContract(currentAdminClientId);
    const clientBack  = document.getElementById('contract-client-back');
    const adminBack   = document.getElementById('contract-admin-back');
    if (clientBack) clientBack.classList.add('hidden');
    if (adminBack)  adminBack.classList.remove('hidden');
    showView('view-contract');
    setNavSection('Performance Agreement');
    // Small delay to allow render, then print
    setTimeout(() => window.print(), 300);
  });

  /* ---- Admin: back from contract view ---- */
  document.getElementById('contract-admin-back').addEventListener('click', function() {
    const clientBack = document.getElementById('contract-client-back');
    const adminBack  = document.getElementById('contract-admin-back');
    if (clientBack) clientBack.classList.remove('hidden');
    if (adminBack)  adminBack.classList.add('hidden');
    if (currentAdminClientId) openClientDetail(currentAdminClientId);
    else { renderAdminDash(); showView('view-admin-dash'); }
    setNavSection('Admin Portal');
  });

  /* ---- Admin: contract language editor toggle ---- */
  document.getElementById('toggle-lang-editor').addEventListener('click', function() {
    const wrap = document.getElementById('lang-editor-wrap');
    const isHidden = wrap.classList.toggle('hidden');
    this.textContent = isHidden ? 'Edit Sections' : 'Hide Editor';
  });

  /* ---- Admin: save language overrides ---- */
  document.getElementById('btn-save-lang').addEventListener('click', function() {
    if (currentAdminClientId) saveLangOverrides(currentAdminClientId);
  });

  /* ---- Admin: counter-sign ---- */
  document.getElementById('btn-admin-countersign').addEventListener('click', function() {
    if (currentAdminClientId) adminCounterSign(currentAdminClientId);
  });

  /* ---- Confirm modal ---- */
  document.getElementById('confirm-ok').addEventListener('click', function() {
    closeModal('modal-confirm');
    if (_deleteSongId)   { deleteSong(_deleteSongId);     _deleteSongId   = null; }
    else if (_deleteClientId) { deleteClient(_deleteClientId); _deleteClientId = null; }
  });
});
