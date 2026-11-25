export type Goal = 'snaga' | 'mrsavljenje' | 'masa' | 'kondicija' | 'pokretljivost';
export type Place = 'teretana' | 'kuca' | 'napolju' | 'kombinacija';
export type Equip = 'bucice' | 'sipka' | 'gume' | 'zgibovi' | 'kettlebell' | 'prostirka' | 'klupa' | 'masine';
export type Issue = 'koleno' | 'rame' | 'ledja' | 'kukovi' | 'kor' | 'drzanje';
export type Mode = 'plan' | 'svoj';
export type AnimalId = 'macka' | 'pas' | 'koka' | 'majmun' | 'lisica' | 'sova' | 'svinja';

export interface Profile {
  name: string;
  mode: Mode;
  goals: Goal[];
  place: Place;
  equip: Equip[];
  issues: Issue[];
  monthlyTarget: number;
  companion: AnimalId;
  companionName: string;
}

export interface SetEntry {
  kg?: number;
  reps?: number;
  done: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  unit: 'reps' | 'sec';
  target?: string;
  sets: SetEntry[];
}

export type WorkoutKind = 'strength' | 'run' | 'quick';

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'planned' | 'done';
  kind: WorkoutKind;
  title: string;
  exercises: ExerciseEntry[];
  run?: { km?: number; minutes?: number };
  durationMin?: number;
  note?: string;
  source?: 'predlog' | 'ai' | 'rucno';
}

export interface Measure {
  date: string;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arm?: number;
}

export interface Rescued {
  animal: AnimalId;
  name: string;
  date: string;
  rare?: boolean;
}

export interface Game {
  keysEarned: number;
  keysSpent: number;
  rewardedWorkoutIds: string[];
  rescued: Rescued[];
  rareMonths: string[];
}

export interface AppData {
  version: 1;
  profile: Profile | null;
  workouts: Workout[];
  measures: Measure[];
  game: Game;
}

export const GOAL_LABEL: Record<Goal, string> = {
  snaga: 'Snaga',
  mrsavljenje: 'Mršavljenje',
  masa: 'Mišićna masa',
  kondicija: 'Kondicija',
  pokretljivost: 'Pokretljivost',
};

export const PLACE_LABEL: Record<Place, string> = {
  teretana: 'Teretana',
  kuca: 'Kod kuće',
  napolju: 'Napolju',
  kombinacija: 'Kombinacija',
};

export const EQUIP_LABEL: Record<Equip, string> = {
  bucice: 'Bučice',
  sipka: 'Šipka + tegovi',
  gume: 'Gume',
  zgibovi: 'Šipka za zgibove',
  kettlebell: 'Kettlebell',
  prostirka: 'Prostirka',
  klupa: 'Klupa',
  masine: 'Mašine',
};

export const ISSUE_LABEL: Record<Issue, string> = {
  koleno: 'Koleno',
  rame: 'Rame',
  ledja: 'Donja leđa',
  kukovi: 'Kukovi (pokretljivost)',
  kor: 'Slab kor',
  drzanje: 'Držanje',
};

export const HOME_EQUIP: Equip[] = ['bucice', 'sipka', 'gume', 'zgibovi', 'kettlebell', 'prostirka', 'klupa'];
