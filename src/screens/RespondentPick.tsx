import { Button, Eyebrow } from '../components/ui';
import { RESPONDENT_TYPES } from '../data/survey';
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
  return (
    <div className="shell max-w-4xl py-12 md:py-16">
      <Eyebrow>Step 1 of 3</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">
        Which of these sounds most like you?
      </h1>
      <p className="measure mt-4 text-ink-soft">
        The questions change depending on your answer, so pick the one closest to your position
        today.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {RESPONDENT_TYPES.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              aria-pressed={active}
              className={`flex h-full flex-col rounded-xl border p-6 text-left transition-[border-color,background-color,transform] duration-200 ${
                active
                  ? 'border-brand bg-brand-tint'
                  : 'border-line bg-white hover:-translate-y-0.5 hover:border-brand/60'
              }`}
            >
              <h2 className="font-display text-[1.2rem] leading-snug text-ink">{t.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.who}</p>
              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-ink-mute">
                {t.examples.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <span
                className={`mt-5 text-sm font-medium ${active ? 'text-brand' : 'text-ink-mute'}`}
              >
                {active ? 'Selected' : 'Choose this'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!value}>
          Start the questions
        </Button>
      </div>
    </div>
  );
}
