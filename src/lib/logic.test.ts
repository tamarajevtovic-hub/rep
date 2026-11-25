import { describe, expect, it } from 'vitest';
import { parseAiPlan, buildAiPrompt } from './aiBridge';
import { candidates, progress, suggestWorkout, suggestRun } from './recommend';
import { completeWorkout, rescue, keysAvailable } from './game';
import { findExercise, exName } from './exercises';
import { t, LINES } from './i18n';
import { EMPTY } from './store';
import type { AppData, Profile, Workout } from './types';

const profile: Profile = {
  name: 'Test', mode: 'plan', goals: ['snaga'], place: 'kuca', equip: ['bucice', 'gume'],
  issues: ['koleno'], monthlyTarget: 3, companion: 'macka', companionName: 'Mrvica',
};

const done = (date: string, exercises: Workout['exercises'] = []): Workout => ({
  id: date + Math.random(), date, status: 'done', kind: 'strength', title: 'X', exercises,
});

describe('preporuke', () => {
  it('ne predlaže vežbe koje opterećuju koleno', () => {
    const names = candidates('noge', profile).map((e) => e.name);
    expect(names).not.toContain('Iskoraci unazad');
    expect(names).not.toContain('Bugarski čučanj');
    expect(names).toContain('Goblet čučanj');
  });

  it('kod kuće bez šipke nema vežbi sa šipkom', () => {
    const w = suggestWorkout(profile, [], '2026-12-01');
    expect(w.exercises.length).toBeGreaterThan(2);
    expect(w.exercises.some((e) => e.name.includes('šipkom'))).toBe(false);
  });

  it('teretana nudi mašine', () => {
    const names = candidates('noge', { ...profile, place: 'teretana', issues: [] }).map((e) => e.name);
    expect(names).toContain('Leg press');
  });

  it('povećava kilažu kad su sve serije odrađene', () => {
    const hist = [done('2026-11-01', [{ id: 'a', name: 'Goblet čučanj', unit: 'reps', sets: [
      { kg: 16, reps: 6, done: true }, { kg: 16, reps: 6, done: true },
    ] }])];
    const r = progress(findExercise('Goblet čučanj'), 'Goblet čučanj', 'reps', { sets: 4, reps: 6, sec: 30 }, hist);
    expect(r.kg).toBe(17);
  });

  it('ne povećava kad serije nisu odrađene', () => {
    const hist = [done('2026-11-01', [{ id: 'a', name: 'Goblet čučanj', unit: 'reps', sets: [
      { kg: 16, reps: 6, done: true }, { kg: 16, reps: 3, done: false },
    ] }])];
    const r = progress(findExercise('Goblet čučanj'), 'Goblet čučanj', 'reps', { sets: 4, reps: 6, sec: 30 }, hist);
    expect(r.kg).toBe(16);
  });

  it('trčanje raste ~10%', () => {
    const hist: Workout[] = [{ ...done('2026-11-01'), kind: 'run', run: { km: 5 } }];
    expect(suggestRun(hist, '2026-11-03').run?.km).toBe(5.5);
  });
});

describe('AI most', () => {
  it('čita plan u zadatom formatu', () => {
    const text = `Evo plana:
### 2026-12-01 | Noge + kor
- Goblet čučanj | 3x10 | 16kg
- Plank | 3x30s
**### 2026-12-03 | Trčanje**
TRCANJE | 5,5 km
nešto čudno`;
    const r = parseAiPlan(text);
    expect(r.workouts).toHaveLength(2);
    expect(r.workouts[0].exercises[0].sets).toHaveLength(3);
    expect(r.workouts[0].exercises[0].sets[0].kg).toBe(16);
    expect(r.workouts[0].exercises[1].unit).toBe('sec');
    expect(r.workouts[1].kind).toBe('run');
    expect(r.workouts[1].run?.km).toBe(5.5);
    expect(r.errors).toEqual(['nešto čudno']);
  });

  it('prompt sadrži profil i format', () => {
    const t = buildAiPrompt(profile, [], '2026-12-01');
    expect(t).toContain('Koleno');
    expect(t).toContain('### ');
  });
});

describe('igra', () => {
  const base: AppData = { ...EMPTY, profile };

  it('jedan ključ dnevno i retka životinja na ispunjen plan', () => {
    let d = base;
    const w1: Workout = { ...done('2026-12-01'), status: 'planned' };
    const w2: Workout = { ...done('2026-12-01'), status: 'planned' };
    let r = completeWorkout(d, w1); d = r.data; expect(r.gotKey).toBe(true);
    r = completeWorkout(d, w2); d = r.data; expect(r.gotKey).toBe(false);
    expect(keysAvailable(d)).toBe(1);
    r = completeWorkout(d, { ...done('2026-12-02'), status: 'planned' }); d = r.data;
    expect(r.rare?.animal).toBe('majmun');
    r = completeWorkout(d, { ...done('2026-12-03'), status: 'planned' });
    expect(r.rare).toBeUndefined();
  });

  it('spašavanje troši 4 ključa', () => {
    const d: AppData = { ...base, game: { ...base.game, keysEarned: 5 } };
    const r = rescue(d);
    expect(r.rescued).toBeDefined();
    expect(keysAvailable(r.data)).toBe(1);
    expect(rescue(r.data).rescued).toBeUndefined();
  });
});

describe('engleski', () => {
  it('predlog dobija engleski naslov, a vežbe ostaju pod kanonskim imenom', () => {
    const w = suggestWorkout(profile, [], '2026-12-01', 'en');
    expect(['Legs + upper body', 'Glutes + back', 'Conditioning', 'Full body']).toContain(w.title);
    expect(findExercise(w.exercises[0].name)?.name).toBe(w.exercises[0].name);
  });

  it('prevodi nazive vežbi i ostavlja nepoznate', () => {
    expect(exName('Goblet čučanj', 'en')).toBe('Goblet squat');
    expect(exName('Moja vežba', 'en')).toBe('Moja vežba');
  });

  it('AI plan na engleskom se mapira na iste vežbe', () => {
    const r = parseAiPlan('### 2026-12-01 | Legs\n- Goblet squat | 3x10 | 16kg\n### 2026-12-02 | Run\nRUN | 4 km');
    expect(r.workouts[0].exercises[0].name).toBe('Goblet čučanj');
    expect(r.workouts[1].run?.km).toBe(4);
  });

  it('engleski prompt je na engleskom', () => {
    const txt = buildAiPrompt(profile, [], '2026-12-01', 'en');
    expect(txt).toContain('Knee');
    expect(txt).toContain('ANSWER ONLY');
  });

  it('svaki ključ ima prevod i iste promenljive', () => {
    expect(t('en', 'home.toGo', { n: 3 })).toContain('3');
    expect(LINES.en.mid[0]).toContain('{ime}');
  });
});
