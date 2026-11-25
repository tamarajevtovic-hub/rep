import { RESCUE_COST, SPRITES } from '../lib/animals';
import { addDays, todayISO } from '../lib/dates';
import { keysAvailable, nextRescueAnimal, rescue } from '../lib/game';
import { useStore } from '../lib/store';
import type { Rescued } from '../lib/types';
import { Sprite } from '../components/ui';

export function Sanctuary({ onToast }: { onToast: (msg: string) => void }) {
  const { data, setData } = useStore();
  const p = data.profile!;
  const keys = keysAvailable(data);
  const today = todayISO();
  const weekAgo = addDays(today, -6);
  const recent = data.workouts.filter((w) => w.status === 'done' && w.date >= weekAgo && w.date <= today).length;
  const mood = recent >= 3 ? 'cveta' : recent >= 1 ? 'ok' : 'pospano';
  const moodText = {
    cveta: 'Svetilište cveta. Svi skaču. Koka je pustila irokez.',
    ok: 'Mirno je. Životinje su zadovoljne, ali bi mogle još malo.',
    pospano: 'Svi dremaju. Niko ne kaže ništa, ali svi gledaju u tebe.',
  }[mood];
  const sleepy = mood === 'pospano';
  const next = nextRescueAnimal(data);

  const doRescue = () => {
    const r = rescue(data);
    const got: Rescued | undefined = r.rescued;
    if (!got) return;
    setData(() => r.data);
    onToast(`${SPRITES[got.animal].label} ${got.name} izlazi iz kaveza i stiže u svetilište!`);
  };

  return (
    <div className="scroll stack16 pad-top">
      <header className="stack8">
        <div className="row10">
          <h1 className="pixel h1 acid">SVETILIŠTE</h1>
          <span className="sticker pink-sticker">NO CAGES</span>
        </div>
        <div className="muted">Spaseno: <b className="text">{data.game.rescued.length}</b> · Ključevi: <b className="text">{keys}</b></div>
      </header>

      <section className={`scene ${mood}`} aria-label="Svetilište">
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
          <div className="pixel small">SLEDEĆE SPAŠAVANJE</div>
          <div className="pixel small acid">{Math.min(keys, RESCUE_COST)}/{RESCUE_COST}</div>
        </div>
        <div className="muted small">Za {RESCUE_COST} ključa neko izlazi iz kaveza. Ključ dobijaš za svaki odrađen dan.</div>
        <button type="button" className="btn acid" disabled={keys < RESCUE_COST} onClick={doRescue}>
          {keys >= RESCUE_COST ? `SPASI: ${SPRITES[next].label.toUpperCase()}` : `JOŠ ${RESCUE_COST - keys} ${RESCUE_COST - keys === 1 ? 'KLJUČ' : 'KLJUČA'}`}
        </button>
      </section>

      <section className="grid2">
        <div className="pet-card shadow-cyan">
          <Sprite animal={p.companion} px={4} />
          <div className="pixel tiny">{p.companionName.toUpperCase()}</div>
          <div className="small center">Tvoj saputnik</div>
        </div>
        {data.game.rescued.map((r, i) => (
          <div key={i} className={`pet-card ${r.rare ? 'shadow-pink' : 'shadow-acid'}`}>
            <Sprite animal={r.animal} px={4} />
            <div className="pixel tiny">{r.name.toUpperCase()}</div>
            <div className="small center">{r.rare ? 'RETKA · ' : ''}{SPRITES[r.animal].label}</div>
          </div>
        ))}
        {!data.game.rareMonths.includes(today.slice(0, 7)) && (
          <div className="pet-card locked pink-border">
            <div className="pixel big pink">?</div>
            <div className="pixel tiny pink">RETKA</div>
            <div className="small center muted">Ispuni mesečni plan ({p.monthlyTarget}) i neko poseban stiže.</div>
          </div>
        )}
      </section>

      <section className="card stack8">
        <div className="pixel small">EKIPA</div>
        <div className="muted small">
          Za sada ste ti i tvoje životinje. Kad prijatelji stignu u REP, sve životinje žive zajedno u jednom svetilištu i svi brinete da bude dobro. Bez prijatelja svetilište radi isto, samo je tvoje.
        </div>
        <span className="tag gray-tag self-start">USKORO</span>
      </section>
    </div>
  );
}
