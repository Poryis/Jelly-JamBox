// useStickers: localStorage-backed hook for earning and reading stickers.
// Also exposes a lightweight event system so UI can show a "sticker earned"
// toast when a mode awards a new sticker.

import { useCallback, useEffect, useState } from 'react';
import { STICKER_MAP } from '../data/stickers';

const STORAGE_KEY = 'jma_stickers_v1';
const FACT_COUNT_KEY = 'jma_facts_seen_v1';

function readEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (_) { return {}; }
}

function writeEarned(earned) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earned)); } catch (_) {}
}

// Subscribe listeners fire on every earn() call so the UI can react.
const listeners = new Set();
function notify(newlyEarnedId) {
  listeners.forEach(fn => {
    try { fn(newlyEarnedId); } catch (_) {}
  });
}

/**
 * earnSticker(id) - idempotent. Stores the sticker with its earned date.
 * Returns true if this was a NEW earn, false if already owned.
 * Safe to call anywhere without a hook (useful inside event handlers).
 */
export function earnSticker(id) {
  if (!STICKER_MAP[id]) return false;
  const earned = readEarned();
  if (earned[id]) return false;
  earned[id] = { earnedAt: new Date().toISOString() };
  writeEarned(earned);
  notify(id);
  return true;
}

/** Helper: count of music facts seen, gates the fact_finder sticker. */
export function noteFactSeen() {
  try {
    const n = parseInt(localStorage.getItem(FACT_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(FACT_COUNT_KEY, String(n));
    if (n >= 10) earnSticker('ach_fact_finder');
  } catch (_) {}
}

export default function useStickers() {
  const [earned, setEarned] = useState(() => readEarned());
  const [toast, setToast] = useState(null); // { id, name, icon, color }

  useEffect(() => {
    const handler = (id) => {
      setEarned(readEarned());
      const meta = STICKER_MAP[id];
      if (meta) setToast({ ...meta });
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const earn = useCallback((id) => earnSticker(id), []);
  const dismissToast = useCallback(() => setToast(null), []);

  return {
    earned,              // { [id]: { earnedAt } }
    earnedCount: Object.keys(earned).length,
    earn,
    toast,
    dismissToast,
  };
}
