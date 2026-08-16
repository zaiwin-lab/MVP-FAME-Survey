import { Button, Eyebrow, NodeField } from '../components/ui';
import { branding } from '../config/branding';
import type { Consents } from '../types';

export function ThankYou({
  reference,
  consents,
  email,
  onRestart,
  onBackToReport,
}: {
  reference: string;
  consents: Consents;
  email: string;
  onRestart: () => void;
  onBackToReport: () => void;
}) {
  return (
    <div className="relative overflow-hidden">
      <NodeField className="pointer-events-none absolute right-0 top-1/2 hidden aspect-square h-[26rem] -translate-y-1/2 text-cyan opacity-40 lg:block" />
      <div className="shell relative max-w-3xl py-16 md:py-24">
        <Eyebrow>Complete</Eyebrow>
        <h1 className="font-display text-[clamp(1.9rem,4.4vw,2.9rem)] leading-tight">
          Thank you for contributing
        </h1>
        <p className="measure mt-5 text-[1.02rem] leading-relaxed text-ink-soft">
          Your participation helps strengthen awareness and understanding of the succession,
          digital transformation and AI adoption challenges facing Sarawak businesses.
        </p>
        <p className="measure mt-4 leading-relaxed text-ink-soft">
          Your individual responses remain private. Public findings will be presented only in
          aggregated form.
        </p>

        <dl className="mt-10 divide-y divide-line border-y border-line">
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="text-sm text-ink-mute">Your reference number</dt>
            <dd className="tnum font-medium text-ink">{reference}</dd>
          </div>
          {consents.reportEmail && (
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-ink-mute">Report copy</dt>
              <dd className="text-right text-[0.95rem] text-ink">
                Will be sent to {email || 'your email'}
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="text-sm text-ink-mute">Future updates from {branding.convenor}</dt>
            <dd className="text-[0.95rem] text-ink">
              {consents.futureComms ? 'You opted in. Unsubscribe any time.' : 'You did not opt in.'}
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={onBackToReport}>View my snapshot again</Button>
          <Button variant="secondary" onClick={onRestart}>
            Start a new response
          </Button>
        </div>
      </div>
    </div>
  );
}
