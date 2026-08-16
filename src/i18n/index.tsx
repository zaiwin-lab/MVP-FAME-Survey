import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LANGS, LANG_LABELS, LANG_NAMES, type Dict, type Lang } from './langs';
import { uiDict } from './dict.ui';
import { surveyDict } from './dict.survey';
import { reportDict } from './dict.report';

const DICT: Dict = { ...uiDict, ...surveyDict, ...reportDict };
const STORAGE_KEY = 'fame-lang';

/** Values interpolated into `{name}` placeholders. */
type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export type T = (key: string, vars?: Vars, fallback?: string) => string;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const I18nContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && (LANGS as readonly string[]).includes(saved)) return saved as Lang;
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith('ms')) return 'bm';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang === 'bm' ? 'ms' : lang === 'ib' ? 'iba' : lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable; the choice still applies for this session */
    }
  }, []);

  const t = useCallback<T>(
    (key, vars, fallback) => {
      const row = DICT[key];
      if (!row) return interpolate(fallback ?? key, vars);
      const i = LANGS.indexOf(lang);
      // An untranslated cell falls back to English rather than rendering blank.
      const value = row[i] || row[0];
      return interpolate(value, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('nav.lang')}
      className={`flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-surface p-1 ${className}`}
    >
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            title={LANG_NAMES[l]}
            className={`min-h-8 min-w-9 rounded-full px-2.5 text-[0.72rem] font-semibold transition-colors duration-150 ${
              active ? 'bg-brand text-white' : 'text-ink-soft hover:bg-white hover:text-brand'
            }`}
          >
            <span className="sr-only">{LANG_NAMES[l]}</span>
            <span aria-hidden="true">{LANG_LABELS[l]}</span>
          </button>
        );
      })}
    </div>
  );
}

export { LANGS, LANG_LABELS, LANG_NAMES };
export type { Lang };
