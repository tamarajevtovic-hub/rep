import { addDays, daysBetween, monthName, startOfWeek, todayISO, monthKey } from '../lib/dates';
import { companionLevel, doneInMonth, keysAvailable } from '../lib/game';
import { LINES, t, type Lang } from '../lib/i18n';
import { suggestRun, suggestWorkout } from '../lib/recommend';
import { useStore, useT } from '../lib/store';
import type { Workout } from '../lib/types';
import { KeyBar, Sprite } from '../components/ui';

function companionLine(lang: Lang, daysSince: number | null, name: string, seed: number): string {
  const L = LINES[lang];
  let list = L.never;
  if (daysSince === 0) list = L.today;
  else if (daysSince !== null && daysSince <= 2) list = L.short;
  else if (daysSince !== null && daysSince <= 5) list = L.mid;
  else if (daysSince !== null) list = L.long;
  return list[seed % list.length].replace('{ime}', name);
}

function fmt(n: number, lang: Lang): string {
  const s = n.toFixed(1);
  return lang === 'sr' ? s.replace('.', ',') : s;
}

export function Home({ onOpen, onGo }: { onOpen: (w: Workout) => void; onGo: (tab: 'plan' | 'sanctuary') => void }) {
  const { data } = useStore();
  const { lang, tr } = useT();
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
        <button type="button" className="sticker" onClick={() => onGo('sanctuary')}>{tr('home.keys', { n: keysAvailable(data) })}</button>
      </header>

      <section className="card-cream">
        <div className="companion">
          <Sprite animal={p.companion} px={7} sleepy={sleepy} />
          <div className="pixel tiny">{p.companionName.toUpperCase()} · LV {lvl.level}</div>
        </div>
        <div className="stack8 grow">
          <div className="pixel tiny dark-pink">{p.name ? tr('home.listen', { name: p.name.toUpperCase() }) : tr('home.says')}</div>
          <p className="speech">{companionLine(lang, daysSince, p.companionName, seed)}</p>
        </div>
      </section>

      <section className="dashed stack10">
        <div className="row-between">
          <div className="pixel small">{tr('home.monthPlan', { month: monthName(today, lang).toUpperCase() })}</div>
          <div className="pixel small acid">{monthDone}/{p.monthlyTarget}</div>
        </div>
        <KeyBar have={Math.min(monthDone, p.monthlyTarget)} total={p.monthlyTarget} />
        <div className="muted small">{toGo > 0 ? tr('home.toGo', { n: toGo }) : tr('home.planDone')}</div>
      </section>

      <section className="card stack12">
        {todayPlanned ? (
          <>
            <div className="row8"><span className="tag cyan">{tr('home.today')}</span><span className="muted small">{todayPlanned.source === 'ai' ? tr('home.fromAi') : tr('home.planned')}</span></div>
            <div className="h2">{todayPlanned.title}</div>
            <div className="muted small">{summary(todayPlanned, lang)}</div>
            <button type="button" className="btn acid" onClick={() => onOpen(todayPlanned)}>{tr('home.log')}</button>
          </>
        ) : todayDone ? (
          <>
            <div className="row8"><span className="tag acid-tag">{tr('home.doneTag')}</span></div>
            <div className="h2">{todayDone.title}</div>
            <div className="muted small">{tr('home.doneText')}</div>
            <button type="button" className="btn ghost" onClick={() => onGo('plan')}>{tr('home.viewPlan')}</button>
          </>
        ) : p.mode === 'plan' ? (
          <>
            <div className="row8"><span className="tag cyan">{tr('home.suggest')}</span><span className="muted small">{tr('home.forToday')}</span></div>
            <div className="h2">{tr('home.which')}</div>
            <div className="muted small">{tr('home.suggestText')}</div>
            <div className="row10">
              <button type="button" className="btn acid grow" onClick={() => onOpen(suggestWorkout(p, data.workouts, today, lang))}>{tr('home.strength')}</button>
              <button type="button" className="btn ghost grow" onClick={() => onOpen(suggestRun(data.workouts, today, lang))}>{tr('home.run')}</button>
            </div>
          </>
        ) : (
          <>
            <div className="row8"><span className="tag cyan">{tr('home.today')}</span></div>
            <div className="h2">{tr('home.nothing')}</div>
            <div className="muted small">{tr('home.nothingText')}</div>
            <button type="button" className="btn acid" onClick={() => onGo('plan')}>{tr('home.openPlan')}</button>
          </>
        )}
      </section>

      <section className="grid3">
        <div className="tile"><div className="muted xs">{tr('home.week')}</div><div className="pixel">{week.length}</div></div>
        <div className="tile"><div className="muted xs">{tr('home.running')}</div><div className="pixel">{fmt(km, lang)}<span className="xs"> km</span></div></div>
        <div className="tile"><div className="muted xs">{tr('home.lifted')}</div><div className="pixel">{fmt(tons, lang)}<span className="xs"> t</span></div></div>
      </section>
    </div>
  );
}

export function summary(w: Workout, lang: Lang): string {
  if (w.kind === 'run') return `${t(lang, 'sum.run', { km: w.run?.km ?? '?' })}${w.run?.minutes ? ` · ${w.run.minutes} min` : ''}`;
  if (w.kind === 'quick') return `${t(lang, 'sum.quick')}${w.durationMin ? ` · ${w.durationMin} min` : ''}${w.note ? ` · ${w.note}` : ''}`;
  const n = w.exercises.length;
  const word = n === 1 ? t(lang, 'sum.ex1') : n < 5 ? t(lang, 'sum.ex2') : t(lang, 'sum.ex5');
  return `${n} ${word}${w.durationMin ? ` · ~${w.durationMin} min` : ''}`;
}
