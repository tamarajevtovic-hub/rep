# REP

Mobilna aplikacija (PWA) za planiranje i logovanje treninga, u pixel punk stilu.
Treniraš, skupljaš ključeve i spašavaš životinje u svoje svetilište. Saputnik te drsko zeza kad zabušavaš.

Radni naziv: **REP** (rep životinje + rep u teretani). Nije konačno.

## Šta radi (prva verzija)

- **Onboarding:** ime, saputnik, režim („Napravi mi plan“ ili „Imam svoj plan“), ciljevi, mesto, oprema (teretana = sva oprema), šta te muči, mesečni plan treninga.
- **Plan:** nedelja sa odrađenim, planiranim i propuštenim treninzima; planiranje unapred; brzo logovanje (npr. trening sa trenerom).
- **Logovanje:** snaga (vežbe, serije, ponavljanja, kilaža), trčanje (km, minuti, tempo), brzi log, beleške.
- **Predlozi treninga** po pravilima, bez plaćenog AI: šabloni po cilju, mestu i opremi; zamene vežbi zbog problema (koleno, rame, leđa, kukovi, kor, držanje); postepeno povećanje kilaže; trčanje +~10%.
- **AI most (besplatno):** „Kopiraj za AI“ napravi tekst za Claude ili ChatGPT; odgovor se nalepi nazad i postaje plan u kalendaru, uz pregled pre ubacivanja.
- **Motivacija:** ključ za svaki odrađen dan, 4 ključa = spašena životinja, ispunjen mesečni plan = retka životinja; saputnik sa nivoima; svetilište koje cveta ili drema, bez kazni.
- **Telesne mere** (opciono) i **rezervna kopija** podataka (JSON).
- **Srpski i engleski:** jezik se bira po jeziku telefona, a menja se u onboardingu ili u „Ja“. Prevodi su u `src/lib/i18n.ts`; vežbe se čuvaju pod srpskim nazivom, pa istorija ostaje ista kad se jezik promeni.

Podaci se za sada čuvaju samo na telefonu (localStorage). Prijatelji i zajedničko svetilište dolaze u drugoj verziji (traže server, npr. besplatni Supabase).

> Kod bola ili povrede javi se lekaru ili fizioterapeutu. REP samo prilagođava vežbe i ne zamenjuje stručnjaka.

## Pokretanje

```bash
npm install
npm run dev      # razvoj
npm test         # testovi pravila, AI formata i igre
npm run build    # produkcija u dist/
```

## Objavljivanje

Na svaki push na `main`, GitHub Actions pokrene testove i objavi aplikaciju na GitHub Pages.
Jednom treba uključiti: **Settings → Pages → Source: GitHub Actions**.
Na telefonu otvori link i izaberi „Dodaj na početni ekran“.

## Struktura

- `src/lib/` – logika: tipovi, vežbe, predlozi (`recommend.ts`), AI most (`aiBridge.ts`), igra (`game.ts`), životinje (`animals.ts`), čuvanje (`store.tsx`)
- `src/screens/` – ekrani: Onboarding, Početna, Plan, Trening, Svetilište, Ja
- `src/components/ui.tsx` – piksel sprite, čipovi, ikone
