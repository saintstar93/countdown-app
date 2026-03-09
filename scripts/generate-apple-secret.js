#!/usr/bin/env node
/**
 * Genera il client_secret JWT per Sign In with Apple (Supabase).
 *
 * Uso:
 *   node scripts/generate-apple-secret.js
 *
 * Oppure con percorso .p8 custom:
 *   node scripts/generate-apple-secret.js /percorso/al/AuthKey.p8
 *
 * Prerequisiti:
 *   npm install jsonwebtoken   (una volta sola)
 */

const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');

// ─── Configurazione ───────────────────────────────────────────────────────────

const KEY_ID    = '5QJ7L4D3BM';
const TEAM_ID   = '97ZS4PJC32';
const CLIENT_ID = 'com.nearday.app.web';                // Services ID
const AUDIENCE  = 'https://appleid.apple.com';

// Percorso del file .p8 (argomento CLI o default su ~/Downloads)
const P8_PATH = process.argv[2]
  || path.join(process.env.HOME || '', 'Downloads', `AuthKey_${KEY_ID}.p8`);

// ─── Leggi chiave privata ─────────────────────────────────────────────────────

if (!fs.existsSync(P8_PATH)) {
  console.error(`\n❌  File .p8 non trovato: ${P8_PATH}`);
  console.error(`    Passa il percorso come argomento:`);
  console.error(`    node scripts/generate-apple-secret.js /percorso/al/AuthKey.p8\n`);
  process.exit(1);
}

const privateKey = fs.readFileSync(P8_PATH, 'utf8');

// ─── Genera JWT ───────────────────────────────────────────────────────────────

const now        = Math.floor(Date.now() / 1000);
const sixMonths  = 60 * 60 * 24 * 180; // 180 giorni in secondi

const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + sixMonths,
  aud: AUDIENCE,
  sub: CLIENT_ID,
};

const options = {
  algorithm: 'ES256',
  header: { kid: KEY_ID },
};

const token = jwt.sign(payload, privateKey, options);

// ─── Output ───────────────────────────────────────────────────────────────────

const expDate = new Date((now + sixMonths) * 1000).toLocaleDateString('it-IT', {
  day: '2-digit', month: 'long', year: 'numeric',
});

console.log('\n✅  JWT generato con successo!\n');
console.log('━'.repeat(60));
console.log(token);
console.log('━'.repeat(60));
console.log(`\n📋  Parametri usati:`);
console.log(`    Key ID    : ${KEY_ID}`);
console.log(`    Team ID   : ${TEAM_ID}`);
console.log(`    Client ID : ${CLIENT_ID}`);
console.log(`    Scade il  : ${expDate}`);
console.log(`\n📌  Dove incollare questo token:`);
console.log(`    Supabase Dashboard → Authentication → Providers → Apple`);
console.log(`    Campo: "Secret Key"\n`);
