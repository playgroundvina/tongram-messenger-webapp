export type Script =
  | 'latin'
  | 'latin-extended'
  | 'cyrillic'
  | 'arabic'
  | 'hebrew'
  | 'hangul'
  | 'other';

export const LANGUAGE_SCRIPT_MAP: Record<string, Script> = {
  // Latin
  en: 'latin',
  fr: 'latin-extended',
  de: 'latin',
  es: 'latin-extended',
  it: 'latin',
  pt: 'latin-extended',
  'pt-br': 'latin-extended',
  nl: 'latin',
  fi: 'latin',
  id: 'latin',
  ms: 'latin',
  tr: 'latin-extended',
  uz: 'latin-extended',
  vi: 'latin-extended',
  ca: 'latin-extended',
  hr: 'latin-extended',
  cs: 'latin-extended',
  hu: 'latin-extended',
  pl: 'latin-extended',

  // Cyrillic
  ru: 'cyrillic',
  uk: 'cyrillic',
  be: 'cyrillic',
  sr: 'cyrillic',
  kk: 'cyrillic',

  // Others
  ar: 'arabic',
  fa: 'arabic',
  he: 'hebrew',
  ko: 'hangul',
};

export const SCRIPT_REGEX: Record<Script, RegExp> = {
  latin: /^[a-zA-Z0-9\s.,!?'"()\-_:;]+$/,
  'latin-extended': /^[a-zA-Z0-9\u00C0-\u024F\s.,!?'"()\-_:;]+$/,
  cyrillic: /[\u0400-\u04FF]/,
  arabic: /[\u0600-\u06FF]/,
  hebrew: /[\u0590-\u05FF]/,
  hangul: /[\uAC00-\uD7AF]/,
  other: /.^/,
};
