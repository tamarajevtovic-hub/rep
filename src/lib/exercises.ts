import type { Equip, Issue } from './types';

export type Pattern = 'noge' | 'kuk' | 'guranje' | 'vucenje' | 'kor' | 'mobilnost' | 'kardio';

export interface ExerciseDef {
  name: string;
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
  { name: 'Čučanj sa šipkom', pattern: 'noge', needs: ['sipka'], avoid: ['koleno', 'ledja'] },
  { name: 'Goblet čučanj', pattern: 'noge', any: ['bucice', 'kettlebell'] },
  { name: 'Leg press', pattern: 'noge', needs: ['masine'] },
  { name: 'Čučanj do klupe', pattern: 'noge', helps: ['koleno'] },
  { name: 'Iskoraci unazad', pattern: 'noge', avoid: ['koleno'] },
  { name: 'Bugarski čučanj', pattern: 'noge', avoid: ['koleno'] },
  { name: 'Zidni čučanj', pattern: 'noge', unit: 'sec', helps: ['koleno'] },
  // Kuk / zadnja loža
  { name: 'Glute most', pattern: 'kuk', helps: ['koleno', 'ledja', 'kukovi'] },
  { name: 'Hip thrust sa šipkom', pattern: 'kuk', needs: ['sipka', 'klupa'], helps: ['koleno'] },
  { name: 'Rumunsko mrtvo dizanje', pattern: 'kuk', any: ['bucice', 'sipka', 'kettlebell'], avoid: ['ledja'] },
  { name: 'Kettlebell zamah', pattern: 'kuk', needs: ['kettlebell'], avoid: ['ledja'] },
  { name: 'Mrtvo dizanje na jednoj nozi', pattern: 'kuk', helps: ['kukovi'] },
  // Guranje
  { name: 'Bench press', pattern: 'guranje', needs: ['sipka', 'klupa'], avoid: ['rame'] },
  { name: 'Potisak bučicama na klupi', pattern: 'guranje', needs: ['bucice', 'klupa'] },
  { name: 'Potisak bučicama iznad glave', pattern: 'guranje', needs: ['bucice'], avoid: ['rame'] },
  { name: 'Potisak sa gumom', pattern: 'guranje', needs: ['gume'] },
  { name: 'Sklekovi', pattern: 'guranje', avoid: ['rame'] },
  { name: 'Sklekovi na povišenom', pattern: 'guranje' },
  // Vučenje
  { name: 'Zgibovi', pattern: 'vucenje', needs: ['zgibovi'], avoid: ['rame'] },
  { name: 'Lat povlačenje', pattern: 'vucenje', needs: ['masine'] },
  { name: 'Veslanje bučicom jednom rukom', pattern: 'vucenje', needs: ['bucice'], helps: ['drzanje'] },
  { name: 'Australijski zgibovi', pattern: 'vucenje', any: ['zgibovi', 'sipka'] },
  { name: 'Veslanje sa gumom', pattern: 'vucenje', needs: ['gume'], helps: ['drzanje', 'rame'] },
  { name: 'Face pull sa gumom', pattern: 'vucenje', needs: ['gume'], helps: ['rame', 'drzanje'] },
  { name: 'Superman', pattern: 'vucenje', helps: ['drzanje', 'ledja'] },
  // Kor
  { name: 'Dead bug', pattern: 'kor', helps: ['kor', 'ledja'] },
  { name: 'Plank', pattern: 'kor', unit: 'sec', helps: ['kor'] },
  { name: 'Bočni plank', pattern: 'kor', unit: 'sec', helps: ['kor'] },
  { name: 'Bird dog', pattern: 'kor', helps: ['ledja', 'kor'] },
  { name: 'Pallof press sa gumom', pattern: 'kor', needs: ['gume'], helps: ['kor'] },
  { name: 'Hollow hold', pattern: 'kor', unit: 'sec', avoid: ['ledja'] },
  // Mobilnost
  { name: '90/90 rotacije kukova', pattern: 'mobilnost', helps: ['kukovi'] },
  { name: 'Istezanje pregibača kuka', pattern: 'mobilnost', unit: 'sec', helps: ['kukovi', 'ledja'] },
  { name: 'Mačka-krava', pattern: 'mobilnost', helps: ['ledja', 'drzanje'] },
  { name: 'Otvaranje grudnog koša na zidu', pattern: 'mobilnost', helps: ['drzanje', 'rame'] },
  { name: 'Duboki čučanj sa zadržavanjem', pattern: 'mobilnost', unit: 'sec', avoid: ['koleno'], helps: ['kukovi'] },
  // Kardio
  { name: 'Burpiji', pattern: 'kardio', avoid: ['koleno', 'rame'] },
  { name: 'Penjači', pattern: 'kardio' },
  { name: 'Ski skokovi', pattern: 'kardio', avoid: ['koleno'] },
  { name: 'Marš sa visokim kolenima', pattern: 'kardio' },
];

export function canDo(ex: ExerciseDef, equip: Equip[]): boolean {
  if (ex.needs && !ex.needs.every((e) => equip.includes(e))) return false;
  if (ex.any && !ex.any.some((e) => equip.includes(e))) return false;
  return true;
}

export function findExercise(name: string): ExerciseDef | undefined {
  return EXERCISES.find((e) => e.name.toLowerCase() === name.trim().toLowerCase());
}
