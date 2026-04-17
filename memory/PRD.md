# Jellybones Music Academy - Rhythm Game PRD

## Original Problem Statement
Build a rhythm game for a music education platform using the user's custom artwork (Jellybells desk bells with faces, drum kit, xylophone, piano, turntable, characters) and proprietary audio files, for young children.

## Product Requirements
- Fun, educational rhythm game for young children
- 5 Game Modes: Free Play, Rhythm Game (falling notes), Simon Says, Ear Trainer, Loop Studio
- Custom user assets: Jellybells, Drum kit, Xylophone, Piano, Turntable, characters, custom audio
- Simple local score tracking (localStorage)
- Multiple difficulty levels and speeds
- Playable via mouse, touch, and keyboard mapping
- Polyphonic audio support
- Fullscreen / ultrawide CSS support
- **CRITICAL**: Instantaneous visual frame swap on press/release for all instruments (no animation, no delay)

## Tech Stack
- React, Tailwind CSS, Framer Motion, React Router
- HTML5 AudioContext + HTMLAudioElement (custom `useAudio.js` hook)
- localStorage for high scores
- No backend persistence needed yet

## Architecture
```
/app/frontend/src/
├── components/
│   ├── JellyBells.js       (shared bells row used in Simon/Ear/elsewhere)
│   ├── Instruments.js       (Xylophone, Piano, DrumKitVisual, BellsVisual, TurntableVisual)
│   ├── FullscreenButton.js
│   └── PageCharacters.js
├── pages/
│   ├── HomePage.js
│   ├── FreePlayPage.js       (main instrument hub)
│   ├── RhythmGamePage.js     (falling notes)
│   ├── SimonSaysPage.js
│   ├── EarTrainerPage.js
│   └── LoopStudioPage.js     (16-step sequencer)
├── hooks/
│   ├── useAudio.js           (polyphonic playback, custom sounds)
│   └── useScores.js          (localStorage high scores)
└── data/songs.js             (rhythm game song library)
```

## Implemented Features (as of Feb 17, 2026)
- ✅ All 5 game modes scaffolded and playable
- ✅ Custom `useAudio` hook for polyphonic playback of MP3 assets
- ✅ Fredoka font, custom characters on all screens
- ✅ Drum kit layout assembled with proper z-ordering from user art
- ✅ Free Play 4-tab instrument selector (Bells, Xylo, Piano, Drums) w/ keyboard mappings
- ✅ Fullscreen/ultrawide CSS support
- ✅ Record + Playback in Free Play
- ✅ Guided "Learn a Song" mode with built-in songs
- ✅ Loop Studio 16-step sequencer with preset patterns
- ✅ **INSTANT visual frame swap** (Feb 17 2026) — all instruments now use imperative DOM writes (`imgRef.current.src = ...`) that execute synchronously in the event handler BEFORE any React state updates. Image JSX src is a constant so React never overrides imperative changes. Zero animation, zero transition, zero delay.
- ✅ Kick drum two-frame swap (kICK 1.png ↔ kICK 2.png) now works via mouse, touch, keyboard, AND Loop Studio sequencer
- ✅ Loop Studio drum/bell sequencer triggers use imperative `.flash(id)` via `forwardRef` — bypasses React state entirely

## Known Good Behavior (verified Feb 17 2026)
Playwright-verified swap chain on Free Play page:
- C bell mouse down → `C 2.png` within 60ms; mouse up → `C 1.png` within 60ms
- C bell keyboard '1' → same instant swap
- Kick drum mouse down → `kICK 2.png`; up → `kICK 1.png`
- Kick drum keyboard 'X' → same instant swap

## Backlog / Roadmap
- **P2**: Add user's custom original song note sequences to `/app/frontend/src/data/songs.js` (blocked on user providing BPM + note orders)
- **P3**: Optional — add visual tap feedback (ripple/glow) that runs AFTER the frame swap so it doesn't block swap perception

## Files Changed This Session
- `/app/frontend/src/components/JellyBells.js` — pure imperative img refs, keyboard handler uses refs
- `/app/frontend/src/components/Instruments.js` — Xylophone/Piano use `forwardRef` + filter brightness style swap; `DrumKitVisual` & `BellsVisual` expose imperative `.flash(id)` for Loop Studio
- `/app/frontend/src/pages/FreePlayPage.js` — `PlayableBell` and `DrumKitPlayable` fully imperative; fixed `DRUM_INFO.kick.img2` to `kICK 2.png`; keyboard handler uses refs; removed all scale/transform animations from instrument interactions
- `/app/frontend/src/pages/RhythmGamePage.js` — bottom bells now imperative refs; removed `pressedKeys` state (replaced with `pressedKeysRef` for dedup only)
- `/app/frontend/src/pages/LoopStudioPage.js` — sequencer `playStep` calls `drumKitRef.current.flash()` / `bellsVisualRef.current.flash()` instead of setState
- `/app/frontend/src/index.css` — removed `.bell-instrument` transform transition and `:active` scale rule

## Testing Credentials
N/A (no auth in this app)
