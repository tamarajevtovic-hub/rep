import { RESCUE_COST } from '../lib/animals';
import { ANIMAL_LABELS, type Key } from '../lib/i18n';
import { addDays, todayISO } from '../lib/dates';
import { keysAvailable, nextRescueAnimal, rescue } from '../lib/game';
import { useStore, useT } from '../lib/store';
import type { Rescued } from '../lib/types';
import { Sprite } from '../components/ui';

export function Sanctuary({ onToast }: { onToast: (msg: string) => void }) {
  const { data, setData } = useStore();
  const { lang, tr } = useT();
  const A = ANIMAL_LABELS[lang];
  const p = data.profile!;
  const keys = keysAvailable(data);
  const today = todayISO();
  const weekAgo = addDays(today, -6);
  const recent = data.workouts.filter((w) => w.status === 'done' && w.date >= weekAgo && w.date <= today).length;
  const mood = recent >= 3 ? 'cveta' : recent >= 1 ? 'ok' : 'pospano';
  const moodText = tr(`sa.${mood}` as Key);
  const sleepy = mood === 'pospano';
  const next = nextRescueAnimal(data);

  const doRescue = () => {
    const r = rescue(data);
    const got: Rescued | undefined = r.rescued;
    if (!got) return;
    setData(() => r.data);
    onToast(tr('sa.rescued', { animal: A[got.animal], name: got.name }));
  };

  return (
    <div className="scroll stack16 pad-top">
      <header className="stack8">
        <div className="row10">
          <h1 className="pixel h1 acid">{tr('sa.title')}</h1>
          <span className="sticker pink-sticker">NO CAGES</span>
        </div>
        <div className="muted">{tr('sa.stats', { n: data.game.rescued.length, k: keys })}</div>
      </header>

      <section className={`scene ${mood}`} aria-label={tr('sa.title')}>
        <div className="sky" />
        <div className="ground" />
        {mood === 'cveta' && <div className="flowers" aria-hidden="true">✿ ✿ ✿ ✿ ✿</div>}
        <div className="herd">
          <Sprite animal={p.companion} px={4} sleepy={sleepy} />
          {data.game.rescued.slice(-5).map((r, i) => (
            <Sprite key={i} animal={r.animal} px={4} sleepy={sleepy} />
          ))}
        </div>
      </section>
      <div className="muted small">{moodText}</div>

      <section className="card stack10">
        <div className="row-between">
          <div className="pixel small">{tr('sa.next')}</div>
          <div className="pixel small acid">{Math.min(keys, RESCUE_COST)}/{RESCUE_COST}</div>
        </div>
        <div className="muted small">{tr('sa.how', { n: RESCUE_COST })}</div>
        <button type="button" className="btn acid" disabled={keys < RESCUE_COST} onClick={doRescue}>
          {keys >= RESCUE_COST ? tr('sa.rescue', { animal: A[next].toUpperCase() }) : tr('sa.moreKeys', { n: RESCUE_COST - keys })}
        </button>
      </section>

      <section className="grid2">
        <div className="pet-card shadow-cyan">
          <Sprite animal={p.companion} px={4} />
          <div className="pixel tiny">{p.companionName.toUpperCase()}</div>
          <div className="small center">{tr('sa.companion')}</div>
        </div>
        {data.game.rescued.map((r, i) => (
          <div key={i} className={`pet-card ${r.rare ? 'shadow-pink' : 'shadow-acid'}`}>
            <Sprite animal={r.animal} px={4} />
            <div className="pixel tiny">{r.name.toUpperCase()}</div>
            <div className="small center">{r.rare ? `${tr('sa.rare')} · ` : ''}{A[r.animal]}</div>
          </div>
        ))}
        {!data.game.rareMonths.includes(today.slice(0, 7)) && (
          <div className="pet-card locked pink-border">
            <div className="pixel big pink">?</div>
            <div className="pixel tiny pink">{tr('sa.rare')}</div>
            <div className="small center muted">{tr('sa.rareText', { n: p.monthlyTarget })}</div>
          </div>
        )}
      </section>

      <section className="card stack8">
        <div className="pixel small">{tr('sa.crew')}</div>
        <div className="muted small">{tr('sa.crewText')}</div>
        <span className="tag gray-tag self-start">{tr('sa.soon')}</span>
      </section>
    </div>
  );
}
