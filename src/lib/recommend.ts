import { EXERCISES, canDo, findExercise, type ExerciseDef, type Pattern } from './exercises';
import { HOME_EQUIP, type Equip, type ExerciseEntry, type Profile, type Workout } from './types';
import { uid } from './dates';

export function availableEquip(p: Profile): Equip[] {
  if (p.place === 'teretana') return [...HOME_EQUIP, 'masine'];
  return p.equip;
}

interface Scheme {
  sets: number;
  reps: number;
  sec: number;
}

/** Šema serija/ponavljanja po glavnom cilju. */
export function schemeFor(p: Profile): Scheme {
  if (p.goals.includes('snaga')) return { sets: 4, reps: 6, sec: 30 };
  if (p.goals.includes('masa')) return { sets: 3, reps: 10, sec: 30 };
  if (p.goals.includes('mrsavljenje') || p.goals.includes('kondicija')) return { sets: 3, reps: 12, sec: 40 };
  return { sets: 2, reps: 10, sec: 30 };
}

interface Template {
  title: string;
  patterns: Pattern[];
}

function templates(p: Profile): Template[] {
  const cardio = p.goals.includes('kondicija') || p.goals.includes('mrsavljenje');
  return [
    { title: 'Noge + gornji deo', patterns: ['noge', 'guranje', 'vucenje', 'kor'] },
    { title: 'Zadnjica + leđa', patterns: ['kuk', 'vucenje', 'guranje', 'kor'] },
    cardio
      ? { title: 'Kondicija', patterns: ['noge', 'kardio', 'kuk', 'guranje', 'kardio', 'kor'] }
      : { title: 'Celo telo', patterns: ['noge', 'kuk', 'guranje', 'vucenje', 'kor'] },
  ];
}

function score(ex: ExerciseDef, p: Profile): number {
  let s = 0;
  if (ex.helps?.some((i) => p.issues.includes(i))) s += 3;
  const loaded = (ex.needs?.length ?? 0) + (ex.any?.length ?? 0) > 0;
  if (loaded && (p.goals.includes('snaga') || p.goals.includes('masa'))) s += 2;
  return s;
}

/** Vežbe za dati obrazac pokreta koje osoba može i sme da radi, najbolje prve. */
export function candidates(pattern: Pattern, p: Profile): ExerciseDef[] {
  const equip = availableEquip(p);
  return EXERCISES.filter(
    (e) => e.pattern === pattern && canDo(e, equip) && !e.avoid?.some((i) => p.issues.includes(i))
  ).sort((a, b) => score(b, p) - score(a, p));
}

/** Poslednji odrađen unos iste vežbe. */
export function lastEntry(name: string, history: Workout[]): ExerciseEntry | undefined {
  const done = history
    .filter((w) => w.status === 'done')
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const w of done) {
    const e = w.exercises.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (e) return e;
  }
  return undefined;
}

function increment(def: ExerciseDef | undefined): number {
  if (def?.needs?.includes('sipka') || def?.any?.includes('sipka')) return 2.5;
  if (def?.needs?.includes('masine')) return 5;
  return 1;
}

/**
 * Progresija: ako su prošli put sve serije odrađene sa ciljanim brojem ponavljanja,
 * povećaj kilažu (ili ponavljanja/sekunde bez tega). Inače ostaje isto.
 */
export function progress(
  def: ExerciseDef | undefined,
  name: string,
  unit: 'reps' | 'sec',
  scheme: Scheme,
  history: Workout[]
): { kg?: number; reps: number } {
  const base = unit === 'sec' ? scheme.sec : scheme.reps;
  const last = lastEntry(name, history);
  if (!last || last.sets.length === 0) return { reps: base };
  const lastKg = Math.max(0, ...last.sets.map((s) => s.kg ?? 0));
  const lastReps = Math.max(0, ...last.sets.map((s) => s.reps ?? 0)) || base;
  const allDone = last.sets.every((s) => s.done && (s.reps ?? 0) >= Math.min(lastReps, base));
  if (!allDone) return { kg: lastKg || undefined, reps: lastReps };
  if (lastKg > 0) return { kg: lastKg + increment(def), reps: Math.min(lastReps, base) };
  const step = unit === 'sec' ? 5 : 1;
  return { reps: Math.min(lastReps + step, unit === 'sec' ? 90 : 20) };
}

function entryFor(def: ExerciseDef, scheme: Scheme, history: Workout[], setsOverride?: number): ExerciseEntry {
  const unit = def.unit ?? 'reps';
  const sets = setsOverride ?? scheme.sets;
  const pr = progress(def, def.name, unit, scheme, history);
  return {
    id: uid(),
    name: def.name,
    unit,
    target: `${sets} × ${pr.reps}${unit === 'sec' ? 's' : ''}`,
    sets: Array.from({ length: sets }, () => ({ kg: pr.kg, reps: pr.reps, done: false })),
  };
}

/** Predlog sledećeg treninga snage na osnovu profila i istorije. */
export function suggestWorkout(p: Profile, history: Workout[], date: string): Workout {
  const scheme = schemeFor(p);
  const strengthCount = history.filter((w) => w.kind === 'strength' && w.status === 'done').length;
  const tpls = templates(p);
  const tpl = tpls[strengthCount % tpls.length];
  const used = new Set<string>();
  const exercises: ExerciseEntry[] = [];
  const rotation = Math.floor(strengthCount / tpls.length);

  for (const pattern of tpl.patterns) {
    const list = candidates(pattern, p).filter((e) => !used.has(e.name));
    if (list.length === 0) continue;
    // malo raznovrsnosti: rotiraj među dva najbolja kandidata
    const pick = list[Math.min(rotation % 2, list.length - 1)];
    used.add(pick.name);
    exercises.push(entryFor(pick, scheme, history));
  }

  const needsMobility =
    p.goals.includes('pokretljivost') || p.issues.some((i) => i === 'kukovi' || i === 'drzanje' || i === 'ledja');
  if (needsMobility) {
    const mob = candidates('mobilnost', p).slice(0, p.goals.includes('pokretljivost') ? 2 : 1);
    for (const m of mob) exercises.push(entryFor(m, scheme, history, 2));
  }

  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0);
  return {
    id: uid(),
    date,
    status: 'planned',
    kind: 'strength',
    title: tpl.title,
    exercises,
    durationMin: Math.round(totalSets * 2.5 + 5),
    source: 'predlog',
  };
}

/** Predlog trčanja: prošlo trčanje + ~10%, zaokruženo na 0,5 km. */
export function suggestRun(history: Workout[], date: string): Workout {
  const runs = history
    .filter((w) => w.kind === 'run' && w.status === 'done' && w.run?.km)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const last = runs[0]?.run?.km;
  const km = last ? Math.round(last * 1.1 * 2) / 2 : 3;
  return {
    id: uid(),
    date,
    status: 'planned',
    kind: 'run',
    title: last ? `Trčanje ${km} km` : 'Trčanje 3 km lagano',
    exercises: [],
    run: { km },
    source: 'predlog',
  };
}

export function newExerciseEntry(name: string): ExerciseEntry {
  const def = findExercise(name);
  const unit = def?.unit ?? 'reps';
  return { id: uid(), name: def?.name ?? name.trim(), unit, sets: [{ done: false }, { done: false }, { done: false }] };
}
