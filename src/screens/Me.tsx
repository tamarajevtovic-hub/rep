import { useState } from 'react';
import { buildAiPrompt, parseAiPlan, type ParseResult } from '../lib/aiBridge';
import { dayName, dayNum, todayISO } from '../lib/dates';
import { GOAL_LABELS, ISSUE_LABELS, PLACE_LABELS, type Key } from '../lib/i18n';
import { EMPTY, isValidBackup, useStore, useT } from '../lib/store';
import type { Measure } from '../lib/types';
import { summary } from './Home';
import { LangSwitch } from './Onboarding';

export function Me({ onEditProfile, onToast }: { onEditProfile: () => void; onToast: (m: string) => void }) {
  const { data, setData } = useStore();
  const { lang, tr } = useT();
  const p = data.profile!;

  return (
    <div className="scroll stack16 pad-top">
      <header className="row-between">
        <h1 className="pixel h1">{(p.name || tr('nav.me')).toUpperCase()}</h1>
        <button type="button" className="btn ghost small-btn" onClick={onEditProfile}>{tr('me.edit')}</button>
      </header>

      <section className="card stack8 small">
        <div><span className="muted">{tr('me.mode')}:</span> {p.mode === 'plan' ? tr('mode.plan') : tr('mode.own')}</div>
        <div><span className="muted">{tr('me.goals')}:</span> {p.goals.map((g) => GOAL_LABELS[lang][g]).join(', ') || '—'}</div>
        <div><span className="muted">{tr('me.place')}:</span> {PLACE_LABELS[lang][p.place]}</div>
        <div><span className="muted">{tr('me.issues')}:</span> {p.issues.map((i) => ISSUE_LABELS[lang][i]).join(', ') || tr('me.nothing')}</div>
        <div><span className="muted">{tr('me.monthly')}:</span> {tr('me.trainings', { n: p.monthlyTarget })}</div>
      </section>

      <section className="card stack10">
        <div className="pixel small">{tr('me.lang')}</div>
        <LangSwitch />
      </section>

      <AiSection onToast={onToast} />
      <Measures />

      <section className="card stack10">
        <div className="pixel small">{tr('bk.title')}</div>
        <div className="muted small">{tr('bk.note')}</div>
        <div className="grid2">
          <button type="button" className="btn ghost" onClick={() => download(data)}>{tr('bk.save')}</button>
          <label className="btn ghost file-btn">
            {tr('bk.load')}
            <input type="file" accept="application/json" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const parsed = JSON.parse(await f.text());
                if (!isValidBackup(parsed)) throw new Error();
                if (confirm(tr('bk.confirm'))) {
                  setData(() => ({ ...EMPTY, ...parsed }));
                  onToast(tr('bk.loaded'));
                }
              } catch {
                onToast(tr('bk.bad'));
              }
              e.target.value = '';
            }} />
          </label>
        </div>
        <button type="button" className="link-btn danger self-start" onClick={() => {
          if (confirm(tr('bk.wipeConfirm'))) setData((d) => ({ ...EMPTY, lang: d.lang }));
        }}>{tr('bk.wipe')}</button>
      </section>

      <div className="warn">{tr('disclaimer')}</div>
    </div>
  );
}

function download(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rep-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function AiSection({ onToast }: { onToast: (m: string) => void }) {
  const { data, setData } = useStore();
  const { lang, tr } = useT();
  const [paste, setPaste] = useState('');
  const [preview, setPreview] = useState<ParseResult | null>(null);

  const copy = async () => {
    const text = buildAiPrompt(data.profile!, data.workouts, todayISO(), lang);
    try {
      await navigator.clipboard.writeText(text);
      onToast(tr('ai.copied'));
    } catch {
      setPaste(text);
      onToast(tr('ai.copyFail'));
    }
  };

  return (
    <section className="card stack10">
      <div className="row8"><span className="tag cyan">AI</span><div className="pixel small">{tr('ai.title')}</div></div>
      <ol className="steps small">
        <li>{tr('ai.s1')}</li>
        <li>{tr('ai.s2')}</li>
        <li>{tr('ai.s3')}</li>
      </ol>
      <button type="button" className="btn acid" onClick={copy}>{tr('ai.copy')}</button>
      <label className="field">
        <span className="muted small">{tr('ai.paste')}</span>
        <textarea rows={4} value={paste} onChange={(e) => { setPaste(e.target.value); setPreview(null); }} placeholder={'### 2026-12-01 | ...\n- ... | 3x10 | 16kg'} />
      </label>
      <button type="button" className="btn ghost" disabled={!paste.trim()} onClick={() => setPreview(parseAiPlan(paste))}>{tr('ai.read')}</button>

      {preview && (
        <div className="stack8">
          {preview.workouts.length === 0 ? (
            <div className="warn">{tr('ai.none')}</div>
          ) : (
            <>
              <div className="pixel tiny acid">{tr('ai.preview', { n: preview.workouts.length })}</div>
              {preview.workouts.map((w) => (
                <div key={w.id} className="wrow planned static">
                  <div className="wdate"><div className="xs muted">{dayName(w.date, lang)}</div><div className="pixel small">{dayNum(w.date)}</div></div>
                  <div className="grow left"><div className="wtitle">{w.title}</div><div className="muted small">{summary(w, lang)}</div></div>
                </div>
              ))}
            </>
          )}
          {preview.errors.length > 0 && (
            <div className="muted small">{tr('ai.skipped')} {preview.errors.slice(0, 3).map((e) => `“${e}”`).join(', ')}{preview.errors.length > 3 ? '…' : ''}</div>
          )}
          {preview.workouts.length > 0 && (
            <button type="button" className="btn acid" onClick={() => {
              setData((d) => ({ ...d, workouts: [...d.workouts, ...preview.workouts] }));
              onToast(tr('ai.inserted', { n: preview.workouts.length }));
              setPaste('');
              setPreview(null);
            }}>{tr('ai.insert')}</button>
          )}
        </div>
      )}
    </section>
  );
}

function Measures() {
  const { data, setData } = useStore();
  const { tr } = useT();
  const [m, setM] = useState<Measure>({ date: todayISO() });
  const fields: [keyof Measure, Key][] = [['weight', 'ms.weight'], ['waist', 'ms.waist'], ['hips', 'ms.hips'], ['chest', 'ms.chest'], ['arm', 'ms.arm']];
  const list = [...data.measures].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const hasAny = fields.some(([k]) => m[k] !== undefined);
  return (
    <section className="card stack10">
      <div className="pixel small">{tr('ms.title')}</div>
      <div className="muted small">{tr('ms.note')}</div>
      <div className="grid2">
        {fields.map(([k, label]) => (
          <label key={k} className="field">
            <span className="muted xs">{tr(label)}</span>
            <input inputMode="decimal" value={(m[k] as number | undefined) ?? ''} onChange={(e) => {
              const v = parseFloat(e.target.value.replace(',', '.'));
              setM({ ...m, [k]: Number.isFinite(v) ? v : undefined });
            }} />
          </label>
        ))}
      </div>
      <button type="button" className="btn ghost" disabled={!hasAny} onClick={() => {
        setData((d) => ({ ...d, measures: [...d.measures.filter((x) => x.date !== m.date), m] }));
        setM({ date: todayISO() });
      }}>{tr('ms.save')}</button>
      {list.length > 0 && (
        <div className="stack4 small">
          {list.map((x) => (
            <div key={x.date} className="row-between">
              <span className="muted">{x.date}</span>
              <span>{fields.filter(([k]) => x[k] !== undefined).map(([k, l]) => `${tr(l).split(' ')[0]} ${x[k]}`).join(' · ')}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
