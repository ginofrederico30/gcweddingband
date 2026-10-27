/* ============================================
   MY PORTAL — my-portal.js
   Private area for band members with their own login.
   Uses _session, ADB, MDB, isHold, escHtml, fmtDateShort, showView, showToast
   from artist.js / firebase-db.js.
   Firestore rules enforce access: a member can read only their own
   member and payout docs, guests (shared login) can read neither.
   ============================================ */

/* Sections of My Portal. Add more here; the sub-nav appears once there are two. */
const MY_PORTAL_SECTIONS = [
  { id: 'payouts', label: 'Payouts', render: renderPayoutsSection },
];

const PAYOUT_PARTS = [
  ['reception', 'Reception'],
  ['mc',        'MC'],
  ['cocktail',  'Cocktail'],
  ['ceremony',  'Ceremony'],
  ['travel',    'Travel'],
];

/* The single source of payout numbers: { [gigId]: { reception, mc, cocktail, ceremony, travel, total } }.
   Reads payouts/{memberId}/gigs/{gigId}. Nothing is stored there yet, so every value is $0.
   When the Google Sheet is connected, only this function changes. */
async function getPayoutsForMember(memberId, gigIds) {
  const docs = await MDB.getPayoutDocs(memberId);
  const out = {};
  gigIds.forEach(id => {
    const d = docs[id] || {};
    const row = {};
    PAYOUT_PARTS.forEach(([k]) => { row[k] = Number(d[k]) || 0; });
    row.total = PAYOUT_PARTS.reduce((sum, [k]) => sum + row[k], 0);
    out[id] = row;
  });
  return out;
}

/* ---- State ---- */
const _mp = {
  section:  'payouts',
  memberId: null,     // whose portal is shown
  members:  null,     // admin only: all member docs
  showPast: false,
  manageOpen: false,
};

function fmtPayout(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

/* ---- Entry point (My Portal tab or #my-portal) ---- */
async function openMyPortal() {
  if (!_session || _session.role === 'guest') {   // guests never get My Portal
    renderGigsDash();
    showView('view-gigs');
    return;
  }
  history.replaceState(null, '', location.pathname + location.search + '#my-portal');
  showView('view-my-portal');
  const root = document.getElementById('my-portal-root');

  if (_session.role === 'member') {
    _mp.memberId = _session.uid;
  } else {
    root.innerHTML = '<p class="empty-state">Loading…</p>';
    try {
      _mp.members = await MDB.listMembers();
    } catch (e) {
      console.error('Member list error:', e);
      root.innerHTML = '<p class="empty-state">Could not load band members.</p>';
      return;
    }
    if (!_mp.members.some(m => m.id === _mp.memberId)) {
      const first = _mp.members.find(m => m.active) || _mp.members[0];
      _mp.memberId = first ? first.id : null;
    }
  }
  renderMyPortal();
}

function renderMyPortal() {
  const root    = document.getElementById('my-portal-root');
  const isAdmin = _session.role === 'admin';
  const section = MY_PORTAL_SECTIONS.find(s => s.id === _mp.section) || MY_PORTAL_SECTIONS[0];

  let html = '';
  if (isAdmin) html += adminBarHTML();
  if (isAdmin && _mp.memberId) {
    const m = _mp.members.find(x => x.id === _mp.memberId);
    html += `<div class="mp-viewing-banner"><i class="fas fa-eye"></i> Viewing as <strong>${escHtml(m.name)}</strong><span>Read only</span></div>`;
  }
  if (MY_PORTAL_SECTIONS.length > 1) {
    html += '<div class="mp-subnav">' + MY_PORTAL_SECTIONS.map(s =>
      `<button type="button" class="mp-subnav-btn${s.id === section.id ? ' active' : ''}" data-mp-section="${s.id}">${s.label}</button>`
    ).join('') + '</div>';
  }
  html += '<div id="mp-section-body"></div>';
  root.innerHTML = html;

  wireAdminBar(root);
  root.querySelectorAll('[data-mp-section]').forEach(b => b.addEventListener('click', () => {
    _mp.section = b.dataset.mpSection;
    renderMyPortal();
  }));

  const body = document.getElementById('mp-section-body');
  if (!_mp.memberId) {
    body.innerHTML = '<p class="empty-state">No band members yet. Add one under Band Members.</p>';
    return;
  }
  section.render(body);
}

/* ============================================
   PAYOUTS
   ============================================ */
async function renderPayoutsSection(body) {
  const _d    = new Date();
  const today = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`;
  const clients  = ADB.getClients();
  const upcoming = clients.filter(c => !c.eventDate || c.eventDate >= today)
    .sort((a,b) => (a.eventDate||'9999').localeCompare(b.eventDate||'9999'));
  const past     = clients.filter(c => c.eventDate && c.eventDate < today)
    .sort((a,b) => b.eventDate.localeCompare(a.eventDate));
  const shown    = _mp.showPast ? upcoming.concat(past) : upcoming;

  body.innerHTML = `
    <div class="page-header mp-header">
      <div>
        <span class="eyebrow-label">My Portal</span>
        <h2>Payouts</h2>
      </div>
      ${past.length ? `<label class="mp-past-toggle"><input type="checkbox" id="mp-show-past"${_mp.showPast ? ' checked' : ''}> Show past gigs</label>` : ''}
    </div>
    <p class="empty-state">Loading…</p>`;
  const pastCb = document.getElementById('mp-show-past');
  if (pastCb) pastCb.addEventListener('change', () => { _mp.showPast = pastCb.checked; renderPayoutsSection(body); });

  const memberId = _mp.memberId;
  let payouts;
  try {
    payouts = await getPayoutsForMember(memberId, shown.map(c => c.id));
  } catch (e) {
    console.error('Payout load error:', e);
    body.querySelector('.empty-state').textContent = 'Could not load payouts.';
    return;
  }
  if (memberId !== _mp.memberId) return;   // admin switched members while loading

  const grand = shown.reduce((sum, c) => sum + payouts[c.id].total, 0);
  const cards = list => list.map(c => payoutCardHTML(c, payouts[c.id])).join('');

  body.querySelector('.empty-state').outerHTML = `
    <div class="mp-total-card">
      <div>
        <div class="mp-total-label">Total payout</div>
        <div class="mp-total-sub">${shown.length} gig${shown.length === 1 ? '' : 's'}${_mp.showPast ? ', including past' : ' upcoming'}</div>
      </div>
      <div class="mp-total-amount">${fmtPayout(grand)}</div>
    </div>
    ${upcoming.length ? cards(upcoming) : '<p class="empty-state">No upcoming gigs.</p>'}
    ${_mp.showPast && past.length ? `<div class="artist-past-divider"><span>Past Gigs</span></div>${cards(past)}` : ''}`;
}

function payoutCardHTML(c, p) {
  const contract = ADB.getContract(c.id);
  const a  = contract.admin  || {};
  const cl = contract.client || {};
  const venue = cl.venue || a.venue || '';
  const where = [venue, c.venueCity].filter(Boolean).map(escHtml).join(' · ');
  const name  = c.spouseName ? c.name + ' & ' + c.spouseName : c.name;
  const hold  = isHold(c.id);
  const badge = hold
    ? `<span class="status-badge status-hold" title="${HOLD_TITLE}"><i class="fas fa-hourglass-half"></i> Hold</span>`
    : '<span class="status-badge status-signed">Booked</span>';
  const rows = PAYOUT_PARTS.map(([k, label]) =>
    `<div class="mp-pay-row"><dt>${label}</dt><dd>${fmtPayout(p[k])}</dd></div>`).join('');
  return `
    <div class="mp-gig${hold ? ' mp-gig-hold' : ''}">
      <div class="mp-gig-top">
        <span class="mp-gig-date"><i class="fas fa-calendar-alt"></i>${fmtDateShort(a.eventDate || c.eventDate)}</span>
        ${badge}
      </div>
      <div class="mp-gig-name">${escHtml(name)}</div>
      ${where ? `<div class="mp-gig-where"><i class="fas fa-map-marker-alt"></i>${where}</div>` : ''}
      <dl class="mp-pay">
        ${rows}
        <div class="mp-pay-row mp-pay-total"><dt>Total</dt><dd>${fmtPayout(p.total)}</dd></div>
      </dl>
    </div>`;
}

/* ============================================
   ADMIN — member picker + band member accounts
   ============================================ */
function adminBarHTML() {
  const opts = _mp.members.map(m =>
    `<option value="${escHtml(m.id)}"${m.id === _mp.memberId ? ' selected' : ''}>${escHtml(m.name)}${m.active ? '' : ' (inactive)'}</option>`).join('');
  const status = m => !m.active
    ? '<span class="status-badge status-none">Inactive</span>'
    : m.mustChangePassword
      ? '<span class="status-badge status-pending">Temp password</span>'
      : '<span class="status-badge status-signed">Active</span>';
  const rows = _mp.members.map(m => `
    <div class="mp-member-row">
      <div class="mp-member-info"><strong>${escHtml(m.name)}</strong><span>${escHtml(m.email)}</span></div>
      ${status(m)}
      <button type="button" class="mp-link-btn" data-mp-toggle-active="${escHtml(m.id)}">${m.active ? 'Deactivate' : 'Reactivate'}</button>
    </div>`).join('');
  return `
    <div class="mp-admin-bar">
      ${_mp.members.length ? `<label class="mp-picker"><span>View as</span><select id="mp-member-picker">${opts}</select></label>` : ''}
      <button type="button" class="btn-secondary mp-manage-btn" id="mp-manage-toggle" aria-expanded="${_mp.manageOpen}">
        <i class="fas fa-users"></i> Band Members
      </button>
    </div>
    <div class="mp-manage${_mp.manageOpen ? '' : ' hidden'}" id="mp-manage">
      ${rows || '<p class="mp-manage-empty">No band members yet.</p>'}
      <form id="mp-add-member" class="mp-add-member" novalidate>
        <h4>Add a band member</h4>
        <div class="field-group"><label for="mp-new-name">Name</label><input type="text" id="mp-new-name" required></div>
        <div class="field-group"><label for="mp-new-email">Email</label><input type="email" id="mp-new-email" required></div>
        <div class="field-group"><label for="mp-new-pw">Temporary password</label><input type="text" id="mp-new-pw" required autocomplete="off" placeholder="At least 6 characters"></div>
        <p class="form-error hidden" id="mp-add-error"></p>
        <button type="submit" class="btn-primary">Add Member</button>
      </form>
    </div>`;
}

function wireAdminBar(root) {
  const picker = root.querySelector('#mp-member-picker');
  if (picker) picker.addEventListener('change', () => { _mp.memberId = picker.value; renderMyPortal(); });

  const toggle = root.querySelector('#mp-manage-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    _mp.manageOpen = !_mp.manageOpen;
    root.querySelector('#mp-manage').classList.toggle('hidden', !_mp.manageOpen);
    toggle.setAttribute('aria-expanded', String(_mp.manageOpen));
  });

  root.querySelectorAll('[data-mp-toggle-active]').forEach(btn => btn.addEventListener('click', async () => {
    const m = _mp.members.find(x => x.id === btn.dataset.mpToggleActive);
    if (!m) return;
    if (m.active && !confirm('Deactivate ' + m.name + '? They will no longer be able to sign in to the band portal.')) return;
    try {
      await MDB.setActive(m.id, !m.active);
      showToast(m.name + (m.active ? ' deactivated.' : ' reactivated.'));
      _mp.members = await MDB.listMembers();
      renderMyPortal();
    } catch (e) {
      console.error(e);
      showToast('Could not update member.');
    }
  }));

  const form = root.querySelector('#mp-add-member');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = root.querySelector('#mp-add-error');
    errEl.classList.add('hidden');
    const name  = root.querySelector('#mp-new-name').value.trim();
    const email = root.querySelector('#mp-new-email').value.trim();
    const pw    = root.querySelector('#mp-new-pw').value;
    const fail  = msg => { errEl.textContent = msg; errEl.classList.remove('hidden'); };
    if (!name || !email) return fail('Name and email are required.');
    if (pw.length < 6)   return fail('Temporary password must be at least 6 characters.');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const uid = await MDB.createMember(name, email, pw);
      showToast(name + ' added. Share the temporary password with them.');
      _mp.members  = await MDB.listMembers();
      _mp.memberId = uid;
      renderMyPortal();
    } catch (err) {
      btn.disabled = false;
      fail(err.code === 'auth/email-already-in-use' ? 'That email already has an account.' : err.message);
    }
  });
}
