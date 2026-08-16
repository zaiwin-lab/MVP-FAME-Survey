import { Button, Eyebrow } from '../components/ui';
import { RESPONDENT_TYPES } from '../data/survey';
import { useI18n } from '../i18n';
import type { RespondentType } from '../types';

export function RespondentPick({
  value,
  onPick,
  onBack,
  onNext,
}: {
  value: RespondentType | null;
  onPick: (t: RespondentType) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="shell max-w-4xl py-12 md:py-16">
      <Eyebrow>{t('pick.eyebrow')}</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">{t('pick.h1')}</h1>
      <p className="measure mt-4 text-ink-soft">{t('pick.sub')}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {RESPONDENT_TYPES.map((rt) => {
          const active = value === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => onPick(rt.id)}
              aria-pressed={active}
              className={`flex h-full flex-col rounded-xl border p-6 text-left transition-[border-color,background-color,transform] duration-200 ${
                active
                  ? 'border-brand bg-brand-tint'
                  : 'border-line bg-white hover:-translate-y-0.5 hover:border-brand/60'
              }`}
            >
              <h2 className="font-display text-[1.2rem] leading-snug text-ink">
                {t(`rt.${rt.id}.title`, undefined, rt.title)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t(`rt.${rt.id}.who`, undefined, rt.who)}
              </p>
              <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-mute">
                {t(`rt.${rt.id}.ex`, undefined, rt.examples.join(' · '))}
              </p>
              <span className={`mt-5 text-sm font-medium ${active ? 'text-brand' : 'text-ink-mute'}`}>
                {active ? t('btn.selected') : t('btn.choose')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          {t('btn.back')}
        </Button>
        <Button onClick={onNext} disabled={!value}>
          {t('btn.startq')}
        </Button>
      </div>
    </div>
  );
}
