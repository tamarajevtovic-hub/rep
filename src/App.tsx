import { useEffect, useState } from 'react';
import { ANIMAL_LABELS, LINES, type Key } from './lib/i18n';
import { completeWorkout } from './lib/game';
import { useStore, useT } from './lib/store';
import type { Workout } from './lib/types';
import { Icon } from './components/ui';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Plan } from './screens/Plan';
import { Sanctuary } from './screens/Sanctuary';
import { Me } from './screens/Me';
import { WorkoutEditor } from './screens/WorkoutEditor';

type Tab = 'home' | 'plan' | 'sanctuary' | 'me';

const TABS: { id: Tab; label: Key; icon: 'home' | 'plan' | 'sanctuary' | 'me' }[] = [
  { id: 'home', label: 'nav.home', icon: 'home' },
  { id: 'plan', label: 'nav.plan', icon: 'plan' },
  { id: 'sanctuary', label: 'nav.sanctuary', icon: 'sanctuary' },
  { id: 'me', label: 'nav.me', icon: 'me' },
];

export function App() {
  const { data, setData } = useStore();
  const { lang, tr } = useT();
  const [tab, setTab] = useState<Tab>('home');
  const [editing, setEditing] = useState<Workout | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!data.profile || editProfile) {
    return (
      <div className="app">
        <Onboarding
          initial={data.profile ?? undefined}
          onCancel={data.profile ? () => setEditProfile(false) : undefined}
          onDone={(p) => { setData((d) => ({ ...d, profile: p })); setEditProfile(false); }}
        />
      </div>
    );
  }

  const isNew = editing ? !data.workouts.some((w) => w.id === editing.id) : false;

  const save = (w: Workout) => {
    setData((d) => ({
      ...d,
      workouts: d.workouts.some((x) => x.id === w.id) ? d.workouts.map((x) => (x.id === w.id ? w : x)) : [...d.workouts, w],
    }));
    setEditing(null);
  };

  const complete = (w: Workout) => {
    const r = completeWorkout(data, w);
    setData(() => r.data);
    setEditing(null);
    if (r.rare) setToast(tr('done.rare', { animal: ANIMAL_LABELS[lang][r.rare.animal], name: r.rare.name }));
    else if (r.gotKey) setToast(LINES[lang].done[data.workouts.length % LINES[lang].done.length]);
    else setToast(tr('done.noKey'));
  };

  return (
    <div className="app">
      {editing ? (
        <WorkoutEditor
          key={editing.id}
          initial={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={save}
          onComplete={complete}
          onDelete={(id) => { setData((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) })); setEditing(null); }}
        />
      ) : (
        <>
          <div className="content">
            {tab === 'home' && <Home onOpen={setEditing} onGo={setTab} />}
            {tab === 'plan' && <Plan onOpen={setEditing} />}
            {tab === 'sanctuary' && <Sanctuary onToast={setToast} />}
            {tab === 'me' && <Me onEditProfile={() => setEditProfile(true)} onToast={setToast} />}
          </div>
          <nav className="nav">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
                <Icon name={t.icon} />
                {tr(t.label)}
              </button>
            ))}
          </nav>
        </>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
