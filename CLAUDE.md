# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

侨批AI代书人 (Qiaopi AI Letter Writer) — A web app that lets users input plain speech and get AI-generated letters in traditional Qiaopi (侨批) style, the historical "silver-letters" sent by overseas Chinese back home (1820s-1970s, UNESCO Memory of the World). Deployed as a single Vercel project with frontend (Vue 3 SPA) and backend (serverless function).

**Live URL**: `https://qiaopi-ai-krc9.vercel.app` (also via custom domain `qiaopi-ai-krc9.cn`)

## Commands

```bash
# Frontend dev (port 5173, proxies /api to Express)
npm run dev

# Frontend build + type check
npm run build

# Type check only
npx vue-tsc -b --noEmit

# Backend dev (port 3001, reads CHATBOX_API_KEY from .env)
cd server && npx tsx index.ts

# Deploy: push to master → Vercel auto-deploys
git push
```

## Architecture

```
User browser → Vite SPA (Vue 3 + TailwindCSS v4)
                   │ POST /api/generate (SSE streaming)
                   ▼
           api/generate.ts (Vercel serverless function)
                   │ fetch with CHATBOX_API_KEY
                   ▼
          Chatbox AI API (ai.chatboxai.app/v1, OpenAI-compatible)
```

**Key architectural decisions:**
- **No separate backend server in production**: The Express server (`server/`) is for local development only. Production uses `api/generate.ts`, a Vercel serverless function that proxies to Chatbox AI with SSE streaming.
- **Font**: 鸿雷板书简体 (HongLei calligraphy brush font) loaded via jsDelivr CDN, defined in `src/styles/main.css` as `--font-calligraphy`. Only applies to `.vintage-text` elements, not general UI.
- **Vite dev proxy** in `vite.config.ts` forwards `/api/*` to `localhost:3001` for local development.

## Critical Files

| File | Purpose |
|------|---------|
| `api/generate.ts` | **Production AI backend** — system prompt + user message construction + SSE proxy to Chatbox AI. Contains relationship-specific honorific guides and the Qiaopi format system prompt. |
| `server/prompts/system-prompt.ts` | **Dev-only** version of the system prompt (used by Express server). Must be kept in sync with `api/generate.ts`. |
| `src/utils/constants.ts` | `HONORIFIC_MAP` (16 relationship → salutation/blessing/signature mapping), `SCENARIO_METADATA`, `RELATIONSHIP_LABELS`, `CHATBOX_CONFIG` |
| `src/utils/templateData.ts` | 12 pre-written Qiaopi letter templates with structure breakdowns (which parts are fixed vs. variable) |
| `src/components/letter/LetterExport.vue` | Canvas-based image export — renders Qiaopi text on vintage paper textures with ink effects, supports horizontal/vertical layouts |
| `src/stores/letter.ts` | Pinia store for letter generation lifecycle: input → streaming → edit → export, persisted to localStorage |

## Prompt Engineering Notes

The AI generation quality depends heavily on the system prompt in `api/generate.ts`. Key principles learned:
- **Content fidelity first**: The prompt must explicitly instruct the AI to faithfully reproduce user input, not just follow format rules. Without this, the AI generates generic template content.
- **User message structure matters**: Put the user's `plainSpeech` at the TOP of the user message with visual markers (`===`), not buried under metadata fields.
- **Keep system prompt concise**: ~500 chars works better than ~1700 chars. Long format instructions dominate the model's attention over user content.
- Model: `deepseek-v3.2` via Chatbox AI (OpenAI-compatible). Temperature: 0.5.

## Image Export

Canvas 2D API rendering in `LetterExport.vue`:
- 3 paper textures (light/aged/worn) with simulated fiber lines, vignette overlay
- Horizontal: standard left-to-right rendering with word wrap
- Vertical (竖排): characters drawn top-to-bottom, columns right-to-left
- Font must be preloaded before canvas rendering: `document.fonts.load()`
- Export sizes: 1080×1527 (horizontal) or 1920×1080 (vertical)

## Networking Note

The developer is in China. GitHub and Vercel domains are blocked without VPN. Git proxy: `http://127.0.0.1:7890`. Before pushing, run:
```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```
