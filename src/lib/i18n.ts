import type { AnimalId, Equip, Goal, Issue, Place } from './types';

export type Lang = 'sr' | 'en';

export function detectLang(): Lang {
  try {
    const l = (navigator.language || 'en').toLowerCase();
    return /^(sr|hr|bs|me|sh)/.test(l) ? 'sr' : 'en';
  } catch {
    return 'en';
  }
}

const sr = {
  // nav
  'nav.home': 'POČETNA', 'nav.plan': 'PLAN', 'nav.sanctuary': 'SVETILIŠTE', 'nav.me': 'JA',
  // opšte
  back: 'Nazad', cancel: 'Otkaži', next: 'DALJE', go: 'KRENI', save: 'Sačuvaj',
  'step': 'Korak {n} od {total}',
  // onboarding
  'ob.h0a': 'EJ TI.', 'ob.h0b': 'KO SI?',
  'ob.h1a': 'AJDE, PRIČAJ.', 'ob.h1b': 'ŠTA HOĆEŠ?',
  'ob.h2a': 'JOŠ MALO.', 'ob.h2b': 'ŠTA TE MUČI?',
  'ob.lang': 'JEZIK',
  'ob.name': 'KAKO DA TE ZOVEM?', 'ob.namePh': 'Ime ili nadimak',
  'ob.mode': 'KAKO ĆEŠ?',
  'mode.plan': 'Napravi mi plan', 'mode.planSub': 'REP predlaže treninge',
  'mode.own': 'Imam svoj plan', 'mode.ownSub': 'Trener ili svoj program',
  'ob.companion': 'IZABERI SAPUTNIKA', 'ob.companionName': 'Ime saputnika',
  'ob.goals': 'CILJ (VIŠE IZBORA)', 'ob.where': 'GDE TRENIRAŠ?',
  'ob.gymAll': 'Teretana znači sva oprema. Ne gnjavimo te listom.',
  'ob.equip': 'Šta imaš od opreme?',
  'ob.issues': 'ŠTA TE MUČI?',
  'ob.monthly': 'KOLIKO TRENINGA MESEČNO?',
  'ob.monthlyNote': 'Ispuniš plan, stiže retka životinja. Ne ispuniš, nema kazne. Samo razočaran saputnik.',
  less: 'Manje', more: 'Više',
  disclaimer: 'Imaš bol ili povredu? Pre treninga se javi lekaru ili fizioterapeutu. REP samo prilagođava vežbe i ne zamenjuje stručnjaka.',
  // home
  'home.keys': 'KLJUČEVI: {n}',
  'home.listen': '{name}, SLUŠAJ:', 'home.says': 'SAPUTNIK KAŽE:',
  'home.monthPlan': '{month} · PLAN',
  'home.toGo': 'Još {n} do retke životinje. Neko poseban čeka.',
  'home.planDone': 'Plan ispunjen. Retka životinja je stigla u svetilište.',
  'home.today': 'DANAS', 'home.fromAi': 'iz AI plana', 'home.planned': 'planirano',
  'home.log': 'LOGUJ TRENING',
  'home.doneTag': 'ODRAĐENO', 'home.doneText': 'Posao za danas je gotov. Odmori. Ili nemoj, nisam ti mama.',
  'home.viewPlan': 'Pogledaj plan',
  'home.suggest': 'PREDLOG', 'home.forToday': 'za danas',
  'home.which': 'Trening ili trčanje?',
  'home.suggestText': 'Pravim predlog po tvojim ciljevima, opremi i onome što te muči.',
  'home.strength': 'TRENING', 'home.run': 'Trčanje',
  'home.nothing': 'Ništa planirano', 'home.nothingText': 'Trening sa trenerom? Upiši ga brzo u planu.',
  'home.openPlan': 'OTVORI PLAN',
  'home.week': 'Ove nedelje', 'home.running': 'Trčanje', 'home.lifted': 'Podignuto',
  // plan
  'plan.title': 'PLAN', 'plan.prev': 'Prethodna nedelja', 'plan.next': 'Sledeća nedelja',
  'st.done': 'ODRAĐEN', 'st.planned': 'PLANIRAN', 'st.missed': 'PROPUŠTEN',
  'lg.done': 'Odrađen', 'lg.planned': 'Planiran', 'lg.missed': 'Propušten',
  'sec.past': 'PROŠLO', 'sec.today': 'DANAS', 'sec.next': 'SLEDI',
  'plan.empty': 'Prazna nedelja. Kauč se raduje. Ajde da ga razočaramo.',
  'plan.quick': 'Brzo loguj', 'plan.add': '+ ISPLANIRAJ',
  'add.title': 'ISPLANIRAJ', 'add.day': 'Dan',
  'add.sugStrength': 'PREDLOG: SNAGA', 'add.sugRun': 'PREDLOG: TRČANJE',
  'add.strength': 'Snaga', 'add.run': 'Trčanje', 'add.quick': 'Brzi',
  'blank.run': 'Trčanje', 'blank.quick': 'Trening sa trenerom', 'blank.strength': 'Trening',
  // sažetak
  'sum.run': 'Trčanje · {km} km', 'sum.quick': 'Brzi log',
  'sum.ex1': 'vežba', 'sum.ex2': 'vežbe', 'sum.ex5': 'vežbi',
  // editor
  'ed.kindStrength': 'Snaga', 'ed.kindRun': 'Trčanje', 'ed.kindQuick': 'Brzi log',
  'ed.name': 'Naziv treninga', 'ed.date': 'Datum', 'ed.delete': 'Obriši trening', 'ed.confirmDelete': 'Obrisati ovaj trening?',
  'ed.suggestNote': 'Predlog po tvom profilu. Kilaže su predlog: menjaj slobodno. Boli? Stani.',
  'ed.empty': 'Nema vežbi. Dodaj prvu, nećeš se pokajati. Možda.',
  'ed.remove': 'Ukloni {name}',
  'ed.set': 'SER', 'ed.kg': 'KG', 'ed.reps': 'PON', 'ed.sec': 'SEK',
  'ed.kgAria': 'Kilaža, serija {n}', 'ed.repsAria': 'Ponavljanja, serija {n}', 'ed.doneAria': 'Serija {n} gotova',
  'ed.addSet': '+ serija', 'ed.removeSet': '− serija', 'ed.addEx': '+ Dodaj vežbu',
  'ed.km': 'KM', 'ed.min': 'MINUTA', 'ed.pace': 'Tempo', 'ed.duration': 'TRAJANJE (MIN)',
  'ed.note': 'BELEŠKA', 'ed.notePh': 'Kako je bilo? Šta je bolelo? Ko je kriv?',
  'ed.savePlan': 'Sačuvaj plan', 'ed.backToPlan': 'Vrati u plan',
  'ed.future': 'U BUDUĆNOSTI', 'ed.futureTitle': 'Ne možeš da završiš trening iz budućnosti',
  'ed.finish': 'ZAVRŠI · +1 KLJUČ',
  'pick.ph': 'Traži ili upiši svoju vežbu', 'pick.add': '+ Dodaj „{q}“', 'pick.title': 'Dodaj vežbu',
  // sanctuary
  'sa.title': 'SVETILIŠTE', 'sa.stats': 'Spaseno: {n} · Ključevi: {k}',
  'sa.cveta': 'Svetilište cveta. Svi skaču. Koka je pustila irokez.',
  'sa.ok': 'Mirno je. Životinje su zadovoljne, ali bi mogle još malo.',
  'sa.pospano': 'Svi dremaju. Niko ne kaže ništa, ali svi gledaju u tebe.',
  'sa.next': 'SLEDEĆE SPAŠAVANJE',
  'sa.how': 'Za {n} ključa neko izlazi iz kaveza. Ključ dobijaš za svaki odrađen dan.',
  'sa.rescue': 'SPASI: {animal}', 'sa.moreKeys': 'JOŠ {n} KLJ.',
  'sa.rescued': '{animal} {name} izlazi iz kaveza i stiže u svetilište!',
  'sa.companion': 'Tvoj saputnik', 'sa.rare': 'RETKA',
  'sa.rareText': 'Ispuni mesečni plan ({n}) i neko poseban stiže.',
  'sa.crew': 'EKIPA',
  'sa.crewText': 'Za sada ste ti i tvoje životinje. Kad prijatelji stignu u REP, sve životinje žive zajedno u jednom svetilištu i svi brinete da bude dobro. Bez prijatelja svetilište radi isto, samo je tvoje.',
  'sa.soon': 'USKORO',
  // me
  'me.edit': 'Izmeni profil', 'me.mode': 'Režim', 'me.goals': 'Ciljevi', 'me.place': 'Mesto',
  'me.issues': 'Muči te', 'me.monthly': 'Mesečni plan', 'me.trainings': '{n} treninga', 'me.nothing': 'ništa',
  'me.lang': 'JEZIK',
  'ai.title': 'PLAN IZ ČETA',
  'ai.s1': 'Kopiraj svoj profil i treninge.', 'ai.s2': 'Nalepi u besplatan AI čet (Claude, ChatGPT).', 'ai.s3': 'Odgovor nalepi ovde i ubaci u plan.',
  'ai.copy': '1 · KOPIRAJ ZA AI', 'ai.paste': '3 · Nalepi odgovor', 'ai.read': 'Pročitaj plan',
  'ai.copied': 'Kopirano. Nalepi u Claude ili ChatGPT.',
  'ai.copyFail': 'Kopiranje nije uspelo: tekst je u polju ispod, kopiraj ručno.',
  'ai.none': 'Nisam našla nijedan trening. Proveri da li je AI odgovorio u zadatom formatu (redovi koji počinju sa ###).',
  'ai.preview': 'PREGLED · {n} TRENINGA', 'ai.skipped': 'Preskočeni redovi koje nisam razumela:',
  'ai.insert': 'UBACI U PLAN', 'ai.inserted': 'Ubačeno {n} treninga u plan.',
  'ms.title': 'TELESNE MERE', 'ms.note': 'Opciono. Upiši šta želiš, ostalo preskoči.', 'ms.save': 'Sačuvaj mere',
  'ms.weight': 'Težina (kg)', 'ms.waist': 'Struk (cm)', 'ms.hips': 'Kukovi (cm)', 'ms.chest': 'Grudi (cm)', 'ms.arm': 'Nadlaktica (cm)',
  'bk.title': 'REZERVNA KOPIJA', 'bk.note': 'Podaci za sada žive samo na ovom telefonu. Povremeno sačuvaj kopiju, da se ništa ne izgubi.',
  'bk.save': 'Sačuvaj kopiju', 'bk.load': 'Učitaj kopiju', 'bk.confirm': 'Ovo zamenjuje sve trenutne podatke. Nastaviti?',
  'bk.loaded': 'Kopija učitana.', 'bk.bad': 'Ovo nije REP kopija.',
  'bk.wipe': 'Obriši sve podatke', 'bk.wipeConfirm': 'Obrisati SVE podatke? Ovo ne može da se vrati.',
  // toast
  'done.noKey': 'Odrađeno! (Ključ za danas je već uzet.)',
  'done.rare': 'PLAN ISPUNJEN! Retka životinja: {animal} {name}!',
  // šabloni
  'tpl.a': 'Noge + gornji deo', 'tpl.b': 'Zadnjica + leđa', 'tpl.cardio': 'Kondicija', 'tpl.full': 'Celo telo',
  'run.title': 'Trčanje {km} km', 'run.first': 'Trčanje 3 km lagano',
};

export type Key = keyof typeof sr;

const en: Record<Key, string> = {
  'nav.home': 'HOME', 'nav.plan': 'PLAN', 'nav.sanctuary': 'SANCTUARY', 'nav.me': 'ME',
  back: 'Back', cancel: 'Cancel', next: 'NEXT', go: "LET'S GO", save: 'Save',
  'step': 'Step {n} of {total}',
  'ob.h0a': 'HEY YOU.', 'ob.h0b': 'WHO ARE YOU?',
  'ob.h1a': 'COME ON, SPILL.', 'ob.h1b': 'WHAT DO YOU WANT?',
  'ob.h2a': 'ALMOST THERE.', 'ob.h2b': "WHAT'S BUGGING YOU?",
  'ob.lang': 'LANGUAGE',
  'ob.name': 'WHAT SHOULD I CALL YOU?', 'ob.namePh': 'Name or nickname',
  'ob.mode': 'HOW DO YOU ROLL?',
  'mode.plan': 'Make me a plan', 'mode.planSub': 'REP suggests workouts',
  'mode.own': 'I have my own plan', 'mode.ownSub': 'A coach or my own program',
  'ob.companion': 'PICK A SIDEKICK', 'ob.companionName': "Sidekick's name",
  'ob.goals': 'GOALS (PICK ANY)', 'ob.where': 'WHERE DO YOU TRAIN?',
  'ob.gymAll': "Gym means all the gear. We won't bother you with a list.",
  'ob.equip': 'What gear do you have?',
  'ob.issues': "WHAT'S BUGGING YOU?",
  'ob.monthly': 'WORKOUTS PER MONTH?',
  'ob.monthlyNote': 'Hit the plan, a rare animal shows up. Miss it, no punishment. Just a disappointed sidekick.',
  less: 'Less', more: 'More',
  disclaimer: 'Pain or an injury? See a doctor or physiotherapist before training. REP only adapts exercises and does not replace a professional.',
  'home.keys': 'KEYS: {n}',
  'home.listen': '{name}, LISTEN:', 'home.says': 'SIDEKICK SAYS:',
  'home.monthPlan': '{month} · PLAN',
  'home.toGo': '{n} more to a rare animal. Someone special is waiting.',
  'home.planDone': 'Plan complete. A rare animal has arrived at the sanctuary.',
  'home.today': 'TODAY', 'home.fromAi': 'from AI plan', 'home.planned': 'planned',
  'home.log': 'LOG WORKOUT',
  'home.doneTag': 'DONE', 'home.doneText': "Today's work is done. Rest. Or don't, I'm not your mom.",
  'home.viewPlan': 'See plan',
  'home.suggest': 'SUGGESTION', 'home.forToday': 'for today',
  'home.which': 'Workout or run?',
  'home.suggestText': "I'll build one from your goals, gear and whatever's bugging you.",
  'home.strength': 'WORKOUT', 'home.run': 'Run',
  'home.nothing': 'Nothing planned', 'home.nothingText': 'Trained with a coach? Log it quickly in the plan.',
  'home.openPlan': 'OPEN PLAN',
  'home.week': 'This week', 'home.running': 'Running', 'home.lifted': 'Lifted',
  'plan.title': 'PLAN', 'plan.prev': 'Previous week', 'plan.next': 'Next week',
  'st.done': 'DONE', 'st.planned': 'PLANNED', 'st.missed': 'MISSED',
  'lg.done': 'Done', 'lg.planned': 'Planned', 'lg.missed': 'Missed',
  'sec.past': 'PAST', 'sec.today': 'TODAY', 'sec.next': 'COMING UP',
  'plan.empty': "Empty week. The couch is thrilled. Let's disappoint it.",
  'plan.quick': 'Quick log', 'plan.add': '+ PLAN IT',
  'add.title': 'PLAN IT', 'add.day': 'Day',
  'add.sugStrength': 'SUGGEST: STRENGTH', 'add.sugRun': 'SUGGEST: RUN',
  'add.strength': 'Strength', 'add.run': 'Run', 'add.quick': 'Quick',
  'blank.run': 'Run', 'blank.quick': 'Session with coach', 'blank.strength': 'Workout',
  'sum.run': 'Run · {km} km', 'sum.quick': 'Quick log',
  'sum.ex1': 'exercise', 'sum.ex2': 'exercises', 'sum.ex5': 'exercises',
  'ed.kindStrength': 'Strength', 'ed.kindRun': 'Run', 'ed.kindQuick': 'Quick log',
  'ed.name': 'Workout name', 'ed.date': 'Date', 'ed.delete': 'Delete workout', 'ed.confirmDelete': 'Delete this workout?',
  'ed.suggestNote': 'Suggested from your profile. Weights are a suggestion: change them freely. Hurts? Stop.',
  'ed.empty': "No exercises. Add the first one, you won't regret it. Probably.",
  'ed.remove': 'Remove {name}',
  'ed.set': 'SET', 'ed.kg': 'KG', 'ed.reps': 'REPS', 'ed.sec': 'SEC',
  'ed.kgAria': 'Weight, set {n}', 'ed.repsAria': 'Reps, set {n}', 'ed.doneAria': 'Set {n} done',
  'ed.addSet': '+ set', 'ed.removeSet': '− set', 'ed.addEx': '+ Add exercise',
  'ed.km': 'KM', 'ed.min': 'MINUTES', 'ed.pace': 'Pace', 'ed.duration': 'DURATION (MIN)',
  'ed.note': 'NOTE', 'ed.notePh': 'How was it? What hurt? Who is to blame?',
  'ed.savePlan': 'Save plan', 'ed.backToPlan': 'Back to plan',
  'ed.future': 'IN THE FUTURE', 'ed.futureTitle': "You can't finish a workout from the future",
  'ed.finish': 'FINISH · +1 KEY',
  'pick.ph': 'Search or type your own exercise', 'pick.add': '+ Add “{q}”', 'pick.title': 'Add exercise',
  'sa.title': 'SANCTUARY', 'sa.stats': 'Rescued: {n} · Keys: {k}',
  'sa.cveta': 'The sanctuary is thriving. Everyone is bouncing. The hen grew a mohawk.',
  'sa.ok': "It's calm. The animals are content, but they could use a bit more.",
  'sa.pospano': "Everyone's napping. Nobody says anything, but they're all looking at you.",
  'sa.next': 'NEXT RESCUE',
  'sa.how': '{n} keys and someone walks out of a cage. You get a key for every day you train.',
  'sa.rescue': 'RESCUE: {animal}', 'sa.moreKeys': '{n} MORE KEYS',
  'sa.rescued': '{animal} {name} walks out of the cage and into the sanctuary!',
  'sa.companion': 'Your sidekick', 'sa.rare': 'RARE',
  'sa.rareText': 'Complete your monthly plan ({n}) and someone special arrives.',
  'sa.crew': 'CREW',
  'sa.crewText': "For now it's you and your animals. When friends join REP, all the animals live together in one sanctuary and you all keep it happy. Without friends it works the same, it's just yours.",
  'sa.soon': 'SOON',
  'me.edit': 'Edit profile', 'me.mode': 'Mode', 'me.goals': 'Goals', 'me.place': 'Place',
  'me.issues': 'Bugging you', 'me.monthly': 'Monthly plan', 'me.trainings': '{n} workouts', 'me.nothing': 'nothing',
  'me.lang': 'LANGUAGE',
  'ai.title': 'PLAN FROM A CHAT',
  'ai.s1': 'Copy your profile and workouts.', 'ai.s2': 'Paste into a free AI chat (Claude, ChatGPT).', 'ai.s3': 'Paste the answer here and add it to your plan.',
  'ai.copy': '1 · COPY FOR AI', 'ai.paste': '3 · Paste the answer', 'ai.read': 'Read plan',
  'ai.copied': 'Copied. Paste it into Claude or ChatGPT.',
  'ai.copyFail': "Couldn't copy: the text is in the box below, copy it by hand.",
  'ai.none': "I didn't find any workouts. Check that the AI answered in the given format (lines starting with ###).",
  'ai.preview': 'PREVIEW · {n} WORKOUTS', 'ai.skipped': "Skipped lines I didn't understand:",
  'ai.insert': 'ADD TO PLAN', 'ai.inserted': 'Added {n} workouts to your plan.',
  'ms.title': 'BODY MEASUREMENTS', 'ms.note': 'Optional. Fill in what you want, skip the rest.', 'ms.save': 'Save measurements',
  'ms.weight': 'Weight (kg)', 'ms.waist': 'Waist (cm)', 'ms.hips': 'Hips (cm)', 'ms.chest': 'Chest (cm)', 'ms.arm': 'Upper arm (cm)',
  'bk.title': 'BACKUP', 'bk.note': 'For now your data lives only on this phone. Save a backup now and then so nothing gets lost.',
  'bk.save': 'Save backup', 'bk.load': 'Load backup', 'bk.confirm': 'This replaces all current data. Continue?',
  'bk.loaded': 'Backup loaded.', 'bk.bad': 'This is not a REP backup.',
  'bk.wipe': 'Delete all data', 'bk.wipeConfirm': 'Delete ALL data? This cannot be undone.',
  'done.noKey': "Done! (Today's key is already taken.)",
  'done.rare': 'PLAN COMPLETE! Rare animal: {animal} {name}!',
  'tpl.a': 'Legs + upper body', 'tpl.b': 'Glutes + back', 'tpl.cardio': 'Conditioning', 'tpl.full': 'Full body',
  'run.title': 'Run {km} km', 'run.first': 'Easy 3 km run',
};

const DICT: Record<Lang, Record<Key, string>> = { sr, en };

export function t(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = DICT[lang][key] ?? sr[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export const DAY_NAMES: Record<Lang, string[]> = {
  sr: ['PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB', 'NED'],
  en: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
};

export const MONTHS: Record<Lang, string[]> = {
  sr: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export const GOAL_LABELS: Record<Lang, Record<Goal, string>> = {
  sr: { snaga: 'Snaga', mrsavljenje: 'Mršavljenje', masa: 'Mišićna masa', kondicija: 'Kondicija', pokretljivost: 'Pokretljivost' },
  en: { snaga: 'Strength', mrsavljenje: 'Weight loss', masa: 'Muscle', kondicija: 'Conditioning', pokretljivost: 'Mobility' },
};

export const PLACE_LABELS: Record<Lang, Record<Place, string>> = {
  sr: { teretana: 'Teretana', kuca: 'Kod kuće', napolju: 'Napolju', kombinacija: 'Kombinacija' },
  en: { teretana: 'Gym', kuca: 'At home', napolju: 'Outdoors', kombinacija: 'Mix' },
};

export const EQUIP_LABELS: Record<Lang, Record<Equip, string>> = {
  sr: { bucice: 'Bučice', sipka: 'Šipka + tegovi', gume: 'Gume', zgibovi: 'Šipka za zgibove', kettlebell: 'Kettlebell', prostirka: 'Prostirka', klupa: 'Klupa', masine: 'Mašine' },
  en: { bucice: 'Dumbbells', sipka: 'Barbell + plates', gume: 'Bands', zgibovi: 'Pull-up bar', kettlebell: 'Kettlebell', prostirka: 'Mat', klupa: 'Bench', masine: 'Machines' },
};

export const ISSUE_LABELS: Record<Lang, Record<Issue, string>> = {
  sr: { koleno: 'Koleno', rame: 'Rame', ledja: 'Donja leđa', kukovi: 'Kukovi (pokretljivost)', kor: 'Slab kor', drzanje: 'Držanje' },
  en: { koleno: 'Knee', rame: 'Shoulder', ledja: 'Lower back', kukovi: 'Hips (mobility)', kor: 'Weak core', drzanje: 'Posture' },
};

export const ANIMAL_LABELS: Record<Lang, Record<AnimalId, string>> = {
  sr: { macka: 'Mačka', pas: 'Pas', koka: 'Koka', majmun: 'Majmun', lisica: 'Lisica', sova: 'Sova', svinja: 'Svinja' },
  en: { macka: 'Cat', pas: 'Dog', koka: 'Hen', majmun: 'Monkey', lisica: 'Fox', sova: 'Owl', svinja: 'Pig' },
};

// Drski tekstovi saputnika. {ime} = ime saputnika.
export const LINES: Record<Lang, Record<'never' | 'today' | 'short' | 'mid' | 'long' | 'done', string[]>> = {
  sr: {
    never: ['Još nijedan trening. Bez pritiska. Ok, malo pritiska.', 'Ja sam spremna. Patike su spremne. Čekamo samo tebe.'],
    today: ['Danas odrađeno. Ponosna sam, ali neću to reći dvaput.', 'Eto ga. Znala sam da imaš to u sebi. Negde duboko.', 'Odrađeno. Sad možeš da se hvališ. Umereno.'],
    short: ['Jedan dan pauze je ok. Dva je već sumnjivo.', 'Odmor je deo treninga. Ali nemoj da se zanosiš.'],
    mid: ['Tri dana na kauču. Ja sam {ime} i odradila sam više čučnjeva od tebe.', 'Kauč je javio da ste se zbližili. Meni se to ne sviđa.', 'Pauza je postala hobi. Ajde da je prekinemo.'],
    long: ['Toliko dugo te nema da sam počela da treniram sama. Dižem se, diži se i ti.', 'Svetilište pita gde si. Ja sam rekla da si na misiji. Nemoj da me razočaraš.'],
    done: ['Odrađeno! Ključ ti je u džepu.', 'To! Još jedan za svetilište.', 'Mašina. Bukvalno.'],
  },
  en: {
    never: ['Zero workouts so far. No pressure. Okay, a little pressure.', "I'm ready. The sneakers are ready. We're just waiting on you."],
    today: ["Done for today. I'm proud, but I won't say it twice.", 'There it is. I knew you had it in you. Somewhere deep.', 'Done. You may brag now. Moderately.'],
    short: ['One rest day is fine. Two is suspicious.', "Rest is part of training. Don't get carried away."],
    mid: ["Three days on the couch. I'm {ime} and I did more squats than you.", "The couch says you two got close. I don't like it.", "Taking a break became a hobby. Let's end it."],
    long: ["You've been gone so long I started training alone. I'm up, now you get up.", "The sanctuary asks where you are. I said you're on a mission. Don't let me down."],
    done: ['Done! Key in your pocket.', 'Yes! One more for the sanctuary.', 'Machine. Literally.'],
  },
};
