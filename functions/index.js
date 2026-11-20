const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');
const Anthropic = require('@anthropic-ai/sdk');
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');
const { z } = require('zod');
admin.initializeApp();

const ADMIN_EMAIL  = 'gino@gcweddingband.com';
const ARTIST_EMAIL = 'artist@gcweddingband.com';

// This firebase-functions version calls onCall handlers with a single request
// ({ data, auth }), not the older (data, context) pair.

// Delete by UID (called when admin deletes a client)
exports.deleteAuthUser = functions.https.onCall(async (request) => {
  const data = request.data;
  if (!request.auth || request.auth.token.email !== ADMIN_EMAIL) {
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
exports.deleteAuthUserByEmail = functions.https.onCall(async (request) => {
  const data = request.data;
  if (!request.auth || request.auth.token.email !== ADMIN_EMAIL) {
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
// Active band member who has replaced their temporary password (mirrors isMember() in firestore.rules)
async function isActiveMember(uid) {
  if (!uid) return false;
  const snap = await admin.firestore().doc('members/' + uid).get();
  return snap.exists && snap.get('active') === true && snap.get('mustChangePassword') === false;
}

// Anthropic API key, stored with: npx firebase functions:secrets:set ANTHROPIC_API_KEY
const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

const NoteSummaries = z.object({
  summaries: z.array(z.object({
    id:      z.number().int(),
    summary: z.string(),
    times:   z.array(z.object({ time: z.string(), context: z.string() })),
  })),
});

exports.summarizeScheduleNotes = functions.https.onCall({ secrets: [anthropicKey] }, async (request) => {
  const data  = request.data;
  const email = request.auth && request.auth.token.email;
  const band  = email === ADMIN_EMAIL || email === ARTIST_EMAIL || await isActiveMember(request.auth && request.auth.uid);
  if (!band) {
    throw new functions.https.HttpsError('permission-denied', 'Auth required');
  }

  const { sections } = data || {};
  if (!Array.isArray(sections) || !sections.length) return { summaries: [] };

  const apiKey = anthropicKey.value();
  if (!apiKey) return { summaries: [] }; // degrade gracefully if key not configured

  const numbered = sections
    .map((s, i) => `[${i}] (${s.role})\n${s.text}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are preparing a wedding MC run-of-show document. For each numbered note, write a concise 1–2 sentence summary that is actionable for the MC on the day, using the note's number as its id. If any specific times are mentioned (e.g. "at 7:30", "after dinner", "before cake cutting"), extract them as time hints with a short context; otherwise leave times empty.`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.parse({
      model: 'claude-haiku-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low', format: zodOutputFormat(NoteSummaries) },
      system: systemPrompt,
      messages: [{ role: 'user', content: `Summarize these ${sections.length} note(s) for the MC:\n\n${numbered}` }],
    });
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      console.warn('summarizeScheduleNotes: no summaries', response.stop_reason, response.stop_details || '');
      return { summaries: [] };
    }
    return { summaries: response.parsed_output.summaries };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn('summarizeScheduleNotes rate limited');
    else if (err instanceof Anthropic.APIError) console.error('Anthropic API error:', err.status, err.message);
    else console.error('summarizeScheduleNotes error:', err);
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
