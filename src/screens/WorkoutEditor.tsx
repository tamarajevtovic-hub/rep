import { useState } from 'react';
import { EXERCISES } from '../lib/exercises';
import { newExerciseEntry } from '../lib/recommend';
import type { ExerciseEntry, SetEntry, Workout } from '../lib/types';
import { Icon } from '../components/ui';
import { todayISO } from '../lib/dates';

function numOrUndef(v: string): number | undefined {
  if (v.trim() === '') return undefined;
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function pace(km?: number, min?: number): string | null {
  if (!km || !min) return null;
  const p = min / km;
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, '0')} min/km`;
}

export function WorkoutEditor({
  initial, isNew, onClose, onSave, onComplete, onDelete,
}: {
  initial: Workout;
  isNew: boolean;
  onClose: () => void;
  onSave: (w: Workout) => void;
  onComplete: (w: Workout) => void;
  onDelete: (id: string) => void;
}) {
  const [w, setW] = useState<Workout>(initial);
  const [picker, setPicker] = useState(false);
  const set = (patch: Partial<Workout>) => setW((x) => ({ ...x, ...patch }));
  const setEx = (id: string, fn: (e: ExerciseEntry) => ExerciseEntry) =>
    setW((x) => ({ ...x, exercises: x.exercises.map((e) => (e.id === id ? fn(e) : e)) }));
  const setSet = (exId: string, i: number, patch: Partial<SetEntry>) =>
    setEx(exId, (e) => ({ ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const future = w.date > todayISO();
  const kindLabel = w.kind === 'run' ? 'Trčanje' : w.kind === 'quick' ? 'Brzi log' : 'Snaga';

  return (
    <div className="screen overlay">
      <header className="row10 pad">
        <button type="button" className="icon-btn" aria-label="Nazad" onClick={onClose}><Icon name="back" /></button>
        <div className="grow stack4">
          <input className="title-input" aria-label="Naziv treninga" value={w.title} onChange={(e) => set({ title: e.target.value })} />
          <div className="row8 muted small">
            <span>{kindLabel}</span>·
            <input className="date-input" type="date" aria-label="Datum" value={w.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
        </div>
        {!isNew && (
          <button type="button" className="icon-btn" aria-label="Obriši trening" onClick={() => { if (confirm('Obrisati ovaj trening?')) onDelete(w.id); }}>
            <Icon name="trash" />
          </button>
        )}
      </header>

      {w.source === 'predlog' && w.kind === 'strength' && (
        <div className="note"><Icon name="info" /><span>Predlog po tvom profilu. Kilaže su predlog: menjaj slobodno. Boli? Stani.</span></div>
      )}

      <main className="scroll stack14">
        {w.kind === 'strength' && (
          <>
            {w.exercises.length === 0 && <div className="empty">Nema vežbi. Dodaj prvu, nećeš se pokajati. Možda.</div>}
            {w.exercises.map((e) => (
              <div key={e.id} className="excard stack10">
                <div className="row-between">
                  <div className="exname">{e.name}</div>
                  <div className="row8">
                    {e.target && <span className="muted small">{e.target}</span>}
                    <button type="button" className="link-btn" aria-label={`Ukloni ${e.name}`} onClick={() => set({ exercises: w.exercises.filter((x) => x.id !== e.id) })}>✕</button>
                  </div>
                </div>
                <div className="setgrid head"><div>SER</div><div>KG</div><div>{e.unit === 'sec' ? 'SEK' : 'PON'}</div><div /></div>
                {e.sets.map((s, i) => (
                  <div key={i} className="setgrid">
                    <div className="pixel small">{i + 1}</div>
                    <input inputMode="decimal" aria-label={`Kilaža, serija ${i + 1}`} value={s.kg ?? ''} placeholder="–" onChange={(ev) => setSet(e.id, i, { kg: numOrUndef(ev.target.value) })} />
                    <input inputMode="numeric" aria-label={`Ponavljanja, serija ${i + 1}`} value={s.reps ?? ''} placeholder="–" onChange={(ev) => setSet(e.id, i, { reps: numOrUndef(ev.target.value) })} />
                    <button type="button" aria-label={`Serija ${i + 1} gotova`} aria-pressed={s.done} className={s.done ? 'check on' : 'check'} onClick={() => setSet(e.id, i, { done: !s.done })}>
                      <Icon name="check" />
                    </button>
                  </div>
                ))}
                <div className="row10">
                  <button type="button" className="link-btn" onClick={() => setEx(e.id, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? {}), done: false }] }))}>+ serija</button>
                  {e.sets.length > 1 && <button type="button" className="link-btn" onClick={() => setEx(e.id, (x) => ({ ...x, sets: x.sets.slice(0, -1) }))}>− serija</button>}
                </div>
              </div>
            ))}
            <button type="button" className="btn dashed-btn" onClick={() => setPicker(true)}>+ Dodaj vežbu</button>
          </>
        )}

        {w.kind === 'run' && (
          <div className="card stack12">
            <div className="grid2">
              <label className="field"><span className="label">KM</span>
                <input inputMode="decimal" value={w.run?.km ?? ''} onChange={(e) => set({ run: { ...w.run, km: numOrUndef(e.target.value) } })} />
              </label>
              <label className="field"><span className="label">MINUTA</span>
                <input inputMode="numeric" value={w.run?.minutes ?? ''} onChange={(e) => set({ run: { ...w.run, minutes: numOrUndef(e.target.value) } })} />
              </label>
            </div>
            {pace(w.run?.km, w.run?.minutes) && <div className="muted">Tempo: <b className="text">{pace(w.run?.km, w.run?.minutes)}</b></div>}
          </div>
        )}

        {w.kind === 'quick' && (
          <div className="card stack12">
            <label className="field"><span className="label">TRAJANJE (MIN)</span>
              <input inputMode="numeric" value={w.durationMin ?? ''} onChange={(e) => set({ durationMin: numOrUndef(e.target.value) })} />
            </label>
          </div>
        )}

        <label className="field">
          <span className="label">BELEŠKA</span>
          <textarea rows={2} value={w.note ?? ''} placeholder="Kako je bilo? Šta je bolelo? Ko je kriv?" onChange={(e) => set({ note: e.target.value })} />
        </label>
      </main>

      <footer className="foot grid2">
        <button type="button" className="btn ghost" onClick={() => onSave({ ...w, status: w.status })}>{w.status === 'done' ? 'Sačuvaj' : 'Sačuvaj plan'}</button>
        {w.status === 'done' ? (
          <button type="button" className="btn ghost" onClick={() => onSave({ ...w, status: 'planned' })}>Vrati u plan</button>
        ) : (
          <button type="button" className="btn acid" disabled={future} title={future ? 'Ne možeš da završiš trening iz budućnosti' : undefined} onClick={() => onComplete(w)}>
            {future ? 'U BUDUĆNOSTI' : 'ZAVRŠI · +1 KLJUČ'}
          </button>
        )}
      </footer>

      {picker && (
        <ExercisePicker
          onClose={() => setPicker(false)}
          onPick={(name) => { set({ exercises: [...w.exercises, newExerciseEntry(name)] }); setPicker(false); }}
        />
      )}
    </div>
  );
}

function ExercisePicker({ onClose, onPick }: { onClose: () => void; onPick: (name: string) => void }) {
  const [q, setQ] = useState('');
  const list = EXERCISES.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack10 tall-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Dodaj vežbu">
        <input autoFocus placeholder="Traži ili upiši svoju vežbu" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Naziv vežbe" />
        <div className="scroll-inner stack4">
          {q.trim() && !list.some((e) => e.name.toLowerCase() === q.trim().toLowerCase()) && (
            <button type="button" className="pick acid-text" onClick={() => onPick(q)}>+ Dodaj „{q.trim()}“</button>
          )}
          {list.map((e) => (
            <button key={e.name} type="button" className="pick" onClick={() => onPick(e.name)}>{e.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
