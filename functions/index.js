const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
admin.initializeApp();

const ADMIN_EMAIL  = 'gino@gcweddingband.com';
const ARTIST_EMAIL = 'artist@gcweddingband.com';

// Delete by UID (called when admin deletes a client)
exports.deleteAuthUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  if (!data || !data.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'uid required');
  }
  try {
    await admin.auth().deleteUser(data.uid);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw new functions.https.HttpsError('internal', e.message);
  }
  return { ok: true };
});

// Delete by email (called when re-adding a previously deleted client)
exports.deleteAuthUserByEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  if (!data || !data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'email required');
  }
  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().deleteUser(user.uid);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw new functions.https.HttpsError('internal', e.message);
  }
  return { ok: true };
});

// AI summarization for MC schedule notes — called from artist portal
// Requires: firebase functions:config:set anthropic.key="sk-ant-..."
// Active band member who has replaced their temporary password (mirrors isMember() in firestore.rules)
async function isActiveMember(uid) {
  if (!uid) return false;
  const snap = await admin.firestore().doc('members/' + uid).get();
  return snap.exists && snap.get('active') === true && snap.get('mustChangePassword') === false;
}

exports.summarizeScheduleNotes = functions.https.onCall(async (data, context) => {
  const email = context.auth && context.auth.token.email;
  const band  = email === ADMIN_EMAIL || email === ARTIST_EMAIL || await isActiveMember(context.auth && context.auth.uid);
  if (!band) {
    throw new functions.https.HttpsError('permission-denied', 'Auth required');
  }

  const { sections } = data;
  if (!Array.isArray(sections) || !sections.length) return { summaries: [] };

  const apiKey = (functions.config().anthropic || {}).key;
  if (!apiKey) return { summaries: [] }; // degrade gracefully if key not configured

  const numbered = sections
    .map((s, i) => `[${i}] (${s.role})\n${s.text}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are preparing a wedding MC run-of-show document. For each numbered note, write a concise 1–2 sentence summary that is actionable for the MC on the day. If any specific times are mentioned (e.g. "at 7:30", "after dinner", "before cake cutting"), extract them as structured time hints. Return ONLY a valid JSON array with no markdown fences, like: [{"id":0,"summary":"...","times":[{"time":"7:30 PM","context":"toast begins"}]}]`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Summarize these ${sections.length} note(s) for the MC:\n\n${numbered}` }]
      })
    });

    if (!resp.ok) {
      console.error('Anthropic API error:', resp.status, await resp.text());
      return { summaries: [] };
    }

    const result = await resp.json();
    const text   = (result.content && result.content[0] && result.content[0].text) || '[]';
    const match  = text.match(/\[[\s\S]*\]/);
    return { summaries: match ? JSON.parse(match[0]) : [] };
  } catch (err) {
    console.error('summarizeScheduleNotes error:', err);
    return { summaries: [] };
  }
});

// Admin resets a band member's password to a new temporary one (called from My Portal → Band Members).
// Written for the request-style handler this firebase-functions version passes to onCall.
// Only works on accounts that have a members/{uid} record, so it can't touch clients or admin.
exports.resetMemberPassword = functions.https.onCall(async (request) => {
  const email = request.auth && request.auth.token.email;
  if (email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  const { uid, password } = request.data || {};
  if (!uid || typeof password !== 'string' || password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'uid and a password of at least 6 characters are required');
  }
  const ref  = admin.firestore().doc('members/' + uid);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Not a band member');
  }
  // Flag first, so a failure partway never leaves a new password without the forced change
  await ref.update({ mustChangePassword: true, updatedAt: FieldValue.serverTimestamp() });
  await admin.auth().updateUser(uid, { password });
  await admin.auth().revokeRefreshTokens(uid);   // signs them out on other devices
  return { ok: true };
});
