import { useState } from 'react';
import { EXERCISES, exName } from '../lib/exercises';
import { useT } from '../lib/store';
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
  const { lang, tr } = useT();
  const [w, setW] = useState<Workout>(initial);
  const [picker, setPicker] = useState(false);
  const set = (patch: Partial<Workout>) => setW((x) => ({ ...x, ...patch }));
  const setEx = (id: string, fn: (e: ExerciseEntry) => ExerciseEntry) =>
    setW((x) => ({ ...x, exercises: x.exercises.map((e) => (e.id === id ? fn(e) : e)) }));
  const setSet = (exId: string, i: number, patch: Partial<SetEntry>) =>
    setEx(exId, (e) => ({ ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const future = w.date > todayISO();
  const kindLabel = tr(w.kind === 'run' ? 'ed.kindRun' : w.kind === 'quick' ? 'ed.kindQuick' : 'ed.kindStrength');

  return (
    <div className="screen overlay">
      <header className="row10 pad">
        <button type="button" className="icon-btn" aria-label={tr('back')} onClick={onClose}><Icon name="back" /></button>
        <div className="grow stack4">
          <input className="title-input" aria-label={tr('ed.name')} value={w.title} onChange={(e) => set({ title: e.target.value })} />
          <div className="row8 muted small">
            <span>{kindLabel}</span>·
            <input className="date-input" type="date" aria-label={tr('ed.date')} value={w.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
        </div>
        {!isNew && (
          <button type="button" className="icon-btn" aria-label={tr('ed.delete')} onClick={() => { if (confirm(tr('ed.confirmDelete'))) onDelete(w.id); }}>
            <Icon name="trash" />
          </button>
        )}
      </header>

      {w.source === 'predlog' && w.kind === 'strength' && (
        <div className="note"><Icon name="info" /><span>{tr('ed.suggestNote')}</span></div>
      )}

      <main className="scroll stack14">
        {w.kind === 'strength' && (
          <>
            {w.exercises.length === 0 && <div className="empty">{tr('ed.empty')}</div>}
            {w.exercises.map((e) => (
              <div key={e.id} className="excard stack10">
                <div className="row-between">
                  <div className="exname">{exName(e.name, lang)}</div>
                  <div className="row8">
                    {e.target && <span className="muted small">{e.target}</span>}
                    <button type="button" className="link-btn" aria-label={tr('ed.remove', { name: exName(e.name, lang) })} onClick={() => set({ exercises: w.exercises.filter((x) => x.id !== e.id) })}>✕</button>
                  </div>
                </div>
                <div className="setgrid head"><div>{tr('ed.set')}</div><div>{tr('ed.kg')}</div><div>{e.unit === 'sec' ? tr('ed.sec') : tr('ed.reps')}</div><div /></div>
                {e.sets.map((s, i) => (
                  <div key={i} className="setgrid">
                    <div className="pixel small">{i + 1}</div>
                    <input inputMode="decimal" aria-label={tr('ed.kgAria', { n: i + 1 })} value={s.kg ?? ''} placeholder="–" onChange={(ev) => setSet(e.id, i, { kg: numOrUndef(ev.target.value) })} />
                    <input inputMode="numeric" aria-label={tr('ed.repsAria', { n: i + 1 })} value={s.reps ?? ''} placeholder="–" onChange={(ev) => setSet(e.id, i, { reps: numOrUndef(ev.target.value) })} />
                    <button type="button" aria-label={tr('ed.doneAria', { n: i + 1 })} aria-pressed={s.done} className={s.done ? 'check on' : 'check'} onClick={() => setSet(e.id, i, { done: !s.done })}>
                      <Icon name="check" />
                    </button>
                  </div>
                ))}
                <div className="row10">
                  <button type="button" className="link-btn" onClick={() => setEx(e.id, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? {}), done: false }] }))}>{tr('ed.addSet')}</button>
                  {e.sets.length > 1 && <button type="button" className="link-btn" onClick={() => setEx(e.id, (x) => ({ ...x, sets: x.sets.slice(0, -1) }))}>{tr('ed.removeSet')}</button>}
                </div>
              </div>
            ))}
            <button type="button" className="btn dashed-btn" onClick={() => setPicker(true)}>{tr('ed.addEx')}</button>
          </>
        )}

        {w.kind === 'run' && (
          <div className="card stack12">
            <div className="grid2">
              <label className="field"><span className="label">{tr('ed.km')}</span>
                <input inputMode="decimal" value={w.run?.km ?? ''} onChange={(e) => set({ run: { ...w.run, km: numOrUndef(e.target.value) } })} />
              </label>
              <label className="field"><span className="label">{tr('ed.min')}</span>
                <input inputMode="numeric" value={w.run?.minutes ?? ''} onChange={(e) => set({ run: { ...w.run, minutes: numOrUndef(e.target.value) } })} />
              </label>
            </div>
            {pace(w.run?.km, w.run?.minutes) && <div className="muted">{tr('ed.pace')}: <b className="text">{pace(w.run?.km, w.run?.minutes)}</b></div>}
          </div>
        )}

        {w.kind === 'quick' && (
          <div className="card stack12">
            <label className="field"><span className="label">{tr('ed.duration')}</span>
              <input inputMode="numeric" value={w.durationMin ?? ''} onChange={(e) => set({ durationMin: numOrUndef(e.target.value) })} />
            </label>
          </div>
        )}

        <label className="field">
          <span className="label">{tr('ed.note')}</span>
          <textarea rows={2} value={w.note ?? ''} placeholder={tr('ed.notePh')} onChange={(e) => set({ note: e.target.value })} />
        </label>
      </main>

      <footer className="foot grid2">
        <button type="button" className="btn ghost" onClick={() => onSave({ ...w, status: w.status })}>{w.status === 'done' ? tr('save') : tr('ed.savePlan')}</button>
        {w.status === 'done' ? (
          <button type="button" className="btn ghost" onClick={() => onSave({ ...w, status: 'planned' })}>{tr('ed.backToPlan')}</button>
        ) : (
          <button type="button" className="btn acid" disabled={future} title={future ? tr('ed.futureTitle') : undefined} onClick={() => onComplete(w)}>
            {future ? tr('ed.future') : tr('ed.finish')}
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
  const { lang, tr } = useT();
  const [q, setQ] = useState('');
  const ql = q.toLowerCase();
  const list = EXERCISES.filter((e) => e.name.toLowerCase().includes(ql) || e.en.toLowerCase().includes(ql));
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack10 tall-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={tr('pick.title')}>
        <input autoFocus placeholder={tr('pick.ph')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr('pick.title')} />
        <div className="scroll-inner stack4">
          {q.trim() && !list.some((e) => e.name.toLowerCase() === q.trim().toLowerCase() || e.en.toLowerCase() === q.trim().toLowerCase()) && (
            <button type="button" className="pick acid-text" onClick={() => onPick(q)}>{tr('pick.add', { q: q.trim() })}</button>
          )}
          {list.map((e) => (
            <button key={e.name} type="button" className="pick" onClick={() => onPick(e.name)}>{lang === 'en' ? e.en : e.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
