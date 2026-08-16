export const LANGS = ['en', 'bm', 'zh', 'ib'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  bm: 'BM',
  zh: '中',
  ib: 'IB',
};

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  bm: 'Bahasa Malaysia',
  zh: '中文',
  ib: 'Jaku Iban',
};

/** Dictionary rows are ordered [en, bm, zh, ib] to match LANGS. */
export type Row = readonly [string, string, string, string];
export type Dict = Record<string, Row>;
