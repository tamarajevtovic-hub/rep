import { useState } from 'react';
import { addDays, dayName, dayNum, monthName, startOfWeek, todayISO, uid } from '../lib/dates';
import { suggestRun, suggestWorkout } from '../lib/recommend';
import { useStore, useT } from '../lib/store';
import { t, type Key, type Lang } from '../lib/i18n';
import type { Workout, WorkoutKind } from '../lib/types';
import { summary } from './Home';

type Status = 'done' | 'planned' | 'missed';

function statusOf(w: Workout, today: string): Status {
  if (w.status === 'done') return 'done';
  return w.date < today ? 'missed' : 'planned';
}

const TAG: Record<Status, { key: Key; cls: string }> = {
  done: { key: 'st.done', cls: 'acid-tag' },
  planned: { key: 'st.planned', cls: 'pink-tag' },
  missed: { key: 'st.missed', cls: 'gray-tag' },
};

export function Plan({ onOpen }: { onOpen: (w: Workout) => void }) {
  const { data } = useStore();
  const { lang, tr } = useT();
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

  const section = (w: Workout) => (w.date < today ? 'past' : w.date === today ? 'today' : 'next');
  let lastSection = '';

  return (
    <div className="screen">
      <header className="row-between pad">
        <h1 className="pixel h1">{tr('plan.title')}</h1>
        <div className="row8">
          <button type="button" className="icon-btn" aria-label={tr('plan.prev')} onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</button>
          <button type="button" className="chip small-chip" onClick={() => setWeekStart(startOfWeek(today))}>{lang === 'sr' ? `${dayNum(weekStart)}. ${monthName(weekStart, lang)}` : `${monthName(weekStart, lang).slice(0, 3)} ${dayNum(weekStart)}`}</button>
          <button type="button" className="icon-btn" aria-label={tr('plan.next')} onClick={() => setWeekStart(addDays(weekStart, 7))}>›</button>
        </div>
      </header>

      <div className="week">
        {days.map((d) => (
          <div key={d} className={d === today ? 'day today' : 'day'}>
            <div className="xs">{dayName(d, lang)}</div>
            <div className="pixel small">{dayNum(d)}</div>
            <div className={`dot ${dot(d)}`} />
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i className="dot done" />{tr('lg.done')}</span>
        <span><i className="dot planned" />{tr('lg.planned')}</span>
        <span><i className="dot missed" />{tr('lg.missed')}</span>
      </div>

      <main className="scroll stack10">
        {inWeek.length === 0 && <div className="empty">{tr('plan.empty')}</div>}
        {inWeek.map((w) => {
          const s = section(w);
          const head = s !== lastSection ? s : null;
          lastSection = s;
          const st = statusOf(w, today);
          return (
            <div key={w.id} className="stack10">
              {head && <div className={`pixel tiny sec-${s === 'today' ? 'acid' : s === 'next' ? 'pink' : 'muted'}`}>{tr(`sec.${s}` as Key)}</div>}
              <button type="button" className={`wrow ${st}`} onClick={() => onOpen(w)}>
                <div className="wdate"><div className="xs muted">{dayName(w.date, lang)}</div><div className="pixel small">{dayNum(w.date)}</div></div>
                <div className="grow left">
                  <div className="wtitle">{w.title}</div>
                  <div className="muted small">{summary(w, lang)}</div>
                </div>
                <span className={`tag ${TAG[st].cls}`}>{tr(TAG[st].key)}</span>
              </button>
            </div>
          );
        })}
      </main>

      <footer className="foot grid2">
        <button type="button" className="btn ghost" onClick={() => onOpen(blank('quick', today, lang))}>{tr('plan.quick')}</button>
        <button type="button" className="btn acid" onClick={() => setAdding(true)}>{tr('plan.add')}</button>
      </footer>

      {adding && (
        <AddSheet
          suggest={p.mode === 'plan'}
          onClose={() => setAdding(false)}
          onPick={(kind, date, suggest) => {
            setAdding(false);
            if (suggest && kind === 'strength') onOpen(suggestWorkout(p, data.workouts, date, lang));
            else if (suggest && kind === 'run') onOpen(suggestRun(data.workouts, date, lang));
            else onOpen(blank(kind, date, lang));
          }}
        />
      )}
    </div>
  );
}

export function blank(kind: WorkoutKind, date: string, lang: Lang = 'sr'): Workout {
  return {
    id: uid(),
    date,
    status: 'planned',
    kind,
    title: t(lang, kind === 'run' ? 'blank.run' : kind === 'quick' ? 'blank.quick' : 'blank.strength'),
    exercises: [],
    run: kind === 'run' ? {} : undefined,
    source: 'rucno',
  };
}

function AddSheet({ suggest, onClose, onPick }: { suggest: boolean; onClose: () => void; onPick: (k: WorkoutKind, date: string, suggest: boolean) => void }) {
  const { tr } = useT();
  const [date, setDate] = useState(addDays(todayISO(), 1));
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack12" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={tr('add.title')}>
        <div className="pixel small">{tr('add.title')}</div>
        <label className="field">
          <span className="muted small">{tr('add.day')}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        {suggest && (
          <div className="grid2">
            <button type="button" className="btn acid" onClick={() => onPick('strength', date, true)}>{tr('add.sugStrength')}</button>
            <button type="button" className="btn acid" onClick={() => onPick('run', date, true)}>{tr('add.sugRun')}</button>
          </div>
        )}
        <div className="grid3">
          <button type="button" className="btn ghost" onClick={() => onPick('strength', date, false)}>{tr('add.strength')}</button>
          <button type="button" className="btn ghost" onClick={() => onPick('run', date, false)}>{tr('add.run')}</button>
          <button type="button" className="btn ghost" onClick={() => onPick('quick', date, false)}>{tr('add.quick')}</button>
        </div>
        <button type="button" className="btn ghost" onClick={onClose}>{tr('cancel')}</button>
      </div>
    </div>
  );
}
