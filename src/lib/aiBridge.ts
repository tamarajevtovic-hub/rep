import { addDays, uid } from './dates';
import { findExercise } from './exercises';
import { availableEquip } from './recommend';
import {
  EQUIP_LABEL, GOAL_LABEL, ISSUE_LABEL, PLACE_LABEL,
  type ExerciseEntry, type Profile, type Workout,
} from './types';

function describeWorkout(w: Workout): string {
  if (w.kind === 'run') {
    return `${w.date} | Trčanje ${w.run?.km ?? '?'} km${w.run?.minutes ? ` za ${w.run.minutes} min` : ''}`;
  }
  if (w.kind === 'quick') {
    return `${w.date} | ${w.title}${w.durationMin ? `, ${w.durationMin} min` : ''}${w.note ? ` (${w.note})` : ''}`;
  }
  const ex = w.exercises
    .map((e) => {
      const done = e.sets.filter((s) => s.done);
      const sets = (done.length ? done : e.sets)
        .map((s) => `${s.reps ?? '?'}${e.unit === 'sec' ? 's' : ''}${s.kg ? `@${s.kg}kg` : ''}`)
        .join(', ');
      return `  - ${e.name}: ${sets}`;
    })
    .join('\n');
  return `${w.date} | ${w.title}\n${ex}`;
}

/** Tekst koji korisnik kopira u besplatan AI čet (Claude, ChatGPT...). */
export function buildAiPrompt(p: Profile, workouts: Workout[], today: string): string {
  const done = workouts
    .filter((w) => w.status === 'done')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);
  const perWeek = Math.max(1, Math.round(p.monthlyTarget / 4.3));
  const equip = p.place === 'teretana' ? 'teretana (sva oprema i mašine)' : availableEquip(p).map((e) => EQUIP_LABEL[e]).join(', ') || 'bez opreme';
  const start = addDays(today, 1);
  return `Ti si iskusan trener. Napravi mi plan treninga za 7 dana, od ${start} do ${addDays(start, 6)}.

MOJ PROFIL
- Ciljevi: ${p.goals.map((g) => GOAL_LABEL[g]).join(', ') || 'opšta forma'}
- Gde treniram: ${PLACE_LABEL[p.place]}
- Oprema: ${equip}
- Šta me muči: ${p.issues.map((i) => ISSUE_LABEL[i]).join(', ') || 'ništa posebno'}
- Broj treninga nedeljno: ${perWeek}

POSLEDNJI TRENINZI
${done.length ? done.map(describeWorkout).join('\n') : 'Još nemam odrađenih treninga.'}

PRAVILA
- Prilagodi vežbe onome što me muči i izbegni ono što to opterećuje.
- Postepeno povećavaj opterećenje u odnosu na poslednje treninge.
- Ako treba, ubaci i trčanje.

ODGOVORI ISKLJUČIVO U OVOM FORMATU, bez ikakvog drugog teksta:

### 2026-01-05 | Naziv treninga
- Naziv vežbe | 3x10 | 16kg
- Plank | 3x30s
### 2026-01-07 | Trčanje
TRCANJE | 5 km

Napomene o formatu: datum je GGGG-MM-DD; kilaža je opciona; "s" posle broja znači sekunde.`;
}

export interface ParseResult {
  workouts: Workout[];
  errors: string[];
}

const HEADER = /^#{1,4}\s*(\d{4}-\d{2}-\d{2})\s*[|–-]\s*(.+?)\s*$/;
const EXERCISE = /^[-*•]\s*(.+?)\s*\|\s*(\d+)\s*[x×]\s*(\d+)\s*(s|sek|sec)?\s*(?:\|\s*([\d.,]+)\s*kg)?\s*$/i;
const RUN = /^(?:[-*•]\s*)?TR[CČ]ANJE\s*\|\s*([\d.,]+)\s*km/i;

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
        name: def?.name ?? e[1],
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
