import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '../components/ui';
import { questionsFor, sectionsFor } from '../data/survey';
import { useI18n, type T } from '../i18n';
import type { AnswerValue, Answers, Question, RespondentType } from '../types';
import type { SaveStatus } from '../state/store';

const MAX_MULTI = 3;

export function Survey({
  respondentType,
  answers,
  index,
  setIndex,
  setAnswer,
  onBack,
  onComplete,
  saveStatus,
}: {
  respondentType: RespondentType;
  answers: Answers;
  index: number;
  setIndex: (i: number) => void;
  setAnswer: (id: string, v: AnswerValue) => void;
  onBack: () => void;
  onComplete: () => void;
  saveStatus: SaveStatus;
}) {
  const { t } = useI18n();
  const questions = useMemo(() => questionsFor(respondentType), [respondentType]);
  const sections = useMemo(() => sectionsFor(respondentType), [respondentType]);
  const q = questions[Math.min(index, questions.length - 1)];
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  const answered = answers[q.id] !== undefined && !(Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0);
  const canAdvance = answered || q.optional === true;
  const sectionIndex = sections.findIndex((s) => s.id === q.section);
  const progress = ((index + 1) / questions.length) * 100;

  const next = () => {
    if (index + 1 >= questions.length) onComplete();
    else setIndex(index + 1);
  };
  const prev = () => {
    if (index === 0) onBack();
    else setIndex(index - 1);
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="no-print sticky top-16 z-10 border-b border-line-soft bg-white/92 backdrop-blur-sm">
        <div className="shell py-3">
          <div className="flex items-center justify-between gap-4 text-xs">
            {/* Full trail on desktop; on a phone it would eat a third of the screen. */}
            <ol className="hidden flex-wrap items-center gap-x-2 gap-y-1 sm:flex">
              {sections.map((s, i) => (
                <li
                  key={s.id}
                  className={`flex items-center gap-2 ${
                    i === sectionIndex ? 'text-brand' : i < sectionIndex ? 'text-ink-mute' : 'text-ink-mute/60'
                  }`}
                >
                  <span className={i === sectionIndex ? 'font-medium' : ''}>
                    {t(`sec.${s.id}`, undefined, s.name)}
                  </span>
                  {i < sections.length - 1 && <span aria-hidden="true">·</span>}
                </li>
              ))}
            </ol>
            <p className="font-medium text-brand sm:hidden">
              {t(`sec.${sections[sectionIndex]?.id}`, undefined, sections[sectionIndex]?.name)}
              <span className="ml-1.5 font-normal text-ink-mute">
                {sectionIndex + 1}/{sections.length}
              </span>
            </p>
            <span
              className="shrink-0 text-ink-mute"
              aria-live="polite"
              aria-atomic="true"
            >
              {saveStatus === 'saved' ? t('sv.saved') : t('sv.saving')}
            </span>
          </div>
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-line-soft"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-label={t('sv.qof', { n: index + 1, total: questions.length })}
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${progress}%`, transition: 'width 0.4s var(--ease-out-quint)' }}
            />
          </div>
        </div>
      </div>

      <div className="shell w-full max-w-2xl flex-1 py-10 md:py-14">
        <p className="tnum text-sm text-ink-mute">
          {t('sv.qof', { n: index + 1, total: questions.length })}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          key={q.id}
          className="anim-rise mt-2 font-display text-[clamp(1.45rem,3.4vw,2.05rem)] leading-tight outline-none"
        >
          {t(`q.${q.id}`, undefined, q.text)}
        </h1>
        {q.help && (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            {t(`q.${q.id}.help`, undefined, q.help)}
          </p>
        )}
        {q.optional && <p className="mt-2 text-sm text-ink-mute">{t('con.optional')}</p>}

        <div className="mt-8">
          <Field question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} t={t} />
        </div>
      </div>

      <div className="no-print sticky bottom-0 border-t border-line-soft bg-white/94 backdrop-blur-sm">
        <div className="shell flex max-w-2xl items-center gap-3 py-4">
          <Button variant="secondary" onClick={prev}>
            {t('btn.back')}
          </Button>
          <Button onClick={next} disabled={!canAdvance} className="flex-1 sm:flex-none">
            {index + 1 >= questions.length ? t('btn.tomagic') : t('btn.next')}
          </Button>
          {!canAdvance && (
            <span className="hidden text-sm text-ink-mute sm:block">{t('sv.choose')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  question,
  value,
  onChange,
  t,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  t: T;
}) {
  const label = (v: string, fallback: string) => t(`o.${question.id}.${v}`, undefined, fallback);

  if (question.type === 'scale' && question.scale) {
    const { min, max, minLabel, maxLabel } = question.scale;
    const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <div role="radiogroup" aria-label={t(`q.${question.id}`, undefined, question.text)}>
        <div className="flex gap-2">
          {steps.map((s) => {
            const active = value === s;
            return (
              <button
                key={s}
                role="radio"
                aria-checked={active}
                onClick={() => onChange(s)}
                className={`tnum flex-1 rounded-lg border py-5 text-lg font-medium transition-[border-color,background-color,color] ${
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-line bg-white text-ink hover:border-brand/60'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 flex justify-between gap-4 text-sm text-ink-mute">
          <span>{t(`q.${question.id}.min`, undefined, minLabel)}</span>
          <span className="text-right">{t(`q.${question.id}.max`, undefined, maxLabel)}</span>
        </div>
      </div>
    );
  }

  if (question.type === 'slider') {
    return <StepSlider question={question} value={value} onChange={onChange} t={t} label={label} />;
  }

  if (question.type === 'select') {
    return <Dropdown question={question} value={value} onChange={onChange} t={t} label={label} />;
  }

  if (question.type === 'segmented') {
    return <Segmented question={question} value={value} onChange={onChange} t={t} label={label} />;
  }

  if (question.type === 'multi') {
    const selected = (value as string[] | undefined) ?? [];
    const atLimit = selected.length >= MAX_MULTI;
    return (
      <div>
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options!.map((o) => {
            const active = selected.includes(o.value);
            const blocked = atLimit && !active;
            return (
              <button
                key={o.value}
                aria-pressed={active}
                disabled={blocked}
                onClick={() =>
                  onChange(
                    active ? selected.filter((v) => v !== o.value) : [...selected, o.value],
                  )
                }
                className={`rounded-lg border px-4 py-3.5 text-left text-[0.95rem] transition-[border-color,background-color] ${
                  active
                    ? 'border-brand bg-brand-tint text-ink'
                    : blocked
                      ? 'cursor-not-allowed border-line-soft bg-white text-ink-mute/60'
                      : 'border-line bg-white text-ink hover:border-brand/60'
                }`}
              >
                {label(o.value, o.label)}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-ink-mute" aria-live="polite">
          {t('sv.selcount', { n: selected.length, max: MAX_MULTI })}
          {atLimit && ` ${t('sv.atlimit')}`}
        </p>
      </div>
    );
  }

  const options = [...(question.options ?? [])];
  if (question.allowNotSure) options.push({ value: 'not_sure', label: t('o.common.not_sure') });

  return (
    <div
      role="radiogroup"
      aria-label={t(`q.${question.id}`, undefined, question.text)}
      className="grid gap-2"
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[0.95rem] transition-[border-color,background-color] ${
              active ? 'border-brand bg-brand-tint text-ink' : 'border-line bg-white text-ink hover:border-brand/60'
            }`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                active ? 'border-brand' : 'border-line'
              }`}
              aria-hidden="true"
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
            </span>
            {o.value === 'not_sure' ? o.label : label(o.value, o.label)}
          </button>
        );
      })}
    </div>
  );
}


type FieldProps = {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  t: T;
  label: (v: string, fallback: string) => string;
};

/**
 * A slider across ordinal bands rather than a raw number line. The stops carry
 * meaning (SME thresholds, trading-age brackets), so dragging lands on a real
 * category instead of a number nobody can answer precisely.
 */
function StepSlider({ question, value, onChange, t, label }: FieldProps) {
  const stops = question.options ?? [];
  const answered = value !== undefined;
  const index = answered ? Math.max(0, stops.findIndex((o) => o.value === value)) : 0;
  const current = stops[index];

  // A range input always has a value, so an untouched slider must not be read
  // as an answer. Pointer and key release commit whatever it is resting on.
  const commit = () => onChange(stops[index].value);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p
          className={`font-display text-[1.6rem] leading-none transition-colors ${
            answered ? 'text-ink' : 'text-ink-mute/50'
          }`}
          aria-hidden="true"
        >
          {label(current.value, current.label)}
        </p>
        {!answered && <p className="text-sm text-ink-mute">{t('sv.drag')}</p>}
      </div>

      <input
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(stops[Number(e.target.value)].value)}
        onPointerUp={commit}
        onKeyUp={commit}
        aria-label={t(`q.${question.id}`, undefined, question.text)}
        aria-valuetext={label(current.value, current.label)}
        // The filled portion is what makes a slider read as a slider, so the
        // track is painted up to the thumb once the question has been answered.
        style={
          {
            '--fill': answered ? `${(index / (stops.length - 1)) * 100}%` : '0%',
          } as CSSProperties
        }
        className={`mt-5 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-brand)_var(--fill),var(--color-line)_var(--fill))]
          [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--color-brand)_var(--fill),var(--color-line)_var(--fill))]
          [&::-webkit-slider-thumb]:mt-[-0.6rem] [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(16,32,64,.3)]
          [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
          ${answered ? '[&::-webkit-slider-thumb]:bg-brand [&::-moz-range-thumb]:bg-brand' : '[&::-webkit-slider-thumb]:bg-ink-mute [&::-moz-range-thumb]:bg-ink-mute'}`}
      />

      {/* Tick labels double as buttons so stop 0 is reachable without dragging. */}
      <div className="mt-3 flex justify-between gap-1">
        {stops.map((o, i) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-8 flex-1 rounded px-0.5 text-[0.7rem] leading-tight transition-colors sm:text-xs ${
              answered && i === index ? 'font-semibold text-brand' : 'text-ink-mute hover:text-brand'
            }`}
          >
            {label(o.value, o.label)}
          </button>
        ))}
      </div>

      {question.note && (
        <p className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink-soft">
          {t(question.note)}
        </p>
      )}
    </div>
  );
}

/** Dropdown for lists too long to render as cards without burying the page. */
function Dropdown({ question, value, onChange, t, label }: FieldProps) {
  const options = question.options ?? [];
  return (
    <div>
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t(`q.${question.id}`, undefined, question.text)}
        className="w-full appearance-none rounded-lg border border-line bg-white bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-4 text-[1rem] text-ink focus:border-brand"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2352607a' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="" disabled>
          {t('sv.choose.one')}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {label(o.value, o.label)}
          </option>
        ))}
      </select>
      <p className="mt-3 text-sm text-ink-mute">
        {t('sv.optcount', { n: options.length })}
      </p>
    </div>
  );
}

/** Compact segmented control for short, mutually exclusive option sets. */
function Segmented({ question, value, onChange, t, label }: FieldProps) {
  const options = question.options ?? [];
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t(`q.${question.id}`, undefined, question.text)}
        className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-surface p-1.5"
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`min-h-11 flex-1 whitespace-nowrap rounded-lg px-3 text-[0.92rem] font-medium transition-colors ${
                active ? 'bg-brand text-white' : 'text-ink-soft hover:bg-white hover:text-brand'
              }`}
            >
              {label(o.value, o.label)}
            </button>
          );
        })}
      </div>
      {question.allowDecline && (
        <button
          onClick={() => onChange('no_answer')}
          aria-pressed={value === 'no_answer'}
          className={`mt-3 text-sm underline underline-offset-4 ${
            value === 'no_answer' ? 'font-medium text-brand' : 'text-ink-mute hover:text-brand'
          }`}
        >
          {t('sv.decline')}
        </button>
      )}
    </div>
  );
}
