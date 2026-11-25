import { useState } from 'react';
import { addDays, dayName, dayNum, monthName, startOfWeek, todayISO, uid } from '../lib/dates';
import { suggestRun, suggestWorkout } from '../lib/recommend';
import { useStore } from '../lib/store';
import type { Workout, WorkoutKind } from '../lib/types';
import { summary } from './Home';

type Status = 'done' | 'planned' | 'missed';

function statusOf(w: Workout, today: string): Status {
  if (w.status === 'done') return 'done';
  return w.date < today ? 'missed' : 'planned';
}

const TAG: Record<Status, { text: string; cls: string }> = {
  done: { text: 'ODRAĐEN', cls: 'acid-tag' },
  planned: { text: 'PLANIRAN', cls: 'pink-tag' },
  missed: { text: 'PROPUŠTEN', cls: 'gray-tag' },
};

export function Plan({ onOpen }: { onOpen: (w: Workout) => void }) {
  const { data } = useStore();
  const p = data.profile!;
  const today = todayISO();
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [adding, setAdding] = useState(false);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const inWeek = data.workouts
    .filter((w) => w.date >= weekStart && w.date <= days[6])
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const dot = (d: string) => {
    const ws = data.workouts.filter((w) => w.date === d);
    if (ws.some((w) => w.status === 'done')) return 'done';
    if (ws.some((w) => statusOf(w, today) === 'missed')) return 'missed';
    if (ws.length) return 'planned';
    return 'none';
  };

  const section = (w: Workout) => (w.date < today ? 'PROŠLO' : w.date === today ? 'DANAS' : 'SLEDI');
  let lastSection = '';

  return (
    <div className="screen">
      <header className="row-between pad">
        <h1 className="pixel h1">PLAN</h1>
        <div className="row8">
          <button type="button" className="icon-btn" aria-label="Prethodna nedelja" onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</button>
          <button type="button" className="chip small-chip" onClick={() => setWeekStart(startOfWeek(today))}>{monthName(weekStart)} {dayNum(weekStart)}.</button>
          <button type="button" className="icon-btn" aria-label="Sledeća nedelja" onClick={() => setWeekStart(addDays(weekStart, 7))}>›</button>
        </div>
      </header>

      <div className="week">
        {days.map((d) => (
          <div key={d} className={d === today ? 'day today' : 'day'}>
            <div className="xs">{dayName(d)}</div>
            <div className="pixel small">{dayNum(d)}</div>
            <div className={`dot ${dot(d)}`} />
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i className="dot done" />Odrađen</span>
        <span><i className="dot planned" />Planiran</span>
        <span><i className="dot missed" />Propušten</span>
      </div>

      <main className="scroll stack10">
        {inWeek.length === 0 && <div className="empty">Prazna nedelja. Kauč se raduje. Ajde da ga razočaramo.</div>}
        {inWeek.map((w) => {
          const s = section(w);
          const head = s !== lastSection ? s : null;
          lastSection = s;
          const st = statusOf(w, today);
          return (
            <div key={w.id} className="stack10">
              {head && <div className={`pixel tiny sec-${s === 'DANAS' ? 'acid' : s === 'SLEDI' ? 'pink' : 'muted'}`}>{head}</div>}
              <button type="button" className={`wrow ${st}`} onClick={() => onOpen(w)}>
                <div className="wdate"><div className="xs muted">{dayName(w.date)}</div><div className="pixel small">{dayNum(w.date)}</div></div>
                <div className="grow left">
                  <div className="wtitle">{w.title}</div>
                  <div className="muted small">{summary(w)}</div>
                </div>
                <span className={`tag ${TAG[st].cls}`}>{TAG[st].text}</span>
              </button>
            </div>
          );
        })}
      </main>

      <footer className="foot grid2">
        <button type="button" className="btn ghost" onClick={() => onOpen(blank('quick', today))}>Brzo loguj</button>
        <button type="button" className="btn acid" onClick={() => setAdding(true)}>+ ISPLANIRAJ</button>
      </footer>

      {adding && (
        <AddSheet
          suggest={p.mode === 'plan'}
          onClose={() => setAdding(false)}
          onPick={(kind, date, suggest) => {
            setAdding(false);
            if (suggest && kind === 'strength') onOpen(suggestWorkout(p, data.workouts, date));
            else if (suggest && kind === 'run') onOpen(suggestRun(data.workouts, date));
            else onOpen(blank(kind, date));
          }}
        />
      )}
    </div>
  );
}

export function blank(kind: WorkoutKind, date: string): Workout {
  return {
    id: uid(),
    date,
    status: 'planned',
    kind,
    title: kind === 'run' ? 'Trčanje' : kind === 'quick' ? 'Trening sa trenerom' : 'Trening',
    exercises: [],
    run: kind === 'run' ? {} : undefined,
    source: 'rucno',
  };
}

function AddSheet({ suggest, onClose, onPick }: { suggest: boolean; onClose: () => void; onPick: (k: WorkoutKind, date: string, suggest: boolean) => void }) {
  const [date, setDate] = useState(addDays(todayISO(), 1));
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack12" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Isplaniraj trening">
        <div className="pixel small">ISPLANIRAJ</div>
        <label className="field">
          <span className="muted small">Dan</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        {suggest && (
          <div className="grid2">
            <button type="button" className="btn acid" onClick={() => onPick('strength', date, true)}>PREDLOG: SNAGA</button>
            <button type="button" className="btn acid" onClick={() => onPick('run', date, true)}>PREDLOG: TRČANJE</button>
          </div>
        )}
        <div className="grid3">
          <button type="button" className="btn ghost" onClick={() => onPick('strength', date, false)}>Snaga</button>
          <button type="button" className="btn ghost" onClick={() => onPick('run', date, false)}>Trčanje</button>
          <button type="button" className="btn ghost" onClick={() => onPick('quick', date, false)}>Brzi</button>
        </div>
        <button type="button" className="btn ghost" onClick={onClose}>Otkaži</button>
      </div>
    </div>
  );
}
