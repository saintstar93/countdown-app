# Countdown App

> App mobile per il countdown degli eventi importanti della vita. Polaroid scorribili con immagine, titolo e countdown. Eventi passati diventano Ricordi.

## Stack Tecnologico

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| Framework | React Native + Expo | SDK 52+ |
| Linguaggio | TypeScript | strict mode |
| Navigazione | Expo Router (file-based routing) | v4+ |
| Stile | NativeWind (Tailwind CSS for RN) | v4+ |
| State Management | Zustand | v5+ |
| Backend / Auth / DB | Supabase | - |
| Animazioni | React Native Reanimated + Gesture Handler | v3+ |
| Immagini Stock | Unsplash API (primario) + Pexels API (fallback) | - |
| Notifiche | expo-notifications | - |
| Calendario | expo-calendar + .ics export | - |

## Struttura Progetto

```
countdown-app/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx             # Home - Polaroid View
│   │   ├── memories.tsx          # Ricordi
│   │   └── profile.tsx           # Profilo / Impostazioni
│   ├── event/
│   │   ├── create.tsx            # Crea evento (modale)
│   │   ├── [id].tsx              # Dettaglio evento
│   │   └── edit/[id].tsx         # Modifica evento
│   ├── suggestions.tsx
│   ├── image-search.tsx          # Ricerca immagini (modale)
│   ├── _layout.tsx
│   └── +not-found.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Input, Modal generici
│   │   ├── PolaroidCard.tsx
│   │   ├── PolaroidSwiper.tsx
│   │   ├── CountdownDisplay.tsx
│   │   ├── TagChip.tsx
│   │   ├── ImageSearchGrid.tsx
│   │   └── EventForm.tsx         # Form condiviso crea/modifica
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useCountdown.ts
│   │   ├── useImageSearch.ts
│   │   └── useTheme.ts
│   ├── services/
│   │   ├── supabase.ts           # Client Supabase
│   │   ├── unsplash.ts
│   │   ├── pexels.ts
│   │   ├── calendar.ts
│   │   └── notifications.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── eventsStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   ├── event.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   ├── countdown.ts
│   │   └── config.ts             # MAX_EVENTS=10, MAX_MEMORIES=10
│   └── utils/
│       ├── countdown.ts
│       ├── date.ts
│       └── validation.ts
├── assets/
├── CLAUDE.md                     # Questo file
├── README.md
├── app.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Convenzioni di Codice

### Naming
- **Componenti**: PascalCase -> `PolaroidCard.tsx`
- **Hook**: camelCase con prefisso "use" -> `useCountdown.ts`
- **Store**: camelCase con suffisso "Store" -> `eventsStore.ts`
- **Tipi/Interface**: PascalCase -> `Event`, `Tag`, `CountdownFormat`
- **Costanti**: UPPER_SNAKE_CASE -> `MAX_EVENTS`
- **File**: camelCase per utility/services, PascalCase per componenti

### Stile e UI
- Usare SOLO classi NativeWind/Tailwind. MAI StyleSheet.create()
- Dark mode: prefisso `dark:` di NativeWind. Es: `className="bg-white dark:bg-gray-900"`
- Colori: definiti in src/constants/colors.ts, referenziati via Tailwind config
- Spaziatura: scala Tailwind (p-2, p-4, m-2, m-4)
- Font: mai hardcodare, usare costanti da src/constants/fonts.ts

### Componenti
- Un componente per file
- Props tipizzate con interface dedicata
- Default export sempre
- Dimensione ideale: 50-150 righe. Se supera 200, valutare split
- Ogni componente DEVE supportare dark mode

### State Management (Zustand)
- Uno store per dominio (auth, events, settings)
- Actions dentro lo store, non nei componenti
- Usare persist middleware per dati che sopravvivono al restart

### Supabase
- Client in src/services/supabase.ts, importato ovunque
- Row Level Security ATTIVA su tutte le tabelle
- Queries tipizzate con tipi generati da Supabase CLI
- Ogni chiamata wrappata in try/catch

### Git
- Branch: feature/nome, fix/nome, chore/nome
- Commit in inglese, imperativo: "add polaroid card component"
- Pull Request per ogni feature -> develop -> main per release

## Regole di Business

### Limiti
- MAX 10 eventi attivi (countdown futuri)
- MAX 10 ricordi (eventi passati)
- Evento passato -> diventa Ricordo automaticamente
- Se Ricordi sono 10, il piu vecchio viene rimosso

### Ordinamento Polaroid
- Ordinati per data crescente (piu vicino = primo)
- Swipe DESTRA -> prossimo evento (piu lontano)
- Swipe SINISTRA -> precedente (piu vicino)

### Formato Countdown
1. Giorni: "47 giorni"
2. Dettagliato: "1 mese, 17 giorni"
3. Ore: "1.128 ore"
4. Settimane: "6 settimane, 5 giorni"
5. Completo: "1 mese, 2 settimane, 3 giorni, 5 ore"

### Categorie/Tag
- Tag personalizzati con nome e colore
- Un evento puo avere piu tag
- Tag predefiniti: Viaggio, Compleanno, Concerto, Lavoro, Personale

### Immagini
- Ricerca primaria: Unsplash API
- Fallback: Pexels API
- Alternativa: upload da galleria
- Attribuzione Unsplash obbligatoria
- Regole: Adatta (contain), Riempi (cover), Centra (center crop), Sfocatura bordi

## Variabili Ambiente

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=xxxxx
EXPO_PUBLIC_PEXELS_API_KEY=xxxxx
```

Prefisso EXPO_PUBLIC_ per variabili client-side.
File .env locale, MAI committare (nel .gitignore).

## Comandi Utili

```bash
npx expo start                    # Dev server
npx expo start --tunnel           # Dev con tunnel
eas build --profile development   # Build sviluppo
eas build --profile production    # Build produzione
npx supabase gen types typescript --project-id <id> > src/types/database.ts
npx eslint . --fix
npx tsc --noEmit
```

## Note per Claude Code

- Segui SEMPRE la struttura cartelle
- Ogni componente DEVE supportare dark mode con classi dark:
- Mai usare `any` come tipo TypeScript
- Mai hardcodare colori, dimensioni o stringhe
- Gestisci SEMPRE errore e stato caricamento
- Per animazioni: Reanimated worklet e shared values, non Animated API
