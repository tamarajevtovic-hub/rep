export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Ponedeljak nedelje u kojoj je dati datum. */
export function startOfWeek(s: string): string {
  const d = parseISO(s);
  const wd = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - wd);
  return toISO(d);
}

export const DAY_NAMES = ['PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB', 'NED'];

export function dayName(s: string): string {
  return DAY_NAMES[(parseISO(s).getDay() + 6) % 7];
}

export function dayNum(s: string): number {
  return parseISO(s).getDate();
}

export function monthKey(s: string): string {
  return s.slice(0, 7);
}

export const MONTHS = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
];

export function monthName(s: string): string {
  return MONTHS[parseISO(s).getMonth()];
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
