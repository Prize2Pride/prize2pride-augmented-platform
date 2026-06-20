<p align="center">
  <h1 align="center">🏆 Prize2Pride</h1>
  <p align="center"><strong>Trilingual AI Knowledge Generation Platform</strong></p>
  <p align="center">
    <img src="https://img.shields.io/badge/Languages-EN%20%7C%20DE%20%7C%20RU-gold?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Avatars-Berlin%20%7C%20Moscow%20%7C%20London-orange?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Stack-React%2019%20%2B%20tRPC%20%2B%20Drizzle-blue?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Tests-16%20Passing-brightgreen?style=for-the-badge" />
  </p>
</p>

---

## Overview

**Prize2Pride** is a premium trilingual AI-powered knowledge generation SaaS platform. Enter any topic, question, or concept and receive comprehensive knowledge **simultaneously in English, German, and Russian** — in a single response, across multiple output formats.

The platform is designed to transcend knowledge boundaries — generating unlimited scientific, creative, cultural, and structured content for training large language models and for human augmentation.

---

## Features

### 🌐 Trilingual Knowledge Engine
- Every response is generated **simultaneously in English (EN), German (DE), and Russian (RU)**
- Not translated — natively composed in each language
- No filtering, no limits — unlimited depth and length

### 🏙️ Three City Avatars
| Avatar | City | Domain | Era |
|--------|------|---------|-----|
| **BERLIN** 🏛️ | Berlin, Germany | Science & Philosophy | Enlightenment → 2300 |
| **MOSCOW** ⭐ | Moscow, Russia | Literature & Mathematics | Imperial → 2300 |
| **LONDON** 👑 | London, United Kingdom | Innovation & Culture | Renaissance → 2300 |

### 📚 Multi-Format Knowledge Output
- **Text** — Long-form structured knowledge (1000+ lines)
- **Scientific** — Academic papers with abstracts, methodology, conclusions
- **Poster** — Visual knowledge cards with AI-generated imagery
- **Creative** — Stories, essays, cultural explorations
- **Song** — Lyrics and musical compositions

### 🖼️ AI Visual Generation
- Generate scientific posters, avatar art, and branded visuals directly in chat
- Powered by state-of-the-art image generation AI

### 📖 Public Knowledge Repository
- All public sessions form a browsable, shareable archive
- Open to the world — searchable, downloadable

### 💾 Session Persistence
- Every generation session saved to your profile
- Toggle sessions public/private
- Download any content as Markdown

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL / TiDB via Drizzle ORM |
| Auth | Manus OAuth |
| AI | LLM (multi-model), Image Generation API |
| Testing | Vitest (16 tests) |
| Fonts | Playfair Display, Space Grotesk, Space Mono |

---

## Architecture

```
prize2pride-platform/
├── client/src/
│   ├── pages/
│   │   ├── Home.tsx          ← Landing page with hero, avatars, features
│   │   ├── Generate.tsx      ← Core AI chat interface
│   │   ├── Avatars.tsx       ← Three city avatar showcase
│   │   ├── AvatarProfile.tsx ← Individual avatar detail page
│   │   ├── Repository.tsx    ← Public knowledge archive
│   │   └── History.tsx       ← User session management
│   ├── components/
│   │   └── Navigation.tsx    ← Trilingual nav with language switcher
│   └── contexts/
│       └── LanguageContext.tsx ← EN/DE/RU i18n context
├── server/
│   ├── routers.ts            ← tRPC procedures (knowledge + auth)
│   ├── db.ts                 ← Database query helpers
│   └── prize2pride.test.ts   ← 16 vitest tests
└── drizzle/
    └── schema.ts             ← knowledge_sessions + knowledge_entries tables
```

---

## Knowledge Generation System

The core generation prompt instructs the AI to produce:

1. **Unlimited depth** — no truncation, comprehensive coverage
2. **Simultaneous trilingual output** — structured with `---ENGLISH---`, `---GERMAN---`, `---RUSSIAN---` markers
3. **Format-specific structure** — scientific papers have abstracts; songs have verses; posters have headlines
4. **LLM training data quality** — rich, accurate, multi-domain knowledge

---

## City Avatar Philosophy

> *"Three cities. Three intellectual traditions. Three augmented minds — transcending knowledge across the annihilation of civilization into the year 2300."*

- **BERLIN** channels Kant, Hegel, Einstein — analytical precision and philosophical depth
- **MOSCOW** channels Tolstoy, Mendeleev, Tchaikovsky — boundless passion and mathematical genius  
- **LONDON** channels Newton, Darwin, Shakespeare — global synthesis and innovative vision

---

## License

MIT — Open knowledge for all.

---

<p align="center">
  <strong>Prize2Pride</strong> · Berlin · Moscow · London · 2300<br/>
  <em>Transcend Knowledge. Across Languages. Across Worlds.</em>
</p>
