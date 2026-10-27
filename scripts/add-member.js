#!/usr/bin/env node
/* ============================================
   add-member.js — create (or reset) a band member login for My Portal

   Usage:
     MEMBER_TEMP_PASSWORD='temp-pass' node scripts/add-member.js --name "Full Name" --email person@example.com
     node scripts/add-member.js --name "Full Name" --email person@example.com --password 'temp-pass'

   Add --reset to give an existing member a new temporary password
   (they will be asked to change it again at next login).

   Credentials (pick one, never commit the key):
     - GOOGLE_APPLICATION_CREDENTIALS=/path/outside/repo/service-account.json
     - gcloud auth application-default login
   ============================================ */
const admin = require('firebase-admin');

const PROJECT_ID = 'gc-wedding-band';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--reset') args.reset = true;
    else if (a.startsWith('--')) args[a.slice(2)] = argv[++i];
  }
  return args;
}

async function main() {
  const args     = parseArgs(process.argv.slice(2));
  const name     = (args.name || '').trim();
  const email    = (args.email || '').trim().toLowerCase();
  const password = args.password || process.env.MEMBER_TEMP_PASSWORD || '';

  if (!name || !email || !password) {
    console.error('Usage: MEMBER_TEMP_PASSWORD=... node scripts/add-member.js --name "Full Name" --email person@example.com [--reset]');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Temporary password must be at least 6 characters.');
    process.exit(1);
  }

  admin.initializeApp({ projectId: PROJECT_ID });
  const auth = admin.auth();
  const db   = admin.firestore();
  const now  = admin.firestore.FieldValue.serverTimestamp();

  let user = null;
  try { user = await auth.getUserByEmail(email); } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
  }

  if (user && !args.reset) {
    console.error(`${email} already has a login (uid ${user.uid}). Use --reset to issue a new temporary password.`);
    process.exit(1);
  }

  if (user) {
    await auth.updateUser(user.uid, { password, displayName: name });
  } else {
    user = await auth.createUser({ email, password, displayName: name });
  }

  const ref  = db.doc('members/' + user.uid);
  const snap = await ref.get();
  await ref.set({
    name,
    email,
    active: true,
    mustChangePassword: true,
    updatedAt: now,
    ...(snap.exists ? {} : { createdAt: now }),
  }, { merge: true });

  console.log(`${args.reset ? 'Reset' : 'Created'} band member ${name} <${email}> (uid ${user.uid}). They must change the temporary password at first login.`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
