import { COMMON_POOL, PUNK_NAMES, RARE_ANIMAL, RESCUE_COST } from './animals';
import { monthKey, todayISO } from './dates';
import type { AppData, Rescued, Workout } from './types';

export function keysAvailable(d: AppData): number {
  return d.game.keysEarned - d.game.keysSpent;
}

export function doneInMonth(workouts: Workout[], month: string): number {
  return workouts.filter((w) => w.status === 'done' && monthKey(w.date) === month).length;
}

export function companionLevel(workouts: Workout[]): { level: number; xp: number; next: number } {
  const xp = workouts.filter((w) => w.status === 'done').length * 10;
  return { level: Math.floor(xp / 50) + 1, xp: xp % 50, next: 50 };
}

function pickName(taken: string[]): string {
  const free = PUNK_NAMES.filter((n) => !taken.includes(n));
  const list = free.length ? free : PUNK_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

export interface CompleteResult {
  data: AppData;
  gotKey: boolean;
  rare?: Rescued;
}

/**
 * Označava trening kao odrađen. Ključ se dobija za najviše jedan trening dnevno.
 * Kad se ispuni mesečni plan, stiže retka životinja.
 */
export function completeWorkout(d: AppData, w: Workout): CompleteResult {
  const done: Workout = { ...w, status: 'done' };
  const workouts = d.workouts.some((x) => x.id === w.id)
    ? d.workouts.map((x) => (x.id === w.id ? done : x))
    : [...d.workouts, done];

  const rewardedSameDay = d.workouts.some(
    (x) => x.date === w.date && x.id !== w.id && d.game.rewardedWorkoutIds.includes(x.id)
  );
  const gotKey = !d.game.rewardedWorkoutIds.includes(w.id) && !rewardedSameDay;
  const game = { ...d.game, rescued: [...d.game.rescued], rareMonths: [...d.game.rareMonths] };
  if (gotKey) {
    game.keysEarned += 1;
    game.rewardedWorkoutIds = [...game.rewardedWorkoutIds, w.id];
  }

  let rare: Rescued | undefined;
  const month = monthKey(w.date);
  const target = d.profile?.monthlyTarget ?? 12;
  if (doneInMonth(workouts, month) >= target && !game.rareMonths.includes(month)) {
    rare = { animal: RARE_ANIMAL, name: pickName(game.rescued.map((r) => r.name)), date: todayISO(), rare: true };
    game.rescued.push(rare);
    game.rareMonths.push(month);
  }
  return { data: { ...d, workouts, game }, gotKey, rare };
}

export function nextRescueAnimal(d: AppData) {
  const have = d.game.rescued.map((r) => r.animal);
  const fresh = COMMON_POOL.find((a) => !have.includes(a) && a !== d.profile?.companion);
  return fresh ?? COMMON_POOL[d.game.rescued.length % COMMON_POOL.length];
}

export function rescue(d: AppData): { data: AppData; rescued?: Rescued } {
  if (keysAvailable(d) < RESCUE_COST) return { data: d };
  const animal = nextRescueAnimal(d);
  const r: Rescued = { animal, name: pickName(d.game.rescued.map((x) => x.name)), date: todayISO() };
  return {
    data: { ...d, game: { ...d.game, keysSpent: d.game.keysSpent + RESCUE_COST, rescued: [...d.game.rescued, r] } },
    rescued: r,
  };
}
