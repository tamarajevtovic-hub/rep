import { useState } from 'react';
import { buildAiPrompt, parseAiPlan, type ParseResult } from '../lib/aiBridge';
import { DISCLAIMER } from '../lib/copy';
import { dayName, dayNum, todayISO } from '../lib/dates';
import { EMPTY, isValidBackup, useStore } from '../lib/store';
import { GOAL_LABEL, ISSUE_LABEL, PLACE_LABEL, type Measure } from '../lib/types';
import { summary } from './Home';

export function Me({ onEditProfile, onToast }: { onEditProfile: () => void; onToast: (m: string) => void }) {
  const { data, setData } = useStore();
  const p = data.profile!;

  return (
    <div className="scroll stack16 pad-top">
      <header className="row-between">
        <h1 className="pixel h1">{(p.name || 'JA').toUpperCase()}</h1>
        <button type="button" className="btn ghost small-btn" onClick={onEditProfile}>Izmeni profil</button>
      </header>

      <section className="card stack8 small">
        <div><span className="muted">Režim:</span> {p.mode === 'plan' ? 'Napravi mi plan' : 'Imam svoj plan'}</div>
        <div><span className="muted">Ciljevi:</span> {p.goals.map((g) => GOAL_LABEL[g]).join(', ') || '—'}</div>
        <div><span className="muted">Mesto:</span> {PLACE_LABEL[p.place]}</div>
        <div><span className="muted">Muči te:</span> {p.issues.map((i) => ISSUE_LABEL[i]).join(', ') || 'ništa'}</div>
        <div><span className="muted">Mesečni plan:</span> {p.monthlyTarget} treninga</div>
      </section>

      <AiSection onToast={onToast} />
      <Measures />

      <section className="card stack10">
        <div className="pixel small">REZERVNA KOPIJA</div>
        <div className="muted small">Podaci za sada žive samo na ovom telefonu. Povremeno sačuvaj kopiju, da se ništa ne izgubi.</div>
        <div className="grid2">
          <button type="button" className="btn ghost" onClick={() => download(data)}>Sačuvaj kopiju</button>
          <label className="btn ghost file-btn">
            Učitaj kopiju
            <input type="file" accept="application/json" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const parsed = JSON.parse(await f.text());
                if (!isValidBackup(parsed)) throw new Error();
                if (confirm('Ovo zamenjuje sve trenutne podatke. Nastaviti?')) {
                  setData(() => ({ ...EMPTY, ...parsed }));
                  onToast('Kopija učitana.');
                }
              } catch {
                onToast('Ovo nije REP kopija.');
              }
              e.target.value = '';
            }} />
          </label>
        </div>
        <button type="button" className="link-btn danger self-start" onClick={() => {
          if (confirm('Obrisati SVE podatke? Ovo ne može da se vrati.')) setData(() => EMPTY);
        }}>Obriši sve podatke</button>
      </section>

      <div className="warn">{DISCLAIMER}</div>
    </div>
  );
}

function download(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rep-kopija-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function AiSection({ onToast }: { onToast: (m: string) => void }) {
  const { data, setData } = useStore();
  const [paste, setPaste] = useState('');
  const [preview, setPreview] = useState<ParseResult | null>(null);

  const copy = async () => {
    const text = buildAiPrompt(data.profile!, data.workouts, todayISO());
    try {
      await navigator.clipboard.writeText(text);
      onToast('Kopirano. Nalepi u Claude ili ChatGPT.');
    } catch {
      setPaste(text);
      onToast('Kopiranje nije uspelo: tekst je u polju ispod, kopiraj ručno.');
    }
  };

  return (
    <section className="card stack10">
      <div className="row8"><span className="tag cyan">AI</span><div className="pixel small">PLAN IZ ČETA</div></div>
      <ol className="steps small">
        <li>Kopiraj svoj profil i treninge.</li>
        <li>Nalepi u besplatan AI čet (Claude, ChatGPT).</li>
        <li>Odgovor nalepi ovde i ubaci u plan.</li>
      </ol>
      <button type="button" className="btn acid" onClick={copy}>1 · KOPIRAJ ZA AI</button>
      <label className="field">
        <span className="muted small">3 · Nalepi odgovor</span>
        <textarea rows={4} value={paste} onChange={(e) => { setPaste(e.target.value); setPreview(null); }} placeholder="### 2026-12-01 | Noge + kor&#10;- Goblet čučanj | 3x10 | 16kg" />
      </label>
      <button type="button" className="btn ghost" disabled={!paste.trim()} onClick={() => setPreview(parseAiPlan(paste))}>Pročitaj plan</button>

      {preview && (
        <div className="stack8">
          {preview.workouts.length === 0 ? (
            <div className="warn">Nisam našla nijedan trening. Proveri da li je AI odgovorio u zadatom formatu (redovi koji počinju sa ###).</div>
          ) : (
            <>
              <div className="pixel tiny acid">PREGLED · {preview.workouts.length} TRENINGA</div>
              {preview.workouts.map((w) => (
                <div key={w.id} className="wrow planned static">
                  <div className="wdate"><div className="xs muted">{dayName(w.date)}</div><div className="pixel small">{dayNum(w.date)}</div></div>
                  <div className="grow left"><div className="wtitle">{w.title}</div><div className="muted small">{summary(w)}</div></div>
                </div>
              ))}
            </>
          )}
          {preview.errors.length > 0 && (
            <div className="muted small">Preskočeni redovi koje nisam razumela: {preview.errors.slice(0, 3).map((e) => `„${e}“`).join(', ')}{preview.errors.length > 3 ? '…' : ''}</div>
          )}
          {preview.workouts.length > 0 && (
            <button type="button" className="btn acid" onClick={() => {
              setData((d) => ({ ...d, workouts: [...d.workouts, ...preview.workouts] }));
              onToast(`Ubačeno ${preview.workouts.length} treninga u plan.`);
              setPaste('');
              setPreview(null);
            }}>UBACI U PLAN</button>
          )}
        </div>
      )}
    </section>
  );
}

function Measures() {
  const { data, setData } = useStore();
  const [m, setM] = useState<Measure>({ date: todayISO() });
  const fields: [keyof Measure, string][] = [['weight', 'Težina (kg)'], ['waist', 'Struk (cm)'], ['hips', 'Kukovi (cm)'], ['chest', 'Grudi (cm)'], ['arm', 'Nadlaktica (cm)']];
  const list = [...data.measures].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const hasAny = fields.some(([k]) => m[k] !== undefined);
  return (
    <section className="card stack10">
      <div className="pixel small">TELESNE MERE</div>
      <div className="muted small">Opciono. Upiši šta želiš, ostalo preskoči.</div>
      <div className="grid2">
        {fields.map(([k, label]) => (
          <label key={k} className="field">
            <span className="muted xs">{label}</span>
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
      }}>Sačuvaj mere</button>
      {list.length > 0 && (
        <div className="stack4 small">
          {list.map((x) => (
            <div key={x.date} className="row-between">
              <span className="muted">{x.date}</span>
              <span>{fields.filter(([k]) => x[k] !== undefined).map(([k, l]) => `${l.split(' ')[0]} ${x[k]}`).join(' · ')}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
