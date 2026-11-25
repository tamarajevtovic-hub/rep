import { addDays, uid } from './dates';
import { exName, findExercise } from './exercises';
import { EQUIP_LABELS, GOAL_LABELS, ISSUE_LABELS, PLACE_LABELS, type Lang } from './i18n';
import { availableEquip } from './recommend';
import type { ExerciseEntry, Profile, Workout } from './types';

const TXT = {
  sr: {
    run: 'Trčanje', min: 'min', intro: (a: string, b: string) => `Ti si iskusan trener. Napravi mi plan treninga za 7 dana, od ${a} do ${b}.`,
    profile: 'MOJ PROFIL', goals: 'Ciljevi', where: 'Gde treniram', equip: 'Oprema', issues: 'Šta me muči', perWeek: 'Broj treninga nedeljno',
    gym: 'teretana (sva oprema i mašine)', noEquip: 'bez opreme', general: 'opšta forma', nothing: 'ništa posebno',
    recent: 'POSLEDNJI TRENINZI', noneYet: 'Još nemam odrađenih treninga.',
    rules: 'PRAVILA',
    r1: 'Prilagodi vežbe onome što me muči i izbegni ono što to opterećuje.',
    r2: 'Postepeno povećavaj opterećenje u odnosu na poslednje treninge.',
    r3: 'Ako treba, ubaci i trčanje.',
    format: 'ODGOVORI ISKLJUČIVO U OVOM FORMATU, bez ikakvog drugog teksta:',
    ex1: 'Naziv treninga', ex2: 'Naziv vežbe',
    note: 'Napomene o formatu: datum je GGGG-MM-DD; kilaža je opciona; "s" posle broja znači sekunde. Red za trčanje uvek počinje sa TRCANJE.',
  },
  en: {
    run: 'Run', min: 'min', intro: (a: string, b: string) => `You are an experienced coach. Make me a 7-day training plan, from ${a} to ${b}.`,
    profile: 'MY PROFILE', goals: 'Goals', where: 'Where I train', equip: 'Equipment', issues: "What's bugging me", perWeek: 'Workouts per week',
    gym: 'gym (all equipment and machines)', noEquip: 'no equipment', general: 'general fitness', nothing: 'nothing in particular',
    recent: 'RECENT WORKOUTS', noneYet: "I don't have any completed workouts yet.",
    rules: 'RULES',
    r1: 'Adapt exercises to what is bugging me and avoid anything that strains it.',
    r2: 'Gradually increase the load compared to my recent workouts.',
    r3: 'Add running if it makes sense.',
    format: 'ANSWER ONLY IN THIS FORMAT, with no other text:',
    ex1: 'Workout name', ex2: 'Exercise name',
    note: 'Format notes: the date is YYYY-MM-DD; weight is optional; "s" after a number means seconds. A running line always starts with TRCANJE.',
  },
};

function describeWorkout(w: Workout, lang: Lang): string {
  const T = TXT[lang];
  if (w.kind === 'run') {
    return `${w.date} | ${T.run} ${w.run?.km ?? '?'} km${w.run?.minutes ? `, ${w.run.minutes} ${T.min}` : ''}`;
  }
  if (w.kind === 'quick') {
    return `${w.date} | ${w.title}${w.durationMin ? `, ${w.durationMin} ${T.min}` : ''}${w.note ? ` (${w.note})` : ''}`;
  }
  const ex = w.exercises
    .map((e) => {
      const done = e.sets.filter((s) => s.done);
      const sets = (done.length ? done : e.sets)
        .map((s) => `${s.reps ?? '?'}${e.unit === 'sec' ? 's' : ''}${s.kg ? `@${s.kg}kg` : ''}`)
        .join(', ');
      return `  - ${exName(e.name, lang)}: ${sets}`;
    })
    .join('\n');
  return `${w.date} | ${w.title}\n${ex}`;
}

/** Tekst koji korisnik kopira u besplatan AI čet (Claude, ChatGPT...). */
export function buildAiPrompt(p: Profile, workouts: Workout[], today: string, lang: Lang = 'sr'): string {
  const T = TXT[lang];
  const done = workouts
    .filter((w) => w.status === 'done')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);
  const perWeek = Math.max(1, Math.round(p.monthlyTarget / 4.3));
  const equip = p.place === 'teretana' ? T.gym : availableEquip(p).map((e) => EQUIP_LABELS[lang][e]).join(', ') || T.noEquip;
  const start = addDays(today, 1);
  return `${T.intro(start, addDays(start, 6))}

${T.profile}
- ${T.goals}: ${p.goals.map((g) => GOAL_LABELS[lang][g]).join(', ') || T.general}
- ${T.where}: ${PLACE_LABELS[lang][p.place]}
- ${T.equip}: ${equip}
- ${T.issues}: ${p.issues.map((i) => ISSUE_LABELS[lang][i]).join(', ') || T.nothing}
- ${T.perWeek}: ${perWeek}

${T.recent}
${done.length ? done.map((w) => describeWorkout(w, lang)).join('\n') : T.noneYet}

${T.rules}
- ${T.r1}
- ${T.r2}
- ${T.r3}

${T.format}

### 2026-01-05 | ${T.ex1}
- ${T.ex2} | 3x10 | 16kg
- Plank | 3x30s
### 2026-01-07 | ${T.run}
TRCANJE | 5 km

${T.note}`;
}

export interface ParseResult {
  workouts: Workout[];
  errors: string[];
}

const HEADER = /^#{1,4}\s*(\d{4}-\d{2}-\d{2})\s*[|–-]\s*(.+?)\s*$/;
const EXERCISE = /^[-*•]\s*(.+?)\s*\|\s*(\d+)\s*[x×]\s*(\d+)\s*(s|sek|sec)?\s*(?:\|\s*([\d.,]+)\s*kg)?\s*$/i;
const RUN = /^(?:[-*•]\s*)?(?:TR[CČ]ANJE|RUN(?:NING)?)\s*\|\s*([\d.,]+)\s*km/i;

function num(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

/** Pretvara odgovor AI-ja (u zadatom formatu) u planirane treninge. */
export function parseAiPlan(text: string): ParseResult {
  const workouts: Workout[] = [];
  const errors: string[] = [];
  let cur: Workout | null = null;

  const lines = text.replace(/\*\*/g, '').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim().replace(/^`+|`+$/g, '');
    if (!line) continue;
    const h = line.match(HEADER);
    if (h) {
      cur = { id: uid(), date: h[1], status: 'planned', kind: 'strength', title: h[2], exercises: [], source: 'ai' };
      workouts.push(cur);
      continue;
    }
    if (!cur) continue; // tekst pre prvog naslova ignorišemo
    const r = line.match(RUN);
    if (r) {
      cur.kind = 'run';
      cur.run = { km: num(r[1]) };
      continue;
    }
    const e = line.match(EXERCISE);
    if (e) {
      const def = findExercise(e[1]);
      const unit: 'reps' | 'sec' = e[4] ? 'sec' : def?.unit ?? 'reps';
      const sets = Math.min(parseInt(e[2], 10), 10);
      const reps = parseInt(e[3], 10);
      const kg = e[5] ? num(e[5]) : undefined;
      const entry: ExerciseEntry = {
        id: uid(),
        name: def?.name ?? e[1], // poznate vežbe čuvamo pod kanonskim nazivom
        unit,
        target: `${sets} × ${reps}${unit === 'sec' ? 's' : ''}`,
        sets: Array.from({ length: sets }, () => ({ kg, reps, done: false })),
      };
      cur.exercises.push(entry);
      continue;
    }
    errors.push(line);
  }
  return { workouts: workouts.filter((w) => w.kind === 'run' || w.exercises.length > 0), errors };
}
