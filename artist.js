/* ============================================
   ARTIST PORTAL — artist.js
   ADB, ARTIST_EMAIL, _auth defined in firebase-db.js
   ============================================ */

/* ---- Auth ---- */
let _gigsDashLoaded = false;

function artistLogout() {
  _gigsDashLoaded = false;
  _auth.signOut().then(() => {
    document.getElementById('pnav-logout').classList.add('hidden');
    showView('view-login');
  }).catch(e => console.error('Sign out error:', e));
}

/* ---- View management ---- */
function showView(id) {
  document.querySelectorAll('.portal-view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/* ---- Toast ---- */
function showToast(msg) {
  const t = document.getElementById('artist-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ---- Formatters ---- */
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function refLinkIcon(url) {
  if (/spotify\.com/i.test(url))        return '<i class="fab fa-spotify"></i>';
  if (/youtu(be\.com|\.be)/i.test(url)) return '<i class="fab fa-youtube" style="color:#FF0000"></i>';
  return '<i class="fas fa-link" style="color:#888"></i>';
}

function fmtDate(d) {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return '—';
  const dt = new Date(+parts[0], +parts[1]-1, +parts[2]);
  return dt.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return '—';
  const dt = new Date(+parts[0], +parts[1]-1, +parts[2]);
  return dt.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
}

function fmtTime12(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return h12 + ':' + String(m).padStart(2,'0') + ' ' + ampm;
}

function addMinutes(t, mins) { return subtractMinutes(t, -mins); }

function subtractMinutes(t, mins) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return null;
  const total = h * 60 + m - mins;
  const rh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const rm = ((total % 1440) + 1440) % 1440 % 60;
  return String(rh).padStart(2,'0') + ':' + String(rm).padStart(2,'0');
}

function fmtSetDuration(count) {
  const totalMin = count * 4.25;
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return m + ' min';
  return m === 0 ? h + ' hr' : h + ' hr ' + m + ' min';
}

/* Lead fallback by title (lowercase) — covers songs saved before the lead field was added */
const ARTIST_LEAD_BY_TITLE = {
  "1999":"Matt","ain't it fun":"Savannah","ain't no mountain high enough":"Ian/Savannah",
  "all night long":"Ian","all the small things":"Matt","all your'n":"Matt",
  "are you gonna be my girl":"Ian/Savannah","birthday":"Savannah","blame it on the boogie":"Ian",
  "boogie shoes":"Matt","brick house":"Ian","bust a move":"Ian","cake by the ocean":"Savannah",
  "canned heat":"Ian","celebration":"Gino","come and get your love":"Ian","come on eileen":"Matt",
  "crazy in love":"Savannah","dancing in the moonlight":"Ian","dancing on the ceiling":"Ian",
  "dancing queen":"Savannah","december 1963 (oh, what a night)":"Matt","don't start now":"Savannah",
  "dreams":"Lee","funkytown":"Savannah","get down on it":"Gino","gimme! gimme! gimme!":"Savannah",
  "give it to me baby":"Matt","heaven":"Lee","hips don't lie":"Ian/Savannah","hot stuff":"Savannah",
  "hot to go!":"Savannah","how bizarre":"Lee","i wanna be your lover":"Matt",
  "i wanna dance with somebody":"Savannah","i wish":"Ian","if i ain't got you":"Savannah",
  "is this love":"Ian","le freak":"Ian","levitating":"Savannah","lil boo thang":"Matt",
  "love story":"Savannah","man! i feel like a woman!":"Savannah","man i need":"Savannah",
  "mr. brightside":"Nick","music for a sushi restaurant":"Matt","my girl":"Ian",
  "pick up the pieces":"N/A","pink pony club":"Savannah","play that funky music":"Ian",
  "red wine supernova":"Savannah","reelin' in the years":"Savannah","rich girl":"Savannah",
  "semi-charmed life":"Matt","september":"Matt","shake your body (down to the ground)":"Matt",
  "shining star":"Ian","signed, sealed, delivered (i'm yours)":"Ian","sir duke":"Ian",
  "stayin' alive":"Ian","sunday morning":"Ian","superstition":"Ian","tennessee whiskey":"Savannah",
  "tequila":"N/A","the real slim shady":"Matt","this will be (an everlasting love)":"Savannah",
  "treasure":"Matt","unwritten":"Savannah","uptown funk":"Ian","valerie":"Savannah",
  "we are family":"Savannah","what a wonderful world":"Savannah","where is my husband!":"Savannah",
  "you are the best thing":"Matt","you make me feel like dancing":"Ian",
  "you make my dreams (come true)":"Matt","you sexy thing":"Ian",
};

/* ============================================
   SETLIST GENERATION
   ============================================ */
const AVG_SONG_MIN = 4.25; // average song length used for duration estimates

let _setStructure = { totalMin: 180, breakMin: 30, songsPerSet: 18, sets: 2 };

function calcSetStructure(clientId) {
  const gcp = ADB.getGCP(clientId);
  const chk = gcp.checklist || {};
  function toMin(t) {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return isNaN(h) ? null : h * 60 + m;
  }
  const danceMin = toMin(chk['cl-dance-floor']);
  const endMin   = toMin(chk['cl-reception-end']);
  if (!danceMin || !endMin) {
    return { totalMin: 180, breakMin: 30, songsPerSet: 18, sets: 2, danceStr: null, endStr: null };
  }
  let totalMin = endMin - danceMin;
  if (totalMin <= 0) totalMin += 1440; // handle midnight wrap
  // Break scales linearly with block length, clamped to 15–30 min. No break for blocks under 90 min.
  const breakMin = totalMin < 90 ? 0 : Math.max(15, Math.min(30, Math.round((totalMin - 90) / 3)));
  const sets = breakMin > 0 ? 2 : 1;
  const songsPerSet = Math.max(8, Math.round((totalMin - breakMin) / sets / AVG_SONG_MIN));
  return { totalMin, breakMin, songsPerSet, sets, danceStr: chk['cl-dance-floor'], endStr: chk['cl-reception-end'] };
}

function generateSetlist(clientId) {
  const gcp     = ADB.getGCP(clientId);
  const prefs   = gcp.songs || {};
  const reqs    = gcp.songRequests || [];
  const catalog = ADB.getMasterSongs();

  // Build priority-ordered pool of all selected songs
  const pool = [
    ...catalog.filter(s => prefs[s.id] === 'Priority')
              .map(s => ({ id:s.id, title:s.title, artist:s.artist, spotify:s.spotify||'', source:'catalog', priority:true,  lead:s.lead||'' })),
    ...reqs.filter(r => r.type === 'Priority')
           .map(r => ({ id:r.id, title:r.title, artist:r.artist, spotify:r.spotify||'', source:'request', priority:true,  lead:'' })),
    ...catalog.filter(s => prefs[s.id] === 'Yes')
              .map(s => ({ id:s.id, title:s.title, artist:s.artist, spotify:s.spotify||'', source:'catalog', priority:false, lead:s.lead||'' })),
    ...reqs.filter(r => r.type !== 'Priority')
           .map(r => ({ id:r.id, title:r.title, artist:r.artist, spotify:r.spotify||'', source:'request', priority:false, lead:'' })),
  ];

  // Remove the first matching song from pool by title (case-insensitive exact, then partial)
  function pluck(query) {
    const q = query.toLowerCase();
    let i = pool.findIndex(s => s.title.toLowerCase() === q);
    if (i === -1) i = pool.findIndex(s => s.title.toLowerCase().includes(q));
    return i === -1 ? null : pool.splice(i, 1)[0];
  }

  // Structural anchors derived from historical setlist patterns:
  // Set 1: September always opens, Don't Start Now always follows, Tequila anchors the end.
  // Set 2: Pink Pony Club opens, Hot To Go! leads the closing stretch,
  //         Mr. Brightside is penultimate, Are You Gonna Be My Girl always closes.
  // Songs are only pinned when they exist in the client's selected pool.
  const september    = pluck('september');
  const dontStart    = pluck("don't start now");
  const tequila      = pluck('tequila');
  const ppc          = pluck('pink pony club');
  const hotToGo      = pluck('hot to go');
  const mrBrightside = pluck('mr. brightside');
  const areYouGonna  = pluck('are you gonna be my girl');

  const sps = _setStructure.songsPerSet;
  // Set 1: [September] [Don't Start Now] [...middle...] [Tequila]
  const s1Pinned = [september, dontStart, tequila].filter(Boolean).length;
  const s1Middle = pool.splice(0, Math.max(0, sps - s1Pinned));
  const set1 = [
    ...(september ? [september] : []),
    ...(dontStart ? [dontStart] : []),
    ...s1Middle,
    ...(tequila   ? [tequila]   : []),
  ];

  // Set 2: [Pink Pony Club] [...middle...] [Hot To Go!] [Mr. Brightside] [Are You Gonna Be My Girl]
  const s2Pinned = [ppc, hotToGo, mrBrightside, areYouGonna].filter(Boolean).length;
  const s2Middle = pool.splice(0, Math.max(0, sps - s2Pinned));
  const set2 = [
    ...(ppc          ? [ppc]          : []),
    ...s2Middle,
    ...(hotToGo      ? [hotToGo]      : []),
    ...(mrBrightside ? [mrBrightside] : []),
    ...(areYouGonna  ? [areYouGonna]  : []),
  ];

  return { sets: [set1, set2], savedAt: Date.now() };
}

/* ============================================
   GIGS DASHBOARD
   ============================================ */
function renderGigsDash() {
  const clients = ADB.getClients();
  const today   = new Date().toISOString().slice(0,10);

  const upcoming = clients
    .filter(c => !c.eventDate || c.eventDate >= today)
    .sort((a,b) => (a.eventDate||'9999').localeCompare(b.eventDate||'9999'));

  const past = clients
    .filter(c => c.eventDate && c.eventDate < today)
    .sort((a,b) => b.eventDate.localeCompare(a.eventDate));

  const container = document.getElementById('gigs-list');
  const noMsg     = document.getElementById('no-gigs-msg');

  if (!clients.length) {
    container.innerHTML = '';
    noMsg.classList.remove('hidden');
    return;
  }
  noMsg.classList.add('hidden');

  function gigCard(c) {
    const contract = ADB.getContract(c.id);
    const a  = contract.admin  || {};
    const cl = contract.client || {};
    const setlists = ADB.getSetlists();
    const sl       = setlists[c.id];
    const gcp      = ADB.getGCP(c.id);
    const hasSongs = Object.values(gcp.songs || {}).some(v => v === 'Priority' || v === 'Yes')
                     || (gcp.songRequests || []).length > 0;
    const hasSetlist = sl && (sl.sets[0].length > 0 || sl.sets[1].length > 0);

    const setlistBadge = hasSetlist
      ? `<span class="status-badge status-signed">Setlist Ready</span>`
      : hasSongs
        ? `<span class="status-badge status-pending">Songs Selected</span>`
        : `<span class="status-badge status-none">No Songs Yet</span>`;

    const chk = gcp.checklist || {};
    const venue = cl.venue || a.venue || '';

    const soundcheckRaw = subtractMinutes(chk['cl-guest-arrival'], 60);
    function kt(icon, label, raw) {
      const val = fmtTime12(raw);
      return val ? `<span class="artist-key-time"><i class="fas ${icon}"></i>${label}: <strong>${val}</strong></span>` : '';
    }
    const keyTimesHtml = [
      kt('fa-truck-loading', 'Load-in',    chk['cl-arrival-time']),
      kt('fa-microphone',    'Soundcheck', soundcheckRaw),
      kt('fa-utensils',      'Dinner',     chk['cl-dinner-time']),
      kt('fa-music',         'Band Start', chk['cl-dance-floor']),
    ].filter(Boolean).join('');

    const displayName = c.spouseName ? c.name + ' & ' + c.spouseName : c.name;
    return `
      <div class="artist-gig-card" data-client-id="${escHtml(c.id)}">
        <div class="artist-gig-main">
          <div class="artist-gig-name">${escHtml(displayName)}</div>
          <div class="artist-gig-meta">
            <span><i class="fas fa-calendar-alt"></i>${fmtDateShort(a.eventDate || c.eventDate)}</span>
            ${venue ? `<span><i class="fas fa-map-marker-alt"></i>${escHtml(venue)}</span>` : ''}
          </div>
          ${keyTimesHtml ? `<div class="artist-key-times-row">${keyTimesHtml}</div>` : ''}
        </div>
        <div class="artist-gig-right">
          ${setlistBadge}
          <i class="fas fa-chevron-right" style="color:#ccc;font-size:14px"></i>
        </div>
      </div>`;
  }

  // Group upcoming by year
  const upcomingByYear = {};
  upcoming.forEach(c => {
    const year = (c.eventDate || '').slice(0, 4) || 'TBD';
    if (!upcomingByYear[year]) upcomingByYear[year] = [];
    upcomingByYear[year].push(c);
  });

  let html = '';
  const years = Object.keys(upcomingByYear).sort();
  years.forEach(year => {
    html += `<div class="artist-year-header"><span>${year === 'TBD' ? 'Date TBD' : year}</span></div>`;
    html += upcomingByYear[year].map(gigCard).join('');
  });

  if (past.length) {
    html += `<div class="artist-past-divider"><span>Past Events</span></div>`;
    html += past.map(gigCard).join('');
  }
  container.innerHTML = html;

  container.querySelectorAll('.artist-gig-card').forEach(card => {
    card.addEventListener('click', () => renderGigDetail(card.dataset.clientId));
  });
}

/* ============================================
   GIG DETAIL
   ============================================ */
let _currentClientId = null;

function renderGigDetail(clientId) {
  _currentClientId = clientId;

  const clients  = ADB.getClients();
  const client   = clients.find(c => c.id === clientId);
  if (!client) return;

  const contract = ADB.getContract(clientId);
  const a  = contract.admin  || {};
  const cl = contract.client || {};
  const gcp = ADB.getGCP(clientId);
  const chk = gcp.checklist || {};
  const cer = gcp.ceremony  || {};
  const scope = a.scopeOfServices || [];

  const gigDisplayName = client.spouseName ? client.name + ' & ' + client.spouseName : client.name;
  document.getElementById('gig-client-name').textContent = gigDisplayName;
  document.getElementById('gig-event-date').textContent  = fmtDate(a.eventDate || client.eventDate);

  /* ---- Scope of Services ---- */
  document.getElementById('gig-scope').innerHTML = scope.length
    ? scope.map(s => `<span class="status-badge status-info" style="font-size:12px;padding:5px 14px">${escHtml(s)}</span>`).join('')
    : '<span style="font-family:var(--font-sans);font-size:13px;color:#bbb">No services selected yet.</span>';

  /* ---- Songs to Learn ---- */
  const savedSetlist = ADB.getSetlists()[clientId];
  const allSetlistSongs = savedSetlist
    ? [...(savedSetlist.sets[0] || []), ...(savedSetlist.sets[1] || [])]
    : [];
  const songsToLearn = allSetlistSongs.filter(s => s.source === 'request');
  const stlCard = document.getElementById('gig-songs-to-learn-card');
  const stlEl   = document.getElementById('gig-songs-to-learn');
  if (songsToLearn.length) {
    stlCard.classList.remove('hidden');
    stlEl.innerHTML = songsToLearn.map(s => {
      const artistDisplay = s.spotify
        ? `<a href="${escHtml(s.spotify)}" target="_blank" rel="noopener" class="artist-spotify-link">${escHtml(s.artist || '—')} <i class="fab fa-spotify"></i></a>`
        : escHtml(s.artist || '—');
      return `
      <div class="artist-info-row">
        <div class="artist-info-label">${escHtml(s.title)}</div>
        <div class="artist-info-val">${artistDisplay}</div>
      </div>`;
    }).join('');
  } else {
    stlCard.classList.add('hidden');
  }

  /* ---- Day Schedule ---- */
  // sortTime stores the raw "HH:MM" value used for chronological ordering
  function si(icon, label, val, sortTime) { return { icon, label, val, sortTime }; }
  const cocktailVal = fmtTime12(chk['cl-cocktail-start']) || null;
  const hasCeremony = scope.includes('Live Ceremony Music') || scope.includes('Ceremony Duties');
  const scheduleItems = [
    si('fa-truck-loading',  'Load-in',           fmtTime12(chk['cl-arrival-time']),                          chk['cl-arrival-time']),
    si('fa-microphone',     'Soundcheck',         fmtTime12(subtractMinutes(chk['cl-guest-arrival'], 60)),    subtractMinutes(chk['cl-guest-arrival'], 60)),
    si('fa-users',          'Guest Arrival',      fmtTime12(chk['cl-guest-arrival']),                         chk['cl-guest-arrival']),
    ...(hasCeremony ? [
      si('fa-ring',         'Ceremony Begins',    fmtTime12(cer['cer-start']),                                cer['cer-start']),
      si('fa-door-open',    'Ceremony Ends',      fmtTime12(cer['cer-end']),                                  cer['cer-end']),
    ] : []),
    si('fa-cocktail',       'Cocktail Hour',      cocktailVal,                                                 chk['cl-cocktail-start']),
    si('fa-glass-cheers',   'Reception Starts',   fmtTime12(chk['cl-reception-start']),                       chk['cl-reception-start']),
    ...(chk['cl-announce-party'] === 'Yes' && chk['cl-reception-start'] ? [
      si('fa-users', 'Wedding Party Entrance', fmtTime12(addMinutes(chk['cl-reception-start'], 5)), addMinutes(chk['cl-reception-start'], 5)),
    ] : []),
    ...(chk['cl-grand-entrance'] === 'Yes' && chk['cl-reception-start'] ? [
      si('fa-star', 'Grand Entrance', fmtTime12(addMinutes(chk['cl-reception-start'], 6)), addMinutes(chk['cl-reception-start'], 6)),
    ] : []),
    si('fa-utensils',       'Dinner',             fmtTime12(chk['cl-dinner-time']),                           chk['cl-dinner-time']),
    si('fa-heart',          'First Dance',        fmtTime12(chk['cl-first-dance']),                           chk['cl-first-dance']),
    si('fa-music',          'Dance Floor Opens',  fmtTime12(chk['cl-dance-floor']),                           chk['cl-dance-floor']),
    si('fa-flag-checkered', 'Reception Ends',     fmtTime12(chk['cl-reception-end']),                         chk['cl-reception-end']),
    si('fa-box',            'Load-out',           fmtTime12(chk['cl-loadout']),                               chk['cl-loadout']),
  ];

  // Inject speeches
  const scheduleSpeeches = (gcp.speeches || []).filter(s => s.time);
  scheduleSpeeches.forEach(s => {
    const label = [s.speaker, s.relation].filter(Boolean).join(' — ');
    scheduleItems.push(si('fa-microphone-alt', 'Speech: ' + label, fmtTime12(s.time), s.time));
  });

  // Inject special dances
  const scheduleSpecialDances = (gcp.specialDances || []).filter(d => d.time);
  scheduleSpecialDances.forEach(d => {
    const label = `${d.name}${d.withRelation ? ' (' + d.withRelation + ')' : ''}${d.withName ? ' & ' + d.withName + (d.title ? ' (' + d.title + ')' : '') : ''}`;
    scheduleItems.push(si('fa-user-friends', 'Special Dance: ' + label, fmtTime12(d.time), d.time));
  });

  // Sort chronologically; treat 00:00–07:59 as next-day to keep midnight load-out at end
  function toSortMin(t) {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    const mins = h * 60 + m;
    return mins < 480 ? mins + 1440 : mins;
  }
  scheduleItems.sort((a, b) => {
    const ta = toSortMin(a.sortTime), tb = toSortMin(b.sortTime);
    if (ta == null && tb == null) return 0;
    if (ta == null) return 1;
    if (tb == null) return -1;
    return ta - tb;
  });

  document.getElementById('gig-schedule').innerHTML = scheduleItems.map(item => `
    <div class="artist-timeline-row">
      <div class="artist-timeline-icon"><i class="fas ${item.icon}"></i></div>
      <div class="artist-timeline-label">${item.label}</div>
      <div class="artist-timeline-val${item.val ? '' : ' empty'}">${item.val || '—'}</div>
    </div>`).join('');

  /* ---- Logistics ---- */
  function infoRow(label, val) {
    const empty = !val || val === '—';
    return `
      <div class="artist-info-row">
        <div class="artist-info-label">${label}</div>
        <div class="artist-info-val${empty ? ' empty' : ''}">${escHtml(val || '—')}</div>
      </div>`;
  }

  function linkRow(label, displayText, url) {
    if (!url && displayText && /^https?:\/\//i.test(displayText)) { url = displayText; displayText = null; }
    const empty = !displayText && !url;
    let content;
    if (empty) {
      content = '—';
    } else if (url) {
      const t = escHtml(displayText || 'Open Link');
      content = `<a href="${escHtml(url)}" target="_blank" rel="noopener" class="artist-spotify-link">${refLinkIcon(url)}${t}</a>`;
    } else {
      content = escHtml(displayText);
    }
    return `
      <div class="artist-info-row">
        <div class="artist-info-label">${label}</div>
        <div class="artist-info-val${empty ? ' empty' : ''}">${content}</div>
      </div>`;
  }

  const logRows = [
    infoRow('Venue',            cl.venue || '—'),
    infoRow('Client Contact',   cl.contactName ? `${cl.contactName}${cl.phone ? '  ·  ' + cl.phone : ''}` : '—'),
    infoRow('Coordinator', chk['cl-coordinator']
      ? chk['cl-coordinator'] + (chk['cl-coordinator-phone'] ? '  ·  ' + chk['cl-coordinator-phone'] : '')
      : '—'),
    infoRow('Dress Code',       cl.dressCode || '—'),
    infoRow('Load-in Location', chk['cl-loadinlocation'] || '—'),
    infoRow('Parking',          chk['cl-parking'] || '—'),
    infoRow('Parking Payment',  chk['cl-parking-payment'] || '—'),
    infoRow('Dressing Room',    chk['cl-dressing-room'] || '—'),
    infoRow('Stage Size',       chk['cl-stage-size'] || '—'),
    infoRow('Outdoor',          chk['cl-outdoor'] || '—'),
    infoRow('Power',            chk['cl-power'] || '—'),
    infoRow('WiFi',             chk['cl-wifi-name']
              ? chk['cl-wifi-name'] + (chk['cl-wifi-pass'] ? '  /  ' + chk['cl-wifi-pass'] : '  (no password)')
              : '—'),
    infoRow('Attendance',       chk['cl-attendance'] ? chk['cl-attendance'] + ' guests' : '—'),
    infoRow('Dinner Style',     chk['cl-dinner-style'] || '—'),
    infoRow('Meals Provided',   chk['cl-meals'] || '—'),
    infoRow('Band Eats At',     chk['cl-band-eat'] || '—'),
  ];
  document.getElementById('gig-logistics').innerHTML = logRows.join('');

  /* ---- Ceremony ---- */
  const cerCard = document.getElementById('gig-ceremony-card');
  cerCard.classList.toggle('hidden', !hasCeremony);

  if (hasCeremony) {
    const isLive = scope.includes('Live Ceremony Music');
    const cerRows = [
      infoRow('Start Time',        fmtTime12(cer['cer-start']) || '—'),
      infoRow('End Time',          fmtTime12(cer['cer-end']) || '—'),
      infoRow('Officiant Mic',     cer['cer-officiant-mic'] || '—'),
      infoRow('Readers Mic',       cer['cer-readers-mic'] || '—'),
      infoRow('Separate Location', cer['cer-sep-location'] || '—'),
      infoRow('Distance',          cer['cer-distance'] || '—'),
      infoRow('Outdoor',           cer['cer-outdoor'] || '—'),
      infoRow('Power',             cer['cer-power'] || '—'),
    ];

    if (isLive) {
      cerRows.push(
        infoRow('Seating Genre', cer['cer-seating-genre'] || '—'),
        linkRow('Family / Wedding Party Processional', [cer['cer-live-family-song'], cer['cer-live-family-artist']].filter(Boolean).join(' — ') || null, cer['cer-live-family-link'] || null),
        linkRow('Bride / Partner Entrance', [cer['cer-live-bride-song'], cer['cer-live-bride-artist']].filter(Boolean).join(' — ') || null, cer['cer-live-bride-link'] || null),
        linkRow('Couple Exit', [cer['cer-live-exit-song'], cer['cer-live-exit-artist']].filter(Boolean).join(' — ') || null, cer['cer-live-exit-link'] || null),
        infoRow('Notes', cer['cer-live-notes'] || '—'),
      );
    } else {
      cerRows.push(
        linkRow('Seating Playlist', cer['cer-duties-seating-link'] || null, null),
        linkRow('Family / Wedding Party Processional', [cer['cer-duties-family-link'], cer['cer-duties-family-artist']].filter(Boolean).join(' — ') || null, cer['cer-duties-family-spotify'] || null),
        linkRow('Bride / Partner Entrance', [cer['cer-duties-bride-link'], cer['cer-duties-bride-artist']].filter(Boolean).join(' — ') || null, cer['cer-duties-bride-spotify'] || null),
        linkRow('Couple Exit', [cer['cer-duties-exit-link'], cer['cer-duties-exit-artist']].filter(Boolean).join(' — ') || null, cer['cer-duties-exit-spotify'] || null),
        infoRow('Notes', cer['cer-duties-notes'] || '—'),
      );
    }
    document.getElementById('gig-ceremony').innerHTML = cerRows.join('');
  }

  /* ---- Music & Dances ---- */
  const musicRows = [];

  // First Dance
  const fdTime   = fmtTime12(chk['cl-first-dance']);
  const fdSong   = chk['cl-first-dance-song'];
  const fdArtist = chk['cl-first-dance-artist'];
  const fdLength = chk['cl-first-dance-length'];
  const fdSpot   = chk['cl-first-dance-spotify'];
  const fdLabel  = [fdSong, fdArtist].filter(Boolean).join(' — ');
  const fdMeta   = [fdTime, fdLength].filter(Boolean).join('  ·  ');
  if (fdMeta || fdLabel || fdSpot) {
    if (fdMeta) musicRows.push(infoRow('First Dance', fdMeta));
    if (fdLabel || fdSpot) musicRows.push(linkRow(fdMeta ? '↳ Song' : 'First Dance', fdLabel || null, fdSpot || null));
  } else {
    musicRows.push(infoRow('First Dance', '—'));
  }

  // Parent Dances
  const pdTime = fmtTime12(chk['cl-parent-dances']);
  if (pdTime) musicRows.push(infoRow('Parent Dances', pdTime));

  if (chk['cl-fd'] === 'Yes') {
    const nameTag = chk['cl-fd-name'] ? 'Father: ' + chk['cl-fd-name'] : null;
    const fdsMeta = [nameTag, chk['cl-fd-length']].filter(Boolean).join('  ·  ');
    const fdsLabel = [chk['cl-fd-song'], chk['cl-fd-artist']].filter(Boolean).join(' — ');
    if (fdsMeta) musicRows.push(infoRow('Father / Daughter', fdsMeta));
    if (fdsLabel || chk['cl-fd-spotify']) musicRows.push(linkRow(fdsMeta ? '↳ Song' : 'Father / Daughter', fdsLabel || null, chk['cl-fd-spotify'] || null));
  }
  if (chk['cl-ms'] === 'Yes') {
    const nameTag = chk['cl-ms-name'] ? 'Mother: ' + chk['cl-ms-name'] : null;
    const mssMeta = [nameTag, chk['cl-ms-length']].filter(Boolean).join('  ·  ');
    const mssLabel = [chk['cl-ms-song'], chk['cl-ms-artist']].filter(Boolean).join(' — ');
    if (mssMeta) musicRows.push(infoRow('Mother / Son', mssMeta));
    if (mssLabel || chk['cl-ms-spotify']) musicRows.push(linkRow(mssMeta ? '↳ Song' : 'Mother / Son', mssLabel || null, chk['cl-ms-spotify'] || null));
  }
  if (chk['cl-other-dance'] === 'Yes') {
    const desc = chk['cl-other-dance-desc'] || 'Other';
    const odMeta = [desc, chk['cl-other-dance-length']].filter(Boolean).join('  ·  ');
    const odLabel = [chk['cl-other-dance-song'], chk['cl-other-dance-artist']].filter(Boolean).join(' — ');
    if (odMeta) musicRows.push(infoRow('Other Dance', odMeta));
    if (odLabel || chk['cl-other-dance-spotify']) musicRows.push(linkRow(odMeta ? '↳ Song' : 'Other Dance', odLabel || null, chk['cl-other-dance-spotify'] || null));
  }



  // Background Music
  if (chk['cl-spotify-dinner']) musicRows.push(linkRow('Dinner Music', chk['cl-spotify-dinner'], null));
  if (chk['cl-spotify-break'])  musicRows.push(linkRow('Band Break Music', chk['cl-spotify-break'], null));

  const musicCard = document.getElementById('gig-music-card');
  const hasMusic = musicRows.length > 0;
  if (musicCard) musicCard.classList.toggle('hidden', !hasMusic);
  if (hasMusic) document.getElementById('gig-music').innerHTML = musicRows.join('');

  /* ---- Notes ---- */
  const notesCard = document.getElementById('gig-notes-card');
  const notesEl   = document.getElementById('gig-notes');
  if (notesCard && notesEl) {
    const notes = chk['cl-notes'] || '';
    notesCard.classList.toggle('hidden', !notes);
    if (notes) notesEl.innerHTML = infoRow('Notes', notes);
  }

  /* ---- Setlist ---- */
  loadAndRenderSetlist(clientId);

  showView('view-gig');
  window.scrollTo(0, 0);
}

/* ============================================
   SETLIST
   ============================================ */
let _setlistSets = [[], []]; // in-memory working copy

function sanitizeSong(s) {
  return { id:s.id||'', title:s.title||'', artist:s.artist||'', spotify:s.spotify||'', source:s.source||'catalog', priority:!!s.priority, lead:s.lead||'' };
}

/* Enrich saved setlist songs with lead/spotify from the current master catalog.
   Falls back to ARTIST_LEAD_BY_TITLE for songs saved before the lead field existed. */
function _enrichFromCatalog(songs) {
  const catalog = ADB.getMasterSongs();
  const byId = {};
  catalog.forEach(s => { byId[s.id] = s; });
  return songs.map(s => {
    const master = byId[s.id];
    const lead = s.lead || (master && master.lead) || ARTIST_LEAD_BY_TITLE[s.title.toLowerCase()] || '';
    const spotify = s.spotify || (master && master.spotify) || '';
    return { ...s, lead, spotify };
  });
}

function loadAndRenderSetlist(clientId) {
  _setStructure = calcSetStructure(clientId);
  const setlists = ADB.getSetlists();
  if (setlists[clientId]) {
    _setlistSets = [
      _enrichFromCatalog((setlists[clientId].sets[0] || []).map(sanitizeSong)),
      _enrichFromCatalog((setlists[clientId].sets[1] || []).map(sanitizeSong)),
    ];
  } else {
    const gen = generateSetlist(clientId);
    _setlistSets = gen.sets;
  }
  _renderSetlistUI();
}

function _renderSetlistUI() {
  const container = document.getElementById('setlist-container');
  const { songsPerSet, breakMin, sets, totalMin, danceStr, endStr } = _setStructure;

  // Timing summary banner
  const targetDur = fmtSetDuration(songsPerSet);
  let timingBanner = '';
  if (danceStr && endStr) {
    const totalH = Math.floor(totalMin / 60), totalM = totalMin % 60;
    const totalLabel = totalM === 0 ? totalH + ' hr' : totalH + ' hr ' + totalM + ' min';
    timingBanner = `<div class="setlist-timing-banner">
      <i class="fas fa-clock"></i>
      <strong>${fmtTime12(danceStr)} – ${fmtTime12(endStr)}</strong>
      <span class="setlist-timing-sep">·</span> ${totalLabel} performance block
      <span class="setlist-timing-sep">·</span> ${breakMin}-min break
      <span class="setlist-timing-sep">·</span> target <strong>${songsPerSet} songs/set</strong> (~${targetDur})
    </div>`;
  } else {
    timingBanner = `<div class="setlist-timing-banner setlist-timing-default">
      <i class="fas fa-info-circle"></i>
      No dance floor / reception end time set in the Day-of Checklist — using default 3-hour block (${songsPerSet} songs/set).
    </div>`;
  }

  function buildSetHTML(si) {
    const songs  = _setlistSets[si];
    const dur    = fmtSetDuration(songs.length);
    const short  = songsPerSet - songs.length;
    const warnHTML = (songs.length > 0 && songs.length < songsPerSet)
      ? `<div class="setlist-duration-warn">
           <i class="fas fa-exclamation-triangle"></i>
           Add ${short} more song${short !== 1 ? 's' : ''} — set is ~${dur}, target is ~${targetDur}
         </div>`
      : '';

    const rows = songs.map((s, i) => `
      <div class="setlist-row" draggable="true" data-set="${si}" data-idx="${i}">
        <div class="setlist-drag-handle"><i class="fas fa-grip-vertical"></i></div>
        <div class="setlist-num">${i + 1}</div>
        <div class="setlist-info">
          <div class="setlist-title">${s.spotify ? `<a href="${escHtml(s.spotify)}" target="_blank" rel="noopener" class="setlist-title-link">${escHtml(s.title)} ${refLinkIcon(s.spotify)}</a>` : escHtml(s.title)}</div>
          <div class="setlist-artist">${escHtml(s.artist)}</div>
        </div>
        ${s.lead ? `<span class="status-badge setlist-lead-badge" style="font-size:9px;flex-shrink:0">${escHtml(s.lead)}</span>` : ''}
        ${s.source === 'request' ? `<span class="status-badge status-pending" style="font-size:9px;flex-shrink:0">Request</span>` : ''}
        ${s.priority ? `<span class="status-badge status-alert" style="font-size:9px;flex-shrink:0">Priority</span>` : ''}
        <button class="setlist-remove-btn" data-set="${si}" data-idx="${i}" title="Remove song">
          <i class="fas fa-times"></i>
        </button>
      </div>`).join('') ||
      `<div class="setlist-empty">No songs in this set — use "Add Song" to add some.</div>`;

    return `
      <div class="setlist-set-block">
        <div class="setlist-set-header">
          <span class="setlist-set-title">Set ${si + 1}</span>
          <span class="setlist-set-meta">${songs.length} song${songs.length !== 1 ? 's' : ''} · ~${dur}</span>
          <button class="btn-ghost setlist-add-btn" data-set="${si}">
            <i class="fas fa-plus"></i> Add Song
          </button>
        </div>
        ${warnHTML}
        <div class="setlist-rows" id="setlist-rows-${si}">${rows}</div>
      </div>`;
  }

  const breakLabel = breakMin > 0 ? `${breakMin}-Minute Break` : 'No Break';
  const set2HTML = sets > 1
    ? `<div class="setlist-break-divider">
        <div class="setlist-break-line"></div>
        <span class="setlist-break-label">${breakLabel}</span>
        <div class="setlist-break-line"></div>
      </div>` + buildSetHTML(1)
    : '';

  container.innerHTML = timingBanner + buildSetHTML(0) + set2HTML;

  _attachSetlistEvents();
  _renderLeadCounts();
  _renderUnplacedRequests();
}

function _attachSetlistEvents() {
  /* Remove buttons */
  document.querySelectorAll('.setlist-remove-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const si  = +this.dataset.set;
      const idx = +this.dataset.idx;
      _setlistSets[si].splice(idx, 1);
      _renderSetlistUI();
    });
  });

  /* Add Song buttons */
  document.querySelectorAll('.setlist-add-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetSet = +this.dataset.set;
      document.querySelectorAll('input[name="add-to-set"]').forEach(r => {
        r.checked = (+r.value === targetSet);
      });
      openAddSongModal();
    });
  });

  /* ---- Drag and drop (mouse) ---- */
  let dragSrc = null;

  document.querySelectorAll('.setlist-row').forEach(row => {
    row.addEventListener('dragstart', function(e) {
      dragSrc = { si: +this.dataset.set, idx: +this.dataset.idx };
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      document.querySelectorAll('.setlist-row, .setlist-rows').forEach(el => el.classList.remove('drag-over'));
      dragSrc = null;
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.setlist-row').forEach(r => r.classList.remove('drag-over'));
      this.classList.add('drag-over');
    });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!dragSrc) return;
      const destSi  = +this.dataset.set;
      const destIdx = +this.dataset.idx;
      if (dragSrc.si === destSi && dragSrc.idx === destIdx) return;
      const song = _setlistSets[dragSrc.si].splice(dragSrc.idx, 1)[0];
      let ti = destIdx;
      if (dragSrc.si === destSi && dragSrc.idx < destIdx) ti = destIdx - 1;
      _setlistSets[destSi].splice(ti, 0, song);
      dragSrc = null;
      _renderSetlistUI();
    });
  });

  /* Allow dropping onto empty set containers */
  document.querySelectorAll('.setlist-rows').forEach(block => {
    block.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.classList.add('drag-over');
    });
    block.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
    block.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (!dragSrc) return;
      const destSi = +this.id.replace('setlist-rows-', '');
      const song   = _setlistSets[dragSrc.si].splice(dragSrc.idx, 1)[0];
      _setlistSets[destSi].push(song);
      dragSrc = null;
      _renderSetlistUI();
    });
  });

  /* ---- Touch drag and drop (mobile) ---- */
  document.querySelectorAll('.setlist-drag-handle').forEach(handle => {
    handle.addEventListener('touchstart', _touchDragStart, { passive: false });
  });
}

/* Touch drag state */
let _tdSrc    = null; // { si, idx }
let _tdGhost  = null;
let _tdOffX   = 0;
let _tdOffY   = 0;

function _touchDragStart(e) {
  const row = e.currentTarget.closest('.setlist-row');
  if (!row) return;
  e.preventDefault();

  const touch = e.touches[0];
  const rect  = row.getBoundingClientRect();
  _tdOffX = touch.clientX - rect.left;
  _tdOffY = touch.clientY - rect.top;
  _tdSrc  = { si: +row.dataset.set, idx: +row.dataset.idx };

  _tdGhost = row.cloneNode(true);
  Object.assign(_tdGhost.style, {
    position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
    width: rect.width + 'px', opacity: '0.85', pointerEvents: 'none',
    zIndex: '9999', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    borderRadius: '8px', background: '#fff',
  });
  document.body.appendChild(_tdGhost);
  row.classList.add('dragging');

  document.addEventListener('touchmove', _touchDragMove, { passive: false });
  document.addEventListener('touchend',  _touchDragEnd);
}

function _touchDragMove(e) {
  e.preventDefault();
  if (!_tdGhost) return;
  const touch = e.touches[0];
  _tdGhost.style.left = (touch.clientX - _tdOffX) + 'px';
  _tdGhost.style.top  = (touch.clientY - _tdOffY) + 'px';

  _tdGhost.style.display = 'none';
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  _tdGhost.style.display = '';
  const target = el && el.closest('.setlist-row');
  document.querySelectorAll('.setlist-row').forEach(r => r.classList.remove('drag-over'));
  if (target) target.classList.add('drag-over');
}

function _touchDragEnd(e) {
  document.removeEventListener('touchmove', _touchDragMove);
  document.removeEventListener('touchend',  _touchDragEnd);

  if (_tdGhost) { _tdGhost.remove(); _tdGhost = null; }
  document.querySelectorAll('.setlist-row').forEach(r => r.classList.remove('dragging', 'drag-over'));

  if (!_tdSrc) return;
  const touch = e.changedTouches[0];
  _tdGhost = null; // already removed
  const el     = document.elementFromPoint(touch.clientX, touch.clientY);
  const target = el && el.closest('.setlist-row');

  if (target && target.dataset.set !== undefined) {
    const destSi  = +target.dataset.set;
    const destIdx = +target.dataset.idx;
    if (!(_tdSrc.si === destSi && _tdSrc.idx === destIdx)) {
      const song = _setlistSets[_tdSrc.si].splice(_tdSrc.idx, 1)[0];
      let ti = destIdx;
      if (_tdSrc.si === destSi && _tdSrc.idx < destIdx) ti = destIdx - 1;
      _setlistSets[destSi].splice(ti, 0, song);
    }
  } else {
    const block  = el && el.closest('.setlist-rows');
    if (block) {
      const destSi = +block.id.replace('setlist-rows-', '');
      const song   = _setlistSets[_tdSrc.si].splice(_tdSrc.idx, 1)[0];
      _setlistSets[destSi].push(song);
    }
  }

  _tdSrc = null;
  _renderSetlistUI();
}
/* ---- Lead count table ---- */
function _renderLeadCounts() {
  const el = document.getElementById('setlist-lead-counts');
  if (!el) return;
  const counts = {};
  _setlistSets.forEach((set, si) => {
    set.forEach(s => {
      const lead = s.lead || '—';
      if (!counts[lead]) counts[lead] = [0, 0];
      counts[lead][si]++;
    });
  });
  const rows = Object.entries(counts)
    .map(([lead, c]) => ({ lead, s0: c[0], s1: c[1], total: c[0] + c[1] }))
    .sort((a, b) => b.total - a.total);
  if (!rows.length) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="lead-count-wrap">
      <div class="lead-count-title">Song Count by Lead</div>
      <table class="lead-count-table">
        <thead><tr><th>Lead</th><th>Set 1</th><th>Set 2</th><th>Total</th></tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td class="lead-count-name">${escHtml(r.lead)}</td>
            <td>${r.s0 || '—'}</td>
            <td>${r.s1 || '—'}</td>
            <td><strong>${r.total}</strong></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---- Unplaced client requests ---- */
function _addRequestToSet(reqId, setIndex) {
  const gcp = ADB.getGCP(_currentClientId);
  const req = (gcp.songRequests || []).find(r => r.id === reqId);
  if (!req) return;
  // Route through lead picker modal
  _pendingAddSong = {
    id:       req.id,
    title:    req.title,
    artist:   req.artist || '',
    spotify:  req.spotify || '',
    source:   'request',
    priority: req.type === 'Priority',
  };
  // Pre-select known lead if available
  const knownLead = ARTIST_LEAD_BY_TITLE[req.title.toLowerCase()] || '';
  document.getElementById('add-song-lead-title').textContent = req.title + (req.artist ? ' — ' + req.artist : '');
  const leadSel = document.getElementById('add-song-lead-select');
  leadSel.value = knownLead || '';
  document.getElementById('add-song-lead-other').classList.add('hidden');
  // Override set index radio
  document.querySelector(`input[name="add-to-set"][value="${setIndex}"]`).checked = true;
  // Show modal with only lead picker visible
  document.getElementById('add-song-list').style.display = 'none';
  document.getElementById('add-song-search').style.display = 'none';
  document.getElementById('add-song-lead-step').classList.remove('hidden');
  document.getElementById('modal-add-song').classList.remove('hidden');
}

function _renderUnplacedRequests() {
  const el = document.getElementById('setlist-unplaced-requests');
  if (!el || !_currentClientId) return;

  const gcp  = ADB.getGCP(_currentClientId);
  const reqs = gcp.songRequests || [];
  if (!reqs.length) { el.innerHTML = ''; return; }

  const inSetlist = new Set([..._setlistSets[0], ..._setlistSets[1]].map(s => s.id));
  const unplaced  = reqs.filter(r => !inSetlist.has(r.id));
  if (!unplaced.length) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div class="unplaced-requests-wrap">
      <div class="lead-count-title" style="margin-bottom:12px">
        <i class="fas fa-inbox" style="margin-right:6px;color:#bbb"></i>
        Client Requests Not in Setlist (${unplaced.length})
      </div>
      ${unplaced.map(r => {
        const lead = ARTIST_LEAD_BY_TITLE[r.title.toLowerCase()] || '';
        const titleHtml = r.spotify
          ? `<a href="${escHtml(r.spotify)}" target="_blank" rel="noopener" class="setlist-title-link">${escHtml(r.title)} ${refLinkIcon(r.spotify)}</a>`
          : escHtml(r.title);
        return `
          <div class="unplaced-request-row" data-reqid="${escHtml(r.id)}">
            <div class="setlist-info">
              <div class="setlist-title">${titleHtml}</div>
              <div class="setlist-artist">${escHtml(r.artist || '')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap">
              ${lead ? `<span class="status-badge setlist-lead-badge" style="font-size:9px">${escHtml(lead)}</span>` : ''}
              ${r.type === 'Priority'
                ? `<span class="status-badge status-alert" style="font-size:9px">Priority</span>`
                : `<span class="status-badge status-pending" style="font-size:9px">Request</span>`}
              <button class="unplaced-add-btn" data-reqid="${escHtml(r.id)}" data-set="0">+ Set 1</button>
              <button class="unplaced-add-btn" data-reqid="${escHtml(r.id)}" data-set="1">+ Set 2</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  el.querySelectorAll('.unplaced-add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _addRequestToSet(this.dataset.reqid, +this.dataset.set);
    });
  });
}

/* ---- Save setlist ---- */
async function saveSetlist(clientId) {
  const btn = document.getElementById('btn-save-setlist');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…'; }
  const setlists = ADB.getSetlists();
  setlists[clientId] = { sets: _setlistSets, savedAt: Date.now() };
  try {
    await ADB.setSetlist(clientId, setlists[clientId]);
    showToast('Setlist saved!');
  } catch(e) {
    console.error('Save setlist error:', e);
    showToast('Save failed: ' + (e.code || e.message || e));
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Setlist'; }
  }
}

/* ============================================
   ADD SONG MODAL
   ============================================ */
function openAddSongModal() {
  document.getElementById('add-song-search').value = '';
  document.getElementById('add-song-search').style.display = '';
  document.getElementById('add-song-list').style.display = '';
  document.getElementById('add-song-lead-step').classList.add('hidden');
  _pendingAddSong = null;
  _renderAddSongList('');
  document.getElementById('modal-add-song').classList.remove('hidden');
  setTimeout(() => document.getElementById('add-song-search').focus(), 50);
}

function _renderAddSongList(query) {
  const catalog  = ADB.getMasterSongs();
  const gcp      = ADB.getGCP(_currentClientId);
  const prefs    = gcp.songs || {};
  const reqs     = gcp.songRequests || [];
  const inSetlist = new Set([..._setlistSets[0], ..._setlistSets[1]].map(s => s.id));

  const q = query.toLowerCase().trim();

  // Build list: client-selected songs first (alpha), then requests, then full catalog (alpha)
  const sortAlpha = arr => arr.sort((a, b) => a.title.localeCompare(b.title));
  const selected = sortAlpha(catalog
    .filter(s => (prefs[s.id] === 'Priority' || prefs[s.id] === 'Yes') && !inSetlist.has(s.id))
    .map(s => ({ ...s, source:'catalog', priority: prefs[s.id] === 'Priority' })));

  const unselected = sortAlpha(catalog
    .filter(s => !prefs[s.id] && !inSetlist.has(s.id))
    .map(s => ({ ...s, source:'catalog', dim:true })));

  const requestItems = reqs
    .filter(r => !inSetlist.has(r.id))
    .map(r => ({ ...r, source:'request' }));

  const available = [...selected, ...requestItems, ...unselected].filter(s =>
    !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );

  const list = document.getElementById('add-song-list');
  if (!available.length) {
    list.innerHTML = '<div style="padding:20px;font-family:var(--font-sans);font-size:13px;color:#aaa;text-align:center">No songs found</div>';
    return;
  }

  list.innerHTML = available.map(s => {
    const lead = s.lead || ARTIST_LEAD_BY_TITLE[s.title.toLowerCase()] || '';
    return `
    <div class="add-song-item${s.dim ? ' dim' : ''}"
         data-id="${escHtml(s.id)}"
         data-title="${escHtml(s.title)}"
         data-artist="${escHtml(s.artist)}"
         data-source="${s.source}"
         data-spotify="${escHtml(s.spotify||'')}"
         data-lead="${escHtml(lead)}"
         data-priority="${s.priority ? '1' : ''}">
      <div style="min-width:0;flex:1">
        <div style="font-family:var(--font-sans);font-size:13px;font-weight:600;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(s.title)}</div>
        <div style="font-family:var(--font-sans);font-size:12px;color:#999">${escHtml(s.artist)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        ${s.source === 'request' ? `<span class="status-badge status-pending" style="font-size:9px">Request</span>` : ''}
        ${s.priority ? `<span class="status-badge status-alert" style="font-size:9px">Priority</span>` : ''}
        ${lead ? `<span class="status-badge setlist-lead-badge" style="font-size:9px">${escHtml(lead)}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.add-song-item').forEach(item => {
    item.addEventListener('click', function() {
      const source = this.dataset.source;
      if (source === 'request') {
        // Show lead picker step for requested songs
        _pendingAddSong = {
          id:       this.dataset.id,
          title:    this.dataset.title,
          artist:   this.dataset.artist,
          source:   'request',
          spotify:  this.dataset.spotify || '',
          priority: this.dataset.priority === '1',
        };
        document.getElementById('add-song-lead-title').textContent = this.dataset.title + ' — ' + this.dataset.artist;
        document.getElementById('add-song-lead-select').value = '';
        document.getElementById('add-song-lead-other').value = '';
        document.getElementById('add-song-lead-other').classList.add('hidden');
        document.getElementById('add-song-lead-step').classList.remove('hidden');
        document.getElementById('add-song-list').style.display = 'none';
        document.getElementById('add-song-search').style.display = 'none';
        return;
      }
      // Catalog song — add directly with lead from data attribute
      const setIndex = +document.querySelector('input[name="add-to-set"]:checked').value;
      _setlistSets[setIndex].push({
        id:       this.dataset.id,
        title:    this.dataset.title,
        artist:   this.dataset.artist,
        source:   'catalog',
        spotify:  this.dataset.spotify || '',
        lead:     this.dataset.lead || '',
        priority: this.dataset.priority === '1',
      });
      document.getElementById('modal-add-song').classList.add('hidden');
      _renderSetlistUI();
      showToast(`Added to Set ${setIndex + 1}`);
    });
  });
}

let _pendingAddSong = null;

/* ============================================
   SETLIST PREVIEW VIEW
   ============================================ */
function renderSetlistPreview() {
  const client   = ADB.getClients().find(c => c.id === _currentClientId);
  const contract = ADB.getContract(_currentClientId);
  const a        = contract.admin || {};
  const name     = client ? (client.spouseName ? client.name + ' & ' + client.spouseName : client.name) : 'Client';
  const date     = fmtDate(a.eventDate || (client && client.eventDate) || '');
  const hasSet2  = _setlistSets[1].length > 0;
  const base     = window.location.origin;

  function buildSongs(songs) {
    return songs.length
      ? songs.map(s => `
        <div class="slp-song">
          <span class="slp-title">${escHtml(s.title)}</span>
          ${s.lead ? `<span class="slp-lead">${escHtml(s.lead)}</span>` : ''}
        </div>`).join('')
      : '<div class="slp-empty">No songs in this set.</div>';
  }

  document.getElementById('setlist-preview-content').innerHTML = `
    <div class="slp-header">
      <img class="slp-logo" src="${base}/Insta%20Profile.png" alt="Good Company">
    </div>
    <div class="slp-body${hasSet2 ? ' two-col' : ' one-col'}">
      <div class="slp-set">
        <div class="slp-set-header">Set 1</div>
        ${buildSongs(_setlistSets[0])}
      </div>
      ${hasSet2 ? `<div class="slp-set">
        <div class="slp-set-header">Set 2</div>
        ${buildSongs(_setlistSets[1])}
      </div>` : ''}
    </div>
    <div class="slp-footer">
      <div class="slp-client-name">${escHtml(name)}</div>
      ${date ? `<div class="slp-event-date">${escHtml(date)}</div>` : ''}
    </div>`;
}

/* ============================================
   PDF DOWNLOAD
   ============================================ */
function downloadSetlistPDF() {
  const client   = ADB.getClients().find(c => c.id === _currentClientId);
  const contract = ADB.getContract(_currentClientId);
  const a        = contract.admin || {};
  const name     = client ? (client.spouseName ? client.name + ' & ' + client.spouseName : client.name) : 'Client';
  const date     = fmtDate(a.eventDate || (client && client.eventDate) || '');
  const base     = window.location.origin;
  const hasSet2  = _setlistSets[1].length > 0;

  function buildSongs(songs) {
    return songs.map(s => `<div class="sl-song">${escHtml(s.title)}</div>`).join('');
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${escHtml(name)} — Setlist</title>
<style>
  @font-face{font-family:'Montserrat';src:url('${base}/Montserrat-VariableFont_wght.ttf') format('truetype')}
  @font-face{font-family:'Bitter';src:url('${base}/Bitter-VariableFont_wght.ttf') format('truetype')}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Montserrat','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:20px 28px;font-size:13px}
  .sl-header{text-align:center;margin-bottom:18px}
  .sl-logo{width:90px;height:90px;object-fit:contain;display:block;margin:0 auto}
  .sl-body{display:grid;gap:36px;align-items:start;margin-bottom:16px}
  .sl-body.two-col{grid-template-columns:1fr 1fr}
  .sl-body.one-col{grid-template-columns:1fr;max-width:380px;margin:0 auto 16px}
  .sl-set-header{
    text-align:center;font-family:'Montserrat',sans-serif;
    font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:4px;color:#153147;
    padding-bottom:10px;margin-bottom:2px;border-bottom:2.5px solid #153147;
    text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px
  }
  .sl-song{
    text-align:center;font-family:'Montserrat',sans-serif;
    font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;
    padding:7px 4px;border-bottom:1px solid #ebebeb;color:#1a1a1a;line-height:1.25
  }
  .sl-song:last-child{border-bottom:none}
  .sl-footer{text-align:center;padding-top:14px;border-top:1.5px solid #e0ddd8}
  .sl-client-name{font-family:'Bitter',serif;font-size:16px;font-weight:700;color:#153147;margin-bottom:3px}
  .sl-event-date{font-family:'Montserrat',sans-serif;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px}
  @media print{body{padding:10px 18px}@page{margin:0.5cm;size:letter portrait}}
</style></head><body>
  <div class="sl-header">
    <img class="sl-logo" src="${base}/Insta%20Profile.png" alt="Good Company Wedding Band">
  </div>
  <div class="sl-body ${hasSet2 ? 'two-col' : 'one-col'}">
    <div>
      <div class="sl-set-header">Set 1</div>
      ${buildSongs(_setlistSets[0])}
    </div>
    ${hasSet2 ? `<div>
      <div class="sl-set-header">Set 2</div>
      ${buildSongs(_setlistSets[1])}
    </div>` : ''}
  </div>
  <div class="sl-footer">
    <div class="sl-client-name">${escHtml(name)}</div>
    <div class="sl-event-date">${escHtml(date)}</div>
  </div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { showToast('Allow pop-ups to download PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => setTimeout(() => win.print(), 300));
  setTimeout(() => win.print(), 1200);
}

/* ============================================
   BOOTSTRAP
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* Firebase auth state drives all routing */
  const _adminBypass = new URLSearchParams(window.location.search).get('admin') === '1';

  _auth.onAuthStateChanged(async function(user) {
    const isArtist = user && user.email === ARTIST_EMAIL;
    const isAdmin  = user && user.email === ADMIN_EMAIL;
    const allowed  = isArtist || (isAdmin && _adminBypass);

    if (!allowed) {
      if (!_gigsDashLoaded) {
        document.getElementById('pnav-logout').classList.add('hidden');
        document.getElementById('pnav-back-to-admin').classList.add('hidden');
        showView('view-login');
      }
      return;
    }
    if (_gigsDashLoaded) return;
    try {
      await ADB.loadAll();
      _gigsDashLoaded = true;
      document.getElementById('pnav-logout').classList.toggle('hidden', isAdmin && _adminBypass);
      const backBtn = document.getElementById('pnav-back-to-admin');
      if (isAdmin && _adminBypass) backBtn.classList.remove('hidden');
      renderGigsDash();
      showView('view-gigs');
    } catch(err) {
      console.error('Artist portal load error:', err);
      showToast('Error loading data. Please refresh the page.');
    }
  });

  /* Login — password-only form, email is fixed to ARTIST_EMAIL */
  document.getElementById('artist-login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');
    const pw = document.getElementById('artist-password').value;
    try {
      await _auth.signInWithEmailAndPassword(ARTIST_EMAIL, pw);
      // onAuthStateChanged handles routing
    } catch(err) {
      const badCodes = ['auth/wrong-password','auth/invalid-credential','auth/user-not-found'];
      errEl.textContent = badCodes.includes(err.code) ? 'Incorrect password. Please try again.' : err.message;
      errEl.classList.remove('hidden');
    }
  });

  /* Logout */
  document.getElementById('pnav-logout').addEventListener('click', artistLogout);

  /* Back to gigs */
  document.getElementById('btn-back-to-gigs').addEventListener('click', () => {
    renderGigsDash();
    showView('view-gigs');
    window.scrollTo(0, 0);
  });

  /* View Setlist button */
  document.getElementById('btn-view-setlist').addEventListener('click', () => {
    renderSetlistPreview();
    showView('view-setlist-preview');
    window.scrollTo(0, 0);
  });

  /* Back from setlist preview */
  document.getElementById('btn-back-to-gig').addEventListener('click', () => {
    showView('view-gig');
    window.scrollTo(0, 0);
  });

  /* Download PDF from preview */
  document.getElementById('btn-print-setlist').addEventListener('click', () => {
    if (_currentClientId) downloadSetlistPDF();
  });

  /* Save setlist */
  document.getElementById('btn-save-setlist').addEventListener('click', () => {
    if (_currentClientId) saveSetlist(_currentClientId);
  });

  document.getElementById('btn-download-setlist').addEventListener('click', () => {
    if (_currentClientId) downloadSetlistPDF();
  });

  /* Add Song modal close */
  function closeAddSongModal() {
    document.getElementById('modal-add-song').classList.add('hidden');
    document.getElementById('add-song-lead-step').classList.add('hidden');
    document.getElementById('add-song-list').style.display = '';
    document.getElementById('add-song-search').style.display = '';
    _pendingAddSong = null;
  }
  document.getElementById('modal-add-song-close').addEventListener('click', closeAddSongModal);
  document.getElementById('modal-add-song').addEventListener('click', function(e) {
    if (e.target === this) closeAddSongModal();
  });

  /* Lead picker: Multiple → show free-text field */
  document.getElementById('add-song-lead-select').addEventListener('change', function() {
    document.getElementById('add-song-lead-other').classList.toggle('hidden', this.value !== 'Multiple');
  });

  /* Lead picker confirm — add requested song to setlist */
  document.getElementById('btn-confirm-add-song').addEventListener('click', function() {
    if (!_pendingAddSong) return;
    const sel = document.getElementById('add-song-lead-select').value;
    if (!sel) { showToast('Please select a lead vocalist.'); return; }
    const lead = sel === 'Multiple'
      ? (document.getElementById('add-song-lead-other').value.trim() || sel)
      : sel === 'N/A (Instrumental)' ? 'N/A' : sel;

    const setIndex = +document.querySelector('input[name="add-to-set"]:checked').value;
    _setlistSets[setIndex].push({ ..._pendingAddSong, lead });
    showToast(`Added to Set ${setIndex + 1}`);
    closeAddSongModal();
    _renderSetlistUI();
  });

  /* Add Song search */
  document.getElementById('add-song-search').addEventListener('input', function() {
    _renderAddSongList(this.value);
  });
});
