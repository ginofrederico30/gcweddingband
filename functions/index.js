const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
admin.initializeApp();

const ADMIN_EMAIL  = 'gino@gcweddingband.com';

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
