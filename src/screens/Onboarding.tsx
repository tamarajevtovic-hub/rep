import { useState } from 'react';
import { COMPANION_CHOICES } from '../lib/animals';
import { ANIMAL_LABELS, EQUIP_LABELS, GOAL_LABELS, ISSUE_LABELS, PLACE_LABELS, type Lang } from '../lib/i18n';
import { useStore, useT } from '../lib/store';
import { HOME_EQUIP, type Equip, type Goal, type Issue, type Place, type Profile } from '../lib/types';
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

export function LangSwitch() {
  const { setData } = useStore();
  const { lang } = useT();
  const opts: Lang[] = ['sr', 'en'];
  return (
    <div className="chips grid2" role="group" aria-label="Jezik / Language">
      {opts.map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} className={`chip ${lang === l ? 'on' : ''}`} onClick={() => setData((d) => ({ ...d, lang: l }))}>
          {l === 'sr' ? 'Srpski' : 'English'}
        </button>
      ))}
    </div>
  );
}

export function Onboarding({ initial, onDone, onCancel }: { initial?: Profile; onDone: (p: Profile) => void; onCancel?: () => void }) {
  const { lang, tr } = useT();
  const [p, setP] = useState<Profile>(initial ?? { ...DEFAULT_PROFILE, companionName: lang === 'en' ? 'Crumbs' : 'Mrvica' });
  const [step, setStep] = useState(0);
  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const last = 2;

  return (
    <div className="screen">
      <header className="ob-head">
        <div className="muted small">{tr('step', { n: step + 1, total: last + 1 })}</div>
        <h1 className="pixel h-ob">
          {step === 0 && <>{tr('ob.h0a')}<br /><span className="pink">{tr('ob.h0b')}</span></>}
          {step === 1 && <>{tr('ob.h1a')}<br /><span className="pink">{tr('ob.h1b')}</span></>}
          {step === 2 && <>{tr('ob.h2a')}<br /><span className="pink">{tr('ob.h2b')}</span></>}
        </h1>
      </header>

      <main className="scroll stack20">
        {step === 0 && (
          <>
            <section className="stack10">
              <div className="label">{tr('ob.lang')}</div>
              <LangSwitch />
            </section>
            <label className="field">
              <span className="label">{tr('ob.name')}</span>
              <input value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder={tr('ob.namePh')} />
            </label>
            <section className="stack10">
              <div className="label">{tr('ob.mode')}</div>
              <div className="chips grid2">
                <button type="button" aria-pressed={p.mode === 'plan'} className={`chip tall ${p.mode === 'plan' ? 'on-acid' : ''}`} onClick={() => set({ mode: 'plan' })}>
                  <b>{tr('mode.plan')}</b><span>{tr('mode.planSub')}</span>
                </button>
                <button type="button" aria-pressed={p.mode === 'svoj'} className={`chip tall ${p.mode === 'svoj' ? 'on-acid' : ''}`} onClick={() => set({ mode: 'svoj' })}>
                  <b>{tr('mode.own')}</b><span>{tr('mode.ownSub')}</span>
                </button>
              </div>
            </section>
            <section className="stack10">
              <div className="label">{tr('ob.companion')}</div>
              <div className="chips grid4">
                {COMPANION_CHOICES.map((a) => (
                  <button key={a} type="button" aria-pressed={p.companion === a} aria-label={ANIMAL_LABELS[lang][a]} className={`chip pet ${p.companion === a ? 'on' : ''}`} onClick={() => set({ companion: a })}>
                    <Sprite animal={a} px={3} />
                  </button>
                ))}
              </div>
              <label className="field">
                <span className="muted small">{tr('ob.companionName')}</span>
                <input value={p.companionName} onChange={(e) => set({ companionName: e.target.value })} />
              </label>
            </section>
          </>
        )}

        {step === 1 && (
          <>
            <section className="stack10">
              <div className="label">{tr('ob.goals')}</div>
              <Chips options={GOALS} selected={p.goals} labels={GOAL_LABELS[lang]} onToggle={(g) => set({ goals: toggle(p.goals, g) })} />
            </section>
            <section className="stack10">
              <div className="label">{tr('ob.where')}</div>
              <Chips variant="single" options={PLACES} selected={[p.place]} labels={PLACE_LABELS[lang]} onToggle={(pl) => set({ place: pl })} />
              {p.place === 'teretana' ? (
                <div className="muted small">{tr('ob.gymAll')}</div>
              ) : (
                <div className="stack10">
                  <div className="muted small">{tr('ob.equip')}</div>
                  <Chips<Equip> options={HOME_EQUIP} selected={p.equip} labels={EQUIP_LABELS[lang]} onToggle={(e) => set({ equip: toggle(p.equip, e) })} />
                </div>
              )}
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <section className="stack10">
              <div className="label">{tr('ob.issues')}</div>
              <Chips options={ISSUES} selected={p.issues} labels={ISSUE_LABELS[lang]} onToggle={(i) => set({ issues: toggle(p.issues, i) })} />
              <div className="warn">{tr('disclaimer')}</div>
            </section>
            <section className="stack10">
              <div className="label">{tr('ob.monthly')}</div>
              <div className="stepper">
                <button type="button" aria-label={tr('less')} onClick={() => set({ monthlyTarget: Math.max(1, p.monthlyTarget - 1) })}>−</button>
                <div className="pixel">{p.monthlyTarget}</div>
                <button type="button" aria-label={tr('more')} onClick={() => set({ monthlyTarget: Math.min(31, p.monthlyTarget + 1) })}>+</button>
              </div>
              <div className="muted small">{tr('ob.monthlyNote')}</div>
            </section>
          </>
        )}
      </main>

      <footer className="foot row10">
        {step > 0 ? (
          <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>{tr('back')}</button>
        ) : (
          onCancel && <button type="button" className="btn ghost" onClick={onCancel}>{tr('cancel')}</button>
        )}
        <button
          type="button"
          className="btn acid grow"
          onClick={() => (step < last ? setStep(step + 1) : onDone({ ...p, name: p.name.trim(), companionName: p.companionName.trim() || ANIMAL_LABELS[lang][p.companion] }))}
        >
          {step < last ? tr('next') : tr('go')}
        </button>
      </footer>
    </div>
  );
}
