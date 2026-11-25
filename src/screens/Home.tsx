import { companionLine } from '../lib/copy';
import { addDays, daysBetween, monthName, startOfWeek, todayISO, monthKey } from '../lib/dates';
import { companionLevel, doneInMonth, keysAvailable } from '../lib/game';
import { suggestRun, suggestWorkout } from '../lib/recommend';
import { useStore } from '../lib/store';
import type { Workout } from '../lib/types';
import { KeyBar, Sprite } from '../components/ui';

export function Home({ onOpen, onGo }: { onOpen: (w: Workout) => void; onGo: (tab: 'plan' | 'sanctuary') => void }) {
  const { data } = useStore();
  const p = data.profile!;
  const today = todayISO();
  const done = data.workouts.filter((w) => w.status === 'done').sort((a, b) => (a.date < b.date ? 1 : -1));
  const lastDone = done.find((w) => w.date <= today);
  const daysSince = lastDone ? daysBetween(lastDone.date, today) : null;
  const lvl = companionLevel(data.workouts);
  const month = monthKey(today);
  const monthDone = doneInMonth(data.workouts, month);
  const todayPlanned = data.workouts.find((w) => w.date === today && w.status === 'planned');
  const todayDone = data.workouts.find((w) => w.date === today && w.status === 'done');

  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const week = done.filter((w) => w.date >= weekStart && w.date <= weekEnd);
  const km = week.reduce((n, w) => n + (w.run?.km ?? 0), 0);
  const tons = week.reduce(
    (n, w) => n + w.exercises.reduce((m, e) => m + e.sets.filter((s) => s.done).reduce((k, s) => k + (s.kg ?? 0) * (s.reps ?? 0), 0), 0),
    0
  ) / 1000;

  const seed = new Date().getDate() + data.workouts.length;
  const sleepy = daysSince === null || daysSince >= 3;
  const toGo = Math.max(0, p.monthlyTarget - monthDone);

  return (
    <div className="scroll stack16 pad-top">
      <header className="row-between">
        <div className="pixel logo">REP</div>
        <button type="button" className="sticker" onClick={() => onGo('sanctuary')}>KLJUČEVI: {keysAvailable(data)}</button>
      </header>

      <section className="card-cream">
        <div className="companion">
          <Sprite animal={p.companion} px={7} sleepy={sleepy} />
          <div className="pixel tiny">{p.companionName.toUpperCase()} · LV {lvl.level}</div>
        </div>
        <div className="stack8 grow">
          <div className="pixel tiny dark-pink">{p.name ? `${p.name.toUpperCase()}, SLUŠAJ:` : 'SAPUTNIK KAŽE:'}</div>
          <p className="speech">{companionLine(daysSince, p.companionName, seed)}</p>
        </div>
      </section>

      <section className="dashed stack10">
        <div className="row-between">
          <div className="pixel small">{monthName(today).toUpperCase()} · PLAN</div>
          <div className="pixel small acid">{monthDone}/{p.monthlyTarget}</div>
        </div>
        <KeyBar have={Math.min(monthDone, p.monthlyTarget)} total={p.monthlyTarget} />
        <div className="muted small">
          {toGo > 0 ? <>Još <b className="text">{toGo}</b> do retke životinje. Neko poseban čeka.</> : <>Plan ispunjen. Retka životinja je stigla u svetilište.</>}
        </div>
      </section>

      <section className="card stack12">
        {todayPlanned ? (
          <>
            <div className="row8"><span className="tag cyan">DANAS</span><span className="muted small">{todayPlanned.source === 'ai' ? 'iz AI plana' : 'planirano'}</span></div>
            <div className="h2">{todayPlanned.title}</div>
            <div className="muted small">{summary(todayPlanned)}</div>
            <button type="button" className="btn acid" onClick={() => onOpen(todayPlanned)}>LOGUJ TRENING</button>
          </>
        ) : todayDone ? (
          <>
            <div className="row8"><span className="tag acid-tag">ODRAĐENO</span></div>
            <div className="h2">{todayDone.title}</div>
            <div className="muted small">Posao za danas je gotov. Odmori. Ili nemoj, nisam ti mama.</div>
            <button type="button" className="btn ghost" onClick={() => onGo('plan')}>Pogledaj plan</button>
          </>
        ) : p.mode === 'plan' ? (
          <>
            <div className="row8"><span className="tag cyan">PREDLOG</span><span className="muted small">za danas</span></div>
            <div className="h2">Trening ili trčanje?</div>
            <div className="muted small">Pravim predlog po tvojim ciljevima, opremi i onome što te muči.</div>
            <div className="row10">
              <button type="button" className="btn acid grow" onClick={() => onOpen(suggestWorkout(p, data.workouts, today))}>TRENING</button>
              <button type="button" className="btn ghost grow" onClick={() => onOpen(suggestRun(data.workouts, today))}>Trčanje</button>
            </div>
          </>
        ) : (
          <>
            <div className="row8"><span className="tag cyan">DANAS</span></div>
            <div className="h2">Ništa planirano</div>
            <div className="muted small">Trening sa trenerom? Upiši ga brzo u planu.</div>
            <button type="button" className="btn acid" onClick={() => onGo('plan')}>OTVORI PLAN</button>
          </>
        )}
      </section>

      <section className="grid3">
        <div className="tile"><div className="muted xs">Ove nedelje</div><div className="pixel">{week.length}</div></div>
        <div className="tile"><div className="muted xs">Trčanje</div><div className="pixel">{km.toFixed(1).replace('.', ',')}<span className="xs"> km</span></div></div>
        <div className="tile"><div className="muted xs">Podignuto</div><div className="pixel">{tons.toFixed(1).replace('.', ',')}<span className="xs"> t</span></div></div>
      </section>
    </div>
  );
}

export function summary(w: Workout): string {
  if (w.kind === 'run') return `Trčanje · ${w.run?.km ?? '?'} km${w.run?.minutes ? ` · ${w.run.minutes} min` : ''}`;
  if (w.kind === 'quick') return `Brzi log${w.durationMin ? ` · ${w.durationMin} min` : ''}${w.note ? ` · ${w.note}` : ''}`;
  const n = w.exercises.length;
  return `${n} ${n === 1 ? 'vežba' : n < 5 ? 'vežbe' : 'vežbi'}${w.durationMin ? ` · ~${w.durationMin} min` : ''}`;
}
