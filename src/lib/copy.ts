// Drski tekstovi saputnika. {ime} = ime saputnika.

const NEVER = [
  'Još nijedan trening. Bez pritiska. Ok, malo pritiska.',
  'Ja sam spremna. Patike su spremne. Čekamo samo tebe.',
];
const TODAY = [
  'Danas odrađeno. Ponosna sam, ali neću to reći dvaput.',
  'Eto ga. Znala sam da imaš to u sebi. Negde duboko.',
  'Odrađeno. Sad možeš da se hvališ. Umereno.',
];
const SHORT = [
  'Jedan dan pauze je ok. Dva je već sumnjivo.',
  'Odmor je deo treninga. Ali nemoj da se zanosiš.',
];
const MID = [
  'Tri dana na kauču. Ja sam {ime} i odradila sam više čučnjeva od tebe.',
  'Kauč je javio da ste se zbližili. Meni se to ne sviđa.',
  'Pauza je postala hobi. Ajde da je prekinemo.',
];
const LONG = [
  'Toliko dugo te nema da sam počela da treniram sama. Dižem se, diži se i ti.',
  'Svetilište pita gde si. Ja sam rekla da si na misiji. Nemoj da me razočaraš.',
];

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

export function companionLine(daysSince: number | null, name: string, seed: number): string {
  let list = NEVER;
  if (daysSince === 0) list = TODAY;
  else if (daysSince !== null && daysSince <= 2) list = SHORT;
  else if (daysSince !== null && daysSince <= 5) list = MID;
  else if (daysSince !== null) list = LONG;
  return pick(list, seed).replace('{ime}', name);
}

export const DONE_LINES = [
  'Odrađeno! Ključ ti je u džepu.',
  'To! Još jedan za svetilište.',
  'Mašina. Bukvalno.',
];

export const DISCLAIMER =
  'Imaš bol ili povredu? Pre treninga se javi lekaru ili fizioterapeutu. REP samo prilagođava vežbe i ne zamenjuje stručnjaka.';
