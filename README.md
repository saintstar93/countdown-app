Countdown - Life Events Reminder
App mobile per il countdown degli eventi importanti della tua vita. Crea polaroid visive con immagini, countdown in tempo reale e categorie personalizzate. Gli eventi passati diventano Ricordi.
Features

Polaroid scorribili con immagine, titolo e countdown
Ricerca immagini integrata (Unsplash + Pexels)
Categorie/tag colorati personalizzabili
Sezione Ricordi per eventi passati
Dark mode e Light mode
Formati countdown multipli (giorni, ore, settimane, dettagliato)
Font personalizzabili per ogni evento
Esportazione eventi al calendario (.ics)
Sezione suggerimenti per feedback

Tech Stack

React Native + Expo (SDK 52+)
TypeScript
Expo Router (file-based routing)
NativeWind (Tailwind CSS for React Native)
Zustand (state management)
Supabase (auth, database, storage)
React Native Reanimated + Gesture Handler (animazioni)

Getting Started
Prerequisiti

Node.js 18+
npm o yarn
Expo CLI: npm install -g expo-cli
EAS CLI: npm install -g eas-cli
Expo Go app sul telefono (per testing)
Account Supabase (supabase.com)

Setup

Clona il repository:

bashgit clone https://github.com/YOUR_USERNAME/countdown-app.git
cd countdown-app

Installa le dipendenze:

bashnpm install

Crea il file .env nella root:

EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
EXPO_PUBLIC_PEXELS_API_KEY=your_pexels_key

Avvia il server di sviluppo:

bashnpx expo start

Scansiona il QR code con Expo Go (Android) o Camera (iOS).

Database Setup

Crea un progetto su supabase.com
Vai su SQL Editor
Copia e incolla il contenuto di supabase-schema.sql
Esegui
Vai su Authentication > Providers e abilita Google e Apple

Struttura Progetto
Vedi CLAUDE.md per la struttura completa e le convenzioni.
Git Workflow

main - Codice di produzione, solo release testate
develop - Branch di integrazione
feature/* - Nuove funzionalita
fix/* - Bug fix
chore/* - Manutenzione, config, docs

Processo

Crea branch da develop: git checkout -b feature/nome-feature
Sviluppa e committa
Push e apri Pull Request verso develop
Review e merge
Quando develop e stabile: merge in main

Team

Product Owner: Daniele
Lead Developer: [Collaboratore]
AI Co-Developer: Claude Code

License
Private - All rights reserved.Condividi
