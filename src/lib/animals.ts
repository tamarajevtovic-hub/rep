import type { AnimalId } from './types';

export interface SpriteDef {
  label: string;
  rows: string[];
  pal: Record<string, string>;
}

const K = '#1A1420';

export const SPRITES: Record<AnimalId, SpriteDef> = {
  macka: {
    label: 'Mačka',
    rows: [
      '......PP......',
      '.....PPPP.....',
      '.K...PPPP...K.',
      '.KK..PPPP..KK.',
      '.KOK.KKKK.KOK.',
      '.KOOKOOOOKOOK.',
      '.KOOOOOOOOOOK.',
      '.KOGGOOOOGGOK.',
      '.KOGKOOOOGKOK.',
      '.KOOOONNOOOOK.',
      '.KWOOOKKOOOWK.',
      '..KWWOOOOWWK..',
      '...KKKKKKKK...',
    ],
    pal: { K, O: '#FF8A3D', P: '#FF4D9A', G: '#7BC800', N: '#FF4D9A', W: '#FFFFFF' },
  },
  pas: {
    label: 'Pas',
    rows: [
      '.DD......DD.',
      '.DDKKKKKKDD.',
      '.DDBBBBBBDD.',
      '.DDBKBBKBDD.',
      '..KBBBBBBK..',
      '..KBBKKBBK..',
      '..KBBNNBBK..',
      '...KBBBBK...',
      '...PKPKPK...',
      '....KKKK....',
    ],
    pal: { K, D: '#5B3A1E', B: '#C8823F', N: '#FF4D9A', P: '#D7FF3A' },
  },
  koka: {
    label: 'Koka',
    rows: [
      '....RR......',
      '...RRRR.....',
      '...KKKK.....',
      '..KWWWWK....',
      '..KWKWWK....',
      '.YYWWWWK....',
      '..KWWWWWK..K',
      '..KWWWWWWKKK',
      '..KWWWWWWWWK',
      '...KWWWWWWK.',
      '....KKKKKK..',
      '.....Y..Y...',
    ],
    pal: { K, R: '#FF4D9A', W: '#FFFFFF', Y: '#FFB000' },
  },
  majmun: {
    label: 'Majmun',
    rows: [
      '.....PP.....',
      '...BBPPBB...',
      '..BBBBBBBB..',
      'EEBFFFFFFBEE',
      'EEFKFFFFKFEE',
      '.BFFFFFFFFB.',
      '.BFFFKKFFFB.',
      '.BFFKFFKFFB.',
      '..BBFFFFBB..',
      '...BBBBBB...',
    ],
    pal: { B: '#6B4226', F: '#E8C39E', E: '#D9A27A', K, P: '#4DE1FF' },
  },
  lisica: {
    label: 'Lisica',
    rows: [
      '.O........O.',
      '.OO......OO.',
      '.OOOOOOOOOO.',
      'OOKOOOOOOKOO',
      'OOOOOOOOOOOO',
      '.WWOOOOOOWW.',
      '..WWWOOWWW..',
      '...WWKKWW...',
      '....WWWW....',
      '.....WW.....',
    ],
    pal: { O: '#FF6A1A', W: '#FFFFFF', K },
  },
  sova: {
    label: 'Sova',
    rows: [
      '.G........G.',
      '.GG......GG.',
      '.GGGGGGGGGG.',
      'GWWWWGGWWWWG',
      'GWYKWGGWKYWG',
      'GWWWWBBWWWWG',
      '.GGGGBBGGGG.',
      '.GLLLLLLLLG.',
      '.GLGLLLLGLG.',
      '..GGGGGGGG..',
      '...Y....Y...',
    ],
    pal: { G: '#7A5C48', W: '#F4EEE6', Y: '#D7FF3A', K, B: '#FFB000', L: '#C9A88C' },
  },
  svinja: {
    label: 'Svinja',
    rows: [
      '.DD......DD.',
      '.DPP....PPD.',
      '..PPPPPPPP..',
      '.PPKPPPPKPP.',
      '.PPPPPPPPPP.',
      '.PPPDDDDPPP.',
      '.PPDKDDKDPP.',
      '.PPPDDDDPPP.',
      '..PPPPPPPP..',
      '..PP....PP..',
    ],
    pal: { P: '#FFA3C4', D: '#E5638F', K },
  },
};

export const COMPANION_CHOICES: AnimalId[] = ['macka', 'pas', 'koka', 'lisica'];
export const COMMON_POOL: AnimalId[] = ['koka', 'svinja', 'pas', 'lisica', 'sova', 'macka'];
export const RARE_ANIMAL: AnimalId = 'majmun';
export const RESCUE_COST = 4;

export const PUNK_NAMES = [
  'Žvaka', 'Zoka', 'Mrva', 'Iglica', 'Bubica', 'Šrafić', 'Rđa', 'Lola', 'Pera Pank',
  'Kiki', 'Fifi', 'Đura', 'Neon', 'Zipa', 'Bodlja', 'Mungos', 'Šiljo', 'Krpica',
];
