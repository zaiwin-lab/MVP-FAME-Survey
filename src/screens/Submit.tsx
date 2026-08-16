import { useEffect, useRef, useState } from 'react';
import { Button, Eyebrow, NodeField, Note } from '../components/ui';
import { questionsFor } from '../data/survey';
import { useI18n, type T } from '../i18n';
import { generateReport } from '../lib/scoring';
import type { Answers, BusinessContext, Consents, DetectedAsset, Report, RespondentType } from '../types';
import { RESPONDENT_TYPES } from '../data/survey';

export function Review({
  respondentType,
  answers,
  assets,
  consents,
  email,
  setEmail,
  onEditAnswers,
  onEditAssets,
  onSubmit,
}: {
  respondentType: RespondentType;
  answers: Answers;
  assets: DetectedAsset[];
  consents: Consents;
  email: string;
  setEmail: (v: string) => void;
  onEditAnswers: () => void;
  onEditAssets: () => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const questions = questionsFor(respondentType);
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const rt = RESPONDENT_TYPES.find((r) => r.id === respondentType);
  const typeLabel = rt ? t(`rt.${rt.id}.title`, undefined, rt.title) : '';
  const emailValid = !consents.reportEmail || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>{t('rv.eyebrow')}</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">{t('rv.h1')}</h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        <Row label={t('rv.type')} value={typeLabel} onEdit={onEditAnswers} t={t} />
        <Row
          label={t('rv.answered')}
          value={t('rv.nof', { n: answeredCount, total: questions.length })}
          onEdit={onEditAnswers}
          t={t}
        />
        <Row
          label={t('rv.assets')}
          value={assets.length === 0 ? t('rv.none') : t('rv.ndeclared', { n: assets.length })}
          onEdit={onEditAssets}
          t={t}
        />
      </dl>

      {answeredCount < questions.length && (
        <div className="mt-6">
          <Note>{t('rv.skipped', { n: questions.length - answeredCount })}</Note>
        </div>
      )}

      {consents.reportEmail && (
        <div className="mt-10">
          <label htmlFor="email" className="block text-[0.95rem] font-medium text-ink">
            {t('rv.email.label')}
          </label>
          <p className="mt-1 text-sm text-ink-mute">{t('rv.email.hint')}</p>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@business.com.my"
            aria-invalid={!emailValid}
            className="mt-3 w-full max-w-md rounded-lg border border-line bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-mute/70 focus:border-brand"
          />
          {!emailValid && email.length > 0 && (
            <p className="mt-2 text-sm text-signal-warn">{t('rv.email.bad')}</p>
          )}
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onEditAssets}>
          {t('btn.back')}
        </Button>
        <Button onClick={onSubmit} disabled={!emailValid}>
          {t('btn.submit')}
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onEdit,
  t,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  t: T;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <dt className="text-sm text-ink-mute">{label}</dt>
        <dd className="mt-0.5 text-[0.98rem] font-medium text-ink">{value}</dd>
      </div>
      <button onClick={onEdit} className="text-sm font-medium text-brand underline underline-offset-4">
        {t('btn.change')}
      </button>
    </div>
  );
}

const STAGE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function Processing({
  input,
  onReady,
}: {
  input: Parameters<typeof generateReport>[0];
  onReady: (r: Report) => void;
}) {
  const { t } = useI18n();
  const [stage, setStage] = useState(0);
  const reportRef = useRef<Report | null>(null);

  useEffect(() => {
    // The report is computed for real up front; the stages narrate the steps
    // that produced it rather than animating an empty bar.
    reportRef.current = generateReport(input);
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setStage(i);
      if (i >= STAGE_KEYS.length) {
        window.clearInterval(tick);
        window.setTimeout(() => reportRef.current && onReady(reportRef.current), 500);
      }
    }, 620);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentKey = STAGE_KEYS[Math.min(stage, STAGE_KEYS.length - 1)];

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden">
      <div className="grid-ground pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <NodeField className="pointer-events-none absolute right-0 top-1/2 hidden aspect-square h-[30rem] -translate-y-1/2 text-cyan opacity-35 md:block" />
      <div className="shell relative max-w-2xl py-16">
        <Eyebrow>{t('pr.eyebrow')}</Eyebrow>
        <h1 className="font-display text-[clamp(1.6rem,3.6vw,2.3rem)] leading-tight">
          {t('pr.h1')}
        </h1>

        <ol className="mt-9 space-y-1" aria-live="polite">
          {STAGE_KEYS.map((k, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <li
                key={k}
                className={`flex items-center gap-3 py-1.5 text-[0.95rem] transition-colors duration-300 ${
                  done ? 'text-ink-mute' : active ? 'text-ink' : 'text-ink-mute/45'
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                    done
                      ? 'border-brand bg-brand text-white'
                      : active
                        ? 'border-brand text-brand'
                        : 'border-line text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  {done ? '✓' : '•'}
                </span>
                {t(`pr.s${k}`)}
              </li>
            );
          })}
        </ol>

        <div className="mt-9 rounded-lg border border-line bg-white/80 p-5">
          <p className="text-[0.93rem] leading-relaxed text-ink-soft">{t(`pr.t${currentKey}`)}</p>
        </div>

        <p className="mt-6 text-sm text-ink-mute">{t('pr.ref', { id: input.respondentId })}</p>
      </div>
    </div>
  );
}

export type { BusinessContext };
