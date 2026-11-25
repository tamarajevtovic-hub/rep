import { useState } from 'react';
import { COMPANION_CHOICES, SPRITES } from '../lib/animals';
import { DISCLAIMER } from '../lib/copy';
import {
  EQUIP_LABEL, GOAL_LABEL, HOME_EQUIP, ISSUE_LABEL, PLACE_LABEL,
  type Equip, type Goal, type Issue, type Place, type Profile,
} from '../lib/types';
import { Chips, Sprite } from '../components/ui';

const GOALS: Goal[] = ['snaga', 'mrsavljenje', 'masa', 'kondicija', 'pokretljivost'];
const PLACES: Place[] = ['teretana', 'kuca', 'napolju', 'kombinacija'];
const ISSUES: Issue[] = ['koleno', 'rame', 'ledja', 'kukovi', 'kor', 'drzanje'];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  mode: 'plan',
  goals: [],
  place: 'teretana',
  equip: [],
  issues: [],
  monthlyTarget: 12,
  companion: 'macka',
  companionName: 'Mrvica',
};

export function Onboarding({ initial, onDone, onCancel }: { initial?: Profile; onDone: (p: Profile) => void; onCancel?: () => void }) {
  const [p, setP] = useState<Profile>(initial ?? DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const last = 2;

  return (
    <div className="screen">
      <header className="ob-head">
        <div className="muted small">Korak {step + 1} od {last + 1}</div>
        <h1 className="pixel h-ob">
          {step === 0 && <>EJ TI.<br /><span className="pink">KO SI?</span></>}
          {step === 1 && <>AJDE, PRIČAJ.<br /><span className="pink">ŠTA HOĆEŠ?</span></>}
          {step === 2 && <>JOŠ MALO.<br /><span className="pink">ŠTA TE MUČI?</span></>}
        </h1>
      </header>

      <main className="scroll stack20">
        {step === 0 && (
          <>
            <label className="field">
              <span className="label">KAKO DA TE ZOVEM?</span>
              <input value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ime ili nadimak" />
            </label>
            <section className="stack10">
              <div className="label">KAKO ĆEŠ?</div>
              <div className="chips grid2">
                <button type="button" aria-pressed={p.mode === 'plan'} className={`chip tall ${p.mode === 'plan' ? 'on-acid' : ''}`} onClick={() => set({ mode: 'plan' })}>
                  <b>Napravi mi plan</b><span>REP predlaže treninge</span>
                </button>
                <button type="button" aria-pressed={p.mode === 'svoj'} className={`chip tall ${p.mode === 'svoj' ? 'on-acid' : ''}`} onClick={() => set({ mode: 'svoj' })}>
                  <b>Imam svoj plan</b><span>Trener ili svoj program</span>
                </button>
              </div>
            </section>
            <section className="stack10">
              <div className="label">IZABERI SAPUTNIKA</div>
              <div className="chips grid4">
                {COMPANION_CHOICES.map((a) => (
                  <button key={a} type="button" aria-pressed={p.companion === a} aria-label={SPRITES[a].label} className={`chip pet ${p.companion === a ? 'on' : ''}`} onClick={() => set({ companion: a })}>
                    <Sprite animal={a} px={3} />
                  </button>
                ))}
              </div>
              <label className="field">
                <span className="muted small">Ime saputnika</span>
                <input value={p.companionName} onChange={(e) => set({ companionName: e.target.value })} />
              </label>
            </section>
          </>
        )}

        {step === 1 && (
          <>
            <section className="stack10">
              <div className="label">CILJ (VIŠE IZBORA)</div>
              <Chips options={GOALS} selected={p.goals} labels={GOAL_LABEL} onToggle={(g) => set({ goals: toggle(p.goals, g) })} />
            </section>
            <section className="stack10">
              <div className="label">GDE TRENIRAŠ?</div>
              <Chips variant="single" options={PLACES} selected={[p.place]} labels={PLACE_LABEL} onToggle={(pl) => set({ place: pl })} />
              {p.place === 'teretana' ? (
                <div className="muted small">Teretana znači sva oprema. Ne gnjavimo te listom.</div>
              ) : (
                <div className="stack10">
                  <div className="muted small">Šta imaš od opreme?</div>
                  <Chips<Equip> options={HOME_EQUIP} selected={p.equip} labels={EQUIP_LABEL} onToggle={(e) => set({ equip: toggle(p.equip, e) })} />
                </div>
              )}
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <section className="stack10">
              <div className="label">ŠTA TE MUČI?</div>
              <Chips options={ISSUES} selected={p.issues} labels={ISSUE_LABEL} onToggle={(i) => set({ issues: toggle(p.issues, i) })} />
              <div className="warn">{DISCLAIMER}</div>
            </section>
            <section className="stack10">
              <div className="label">KOLIKO TRENINGA MESEČNO?</div>
              <div className="stepper">
                <button type="button" aria-label="Manje" onClick={() => set({ monthlyTarget: Math.max(1, p.monthlyTarget - 1) })}>−</button>
                <div className="pixel">{p.monthlyTarget}</div>
                <button type="button" aria-label="Više" onClick={() => set({ monthlyTarget: Math.min(31, p.monthlyTarget + 1) })}>+</button>
              </div>
              <div className="muted small">Ispuniš plan, stiže retka životinja. Ne ispuniš, nema kazne. Samo razočarana {p.companionName || 'mačka'}.</div>
            </section>
          </>
        )}
      </main>

      <footer className="foot row10">
        {step > 0 ? (
          <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>Nazad</button>
        ) : (
          onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Otkaži</button>
        )}
        <button
          type="button"
          className="btn acid grow"
          onClick={() => (step < last ? setStep(step + 1) : onDone({ ...p, name: p.name.trim(), companionName: p.companionName.trim() || SPRITES[p.companion].label }))}
        >
          {step < last ? 'DALJE' : 'KRENI'}
        </button>
      </footer>
    </div>
  );
}
