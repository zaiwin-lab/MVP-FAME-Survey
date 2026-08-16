import { useEffect, useRef, useState } from 'react';
import { Button, Eyebrow, NodeField, Note } from '../components/ui';
import { questionsFor } from '../data/survey';
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
  const questions = questionsFor(respondentType);
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const typeLabel = RESPONDENT_TYPES.find((t) => t.id === respondentType)?.title ?? '';
  const emailValid = !consents.reportEmail || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>Almost done</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">
        Review before you submit
      </h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        <Row label="You answered as" value={typeLabel} onEdit={onEditAnswers} />
        <Row
          label="Questions answered"
          value={`${answeredCount} of ${questions.length}`}
          onEdit={onEditAnswers}
        />
        <Row
          label="Public assets added"
          value={assets.length === 0 ? 'None' : `${assets.length} declared`}
          onEdit={onEditAssets}
        />
      </dl>

      {answeredCount < questions.length && (
        <div className="mt-6">
          <Note>
            You skipped {questions.length - answeredCount} optional question
            {questions.length - answeredCount > 1 ? 's' : ''}. Missing answers are recorded as
            missing, never counted as a zero.
          </Note>
        </div>
      )}

      {consents.reportEmail && (
        <div className="mt-10">
          <label htmlFor="email" className="block text-[0.95rem] font-medium text-ink">
            Where should we send your snapshot?
          </label>
          <p className="mt-1 text-sm text-ink-mute">
            You asked for a copy by email. This is used for the report only.
          </p>
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
            <p className="mt-2 text-sm text-signal-warn">
              That address does not look complete. Check for a missing @ or domain.
            </p>
          )}
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onEditAssets}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={!emailValid}>
          Submit and generate my snapshot
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <dt className="text-sm text-ink-mute">{label}</dt>
        <dd className="mt-0.5 text-[0.98rem] font-medium text-ink">{value}</dd>
      </div>
      <button onClick={onEdit} className="text-sm font-medium text-brand underline underline-offset-4">
        Change
      </button>
    </div>
  );
}

const STAGES: { label: string; tip: string }[] = [
  {
    label: 'Organising your business information',
    tip: 'Your answers are stored separately from your scores, so the raw research data stays usable even if the scoring changes later.',
  },
  {
    label: 'Identifying public digital assets',
    tip: 'Links are sorted by platform and stripped of tracking parameters, so the same page pasted twice counts once.',
  },
  {
    label: 'Checking which signals are available',
    tip: 'Anything that cannot be confirmed is marked as unverified rather than assumed. A gap in evidence lowers confidence, it does not invent a number.',
  },
  {
    label: 'Assessing brand and channel clarity',
    tip: 'Clarity is read from the words you supplied, not guessed from your industry.',
  },
  {
    label: 'Evaluating customer discoverability',
    tip: 'Most local businesses are found through maps and search before they are found through a website.',
  },
  {
    label: 'Reviewing conversion readiness',
    tip: 'Visibility without an obvious next step is the most common and most fixable gap.',
  },
  {
    label: 'Generating practical recommendations',
    tip: 'AI can organise business signals quickly, but strong recommendations still depend on the quality and completeness of the information supplied.',
  },
  { label: 'Preparing your snapshot', tip: 'Every finding is tagged as fact, inference, recommendation or limitation before it is shown.' },
];

export function Processing({
  input,
  onReady,
}: {
  input: Parameters<typeof generateReport>[0];
  onReady: (r: Report) => void;
}) {
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
      if (i >= STAGES.length) {
        window.clearInterval(tick);
        window.setTimeout(() => reportRef.current && onReady(reportRef.current), 500);
      }
    }, 620);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = STAGES[Math.min(stage, STAGES.length - 1)];

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden">
      <div className="grid-ground pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <NodeField className="pointer-events-none absolute right-0 top-1/2 hidden aspect-square h-[30rem] -translate-y-1/2 text-cyan opacity-35 md:block" />
      <div className="shell relative max-w-2xl py-16">
        <Eyebrow>Analysis in progress</Eyebrow>
        <h1 className="font-display text-[clamp(1.6rem,3.6vw,2.3rem)] leading-tight">
          Building your snapshot
        </h1>

        <ol className="mt-9 space-y-1" aria-live="polite">
          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <li
                key={s.label}
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
                {s.label}
              </li>
            );
          })}
        </ol>

        <div className="mt-9 rounded-lg border border-line bg-white/80 p-5">
          <p className="text-[0.93rem] leading-relaxed text-ink-soft">{current.tip}</p>
        </div>

        <p className="mt-6 text-sm text-ink-mute">
          Reference {input.respondentId}. If this takes longer than expected, your session is saved
          and you can return to it.
        </p>
      </div>
    </div>
  );
}

export type { BusinessContext };
