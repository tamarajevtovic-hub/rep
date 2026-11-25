import type { Equip, Issue } from './types';

export type Pattern = 'noge' | 'kuk' | 'guranje' | 'vucenje' | 'kor' | 'mobilnost' | 'kardio';

export interface ExerciseDef {
  /** Kanonski (srpski) naziv: čuva se u podacima. */
  name: string;
  /** Engleski naziv za prikaz. */
  en: string;
  pattern: Pattern;
  /** Sva navedena oprema je potrebna. */
  needs?: Equip[];
  /** Dovoljna je bar jedna od navedenih. */
  any?: Equip[];
  unit?: 'reps' | 'sec';
  /** Izbegava se kod ovih problema. */
  avoid?: Issue[];
  /** Posebno korisno kod ovih problema. */
  helps?: Issue[];
}

export const EXERCISES: ExerciseDef[] = [
  // Noge
  { name: 'Čučanj sa šipkom', en: 'Barbell squat', pattern: 'noge', needs: ['sipka'], avoid: ['koleno', 'ledja'] },
  { name: 'Goblet čučanj', en: 'Goblet squat', pattern: 'noge', any: ['bucice', 'kettlebell'] },
  { name: 'Leg press', en: 'Leg press', pattern: 'noge', needs: ['masine'] },
  { name: 'Čučanj do klupe', en: 'Box squat', pattern: 'noge', helps: ['koleno'] },
  { name: 'Iskoraci unazad', en: 'Reverse lunges', pattern: 'noge', avoid: ['koleno'] },
  { name: 'Bugarski čučanj', en: 'Bulgarian split squat', pattern: 'noge', avoid: ['koleno'] },
  { name: 'Zidni čučanj', en: 'Wall sit', pattern: 'noge', unit: 'sec', helps: ['koleno'] },
  // Kuk / zadnja loža
  { name: 'Glute most', en: 'Glute bridge', pattern: 'kuk', helps: ['koleno', 'ledja', 'kukovi'] },
  { name: 'Hip thrust sa šipkom', en: 'Barbell hip thrust', pattern: 'kuk', needs: ['sipka', 'klupa'], helps: ['koleno'] },
  { name: 'Rumunsko mrtvo dizanje', en: 'Romanian deadlift', pattern: 'kuk', any: ['bucice', 'sipka', 'kettlebell'], avoid: ['ledja'] },
  { name: 'Kettlebell zamah', en: 'Kettlebell swing', pattern: 'kuk', needs: ['kettlebell'], avoid: ['ledja'] },
  { name: 'Mrtvo dizanje na jednoj nozi', en: 'Single-leg deadlift', pattern: 'kuk', helps: ['kukovi'] },
  // Guranje
  { name: 'Bench press', en: 'Bench press', pattern: 'guranje', needs: ['sipka', 'klupa'], avoid: ['rame'] },
  { name: 'Potisak bučicama na klupi', en: 'Dumbbell bench press', pattern: 'guranje', needs: ['bucice', 'klupa'] },
  { name: 'Potisak bučicama iznad glave', en: 'Dumbbell overhead press', pattern: 'guranje', needs: ['bucice'], avoid: ['rame'] },
  { name: 'Potisak sa gumom', en: 'Band chest press', pattern: 'guranje', needs: ['gume'] },
  { name: 'Sklekovi', en: 'Push-ups', pattern: 'guranje', avoid: ['rame'] },
  { name: 'Sklekovi na povišenom', en: 'Incline push-ups', pattern: 'guranje' },
  // Vučenje
  { name: 'Zgibovi', en: 'Pull-ups', pattern: 'vucenje', needs: ['zgibovi'], avoid: ['rame'] },
  { name: 'Lat povlačenje', en: 'Lat pulldown', pattern: 'vucenje', needs: ['masine'] },
  { name: 'Veslanje bučicom jednom rukom', en: 'One-arm dumbbell row', pattern: 'vucenje', needs: ['bucice'], helps: ['drzanje'] },
  { name: 'Australijski zgibovi', en: 'Inverted rows', pattern: 'vucenje', any: ['zgibovi', 'sipka'] },
  { name: 'Veslanje sa gumom', en: 'Band row', pattern: 'vucenje', needs: ['gume'], helps: ['drzanje', 'rame'] },
  { name: 'Face pull sa gumom', en: 'Band face pull', pattern: 'vucenje', needs: ['gume'], helps: ['rame', 'drzanje'] },
  { name: 'Superman', en: 'Superman', pattern: 'vucenje', helps: ['drzanje', 'ledja'] },
  // Kor
  { name: 'Dead bug', en: 'Dead bug', pattern: 'kor', helps: ['kor', 'ledja'] },
  { name: 'Plank', en: 'Plank', pattern: 'kor', unit: 'sec', helps: ['kor'] },
  { name: 'Bočni plank', en: 'Side plank', pattern: 'kor', unit: 'sec', helps: ['kor'] },
  { name: 'Bird dog', en: 'Bird dog', pattern: 'kor', helps: ['ledja', 'kor'] },
  { name: 'Pallof press sa gumom', en: 'Band Pallof press', pattern: 'kor', needs: ['gume'], helps: ['kor'] },
  { name: 'Hollow hold', en: 'Hollow hold', pattern: 'kor', unit: 'sec', avoid: ['ledja'] },
  // Mobilnost
  { name: '90/90 rotacije kukova', en: '90/90 hip switches', pattern: 'mobilnost', helps: ['kukovi'] },
  { name: 'Istezanje pregibača kuka', en: 'Hip flexor stretch', pattern: 'mobilnost', unit: 'sec', helps: ['kukovi', 'ledja'] },
  { name: 'Mačka-krava', en: 'Cat-cow', pattern: 'mobilnost', helps: ['ledja', 'drzanje'] },
  { name: 'Otvaranje grudnog koša na zidu', en: 'Wall chest opener', pattern: 'mobilnost', helps: ['drzanje', 'rame'] },
  { name: 'Duboki čučanj sa zadržavanjem', en: 'Deep squat hold', pattern: 'mobilnost', unit: 'sec', avoid: ['koleno'], helps: ['kukovi'] },
  // Kardio
  { name: 'Burpiji', en: 'Burpees', pattern: 'kardio', avoid: ['koleno', 'rame'] },
  { name: 'Penjači', en: 'Mountain climbers', pattern: 'kardio' },
  { name: 'Ski skokovi', en: 'Skater hops', pattern: 'kardio', avoid: ['koleno'] },
  { name: 'Marš sa visokim kolenima', en: 'High-knee march', pattern: 'kardio' },
];

export function canDo(ex: ExerciseDef, equip: Equip[]): boolean {
  if (ex.needs && !ex.needs.every((e) => equip.includes(e))) return false;
  if (ex.any && !ex.any.some((e) => equip.includes(e))) return false;
  return true;
}

/** Traži vežbu po srpskom ili engleskom nazivu. */
export function findExercise(name: string): ExerciseDef | undefined {
  const n = name.trim().toLowerCase();
  return EXERCISES.find((e) => e.name.toLowerCase() === n || e.en.toLowerCase() === n);
}

/** Naziv vežbe za prikaz na izabranom jeziku (nepoznate vežbe ostaju kako su upisane). */
export function exName(name: string, lang: 'sr' | 'en'): string {
  const def = findExercise(name);
  if (!def) return name;
  return lang === 'en' ? def.en : def.name;
}
