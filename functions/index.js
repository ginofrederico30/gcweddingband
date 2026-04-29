const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();

const ADMIN_EMAIL = 'gino@gcweddingband.com';

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
