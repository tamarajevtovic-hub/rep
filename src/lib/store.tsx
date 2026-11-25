import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppData } from './types';
import { detectLang, t, type Key, type Lang } from './i18n';

const KEY = 'rep-data-v1';

export const EMPTY: AppData = {
  version: 1,
  profile: null,
  workouts: [],
  measures: [],
  game: { keysEarned: 0, keysSpent: 0, rewardedWorkoutIds: [], rescued: [], rareMonths: [] },
};

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppData;
    return { ...EMPTY, ...parsed, game: { ...EMPTY.game, ...parsed.game } };
  } catch {
    return EMPTY;
  }
}

interface Store {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setState] = useState<AppData>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* pun ili blokiran storage: aplikacija i dalje radi u memoriji */
    }
  }, [data]);
  return <Ctx.Provider value={{ data, setData: (fn) => setState(fn) }}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider nedostaje');
  return s;
}

/** Izabrani jezik i funkcija za prevod. */
export function useT() {
  const { data } = useStore();
  const lang: Lang = data.lang ?? detectLang();
  return { lang, tr: (key: Key, vars?: Record<string, string | number>) => t(lang, key, vars) };
}

export function isValidBackup(x: unknown): x is AppData {
  return !!x && typeof x === 'object' && (x as AppData).version === 1 && Array.isArray((x as AppData).workouts);
}
