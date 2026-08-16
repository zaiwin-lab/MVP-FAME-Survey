import { useState } from 'react';
import { Button, Dial, Eyebrow, Meter } from '../components/ui';
import type { Report } from '../types';

export function ReportView({
  report,
  emailRequested,
  email,
  onFinish,
}: {
  report: Report;
  emailRequested: boolean;
  email: string;
  onFinish: () => void;
}) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="shell max-w-4xl py-12 md:py-16">
      <Eyebrow>Your result</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4.2vw,2.8rem)] leading-tight">
        Your Marketing &amp; Digital Presence Readiness Snapshot
      </h1>
      <p className="tnum mt-3 text-sm text-ink-mute">
        Reference {report.respondent_id} · Survey {report.survey_version} · Scoring{' '}
        {report.scoring_version}
      </p>

      {/* Headline score */}
      <section className="print-block mt-10 flex flex-col gap-8 rounded-xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
        <Dial value={report.overall_score} label="out of 100" />
        <div className="min-w-0">
          <p className="font-display text-[1.6rem] leading-tight text-ink">
            {report.readiness_band}
          </p>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            Based on {report.assets_submitted} declared public asset
            {report.assets_submitted === 1 ? '' : 's'} and the answers you gave.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
            <Stat
              label="Confidence"
              value={
                report.confidence_level.charAt(0).toUpperCase() + report.confidence_level.slice(1)
              }
            />
            <Stat label="Evidence coverage" value={`${Math.round(report.evidence_coverage * 100)}%`} />
            <Stat
              label="Assets verified"
              value={`${report.assets_reviewed} of ${report.assets_submitted}`}
            />
          </dl>
        </div>
      </section>

      {/* Dimensions */}
      <Section title="Dimension scores">
        <div className="divide-y divide-line-soft">
          {report.dimension_scores.map((d) => (
            <Meter key={d.key} label={d.dimension} value={d.score} confidence={d.confidence} />
          ))}
        </div>
      </Section>

      {/* Priority */}
      <section className="print-block mt-12 rounded-xl border-2 border-gold/60 bg-gold/8 p-7">
        <h2 className="font-display text-[1.25rem] text-ink">
          If you improve only one thing first, begin here
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink">{report.first_priority}</p>
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <Section title="Your three strongest signals" compact>
          <FindingList items={report.strengths} />
        </Section>
        <Section title="Three visibility gaps" compact>
          <FindingList items={report.gaps} />
        </Section>
      </div>

      <Section title="Three things you could do in seven days">
        <ol className="grid gap-4 sm:grid-cols-3">
          {report.quick_wins.map((w, i) => (
            <li key={i} className="print-block rounded-lg border border-line bg-white p-5">
              <span className="tnum text-xs text-cyan-deep">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1.5 text-[0.98rem] font-medium leading-snug text-ink">{w.action}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{w.why}</p>
              <p className="mt-3 border-t border-line-soft pt-3 text-xs text-ink-mute">{w.effort}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Two AI opportunities worth testing">
        <ul className="grid gap-4 sm:grid-cols-2">
          {report.ai_opportunities.map((o, i) => (
            <li key={i} className="print-block rounded-lg border border-line bg-surface p-5">
              <p className="text-[0.98rem] font-medium leading-snug text-ink">{o.opportunity}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{o.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Succession reflection — no score, by design */}
      <Section title="Your succession reflection">
        <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          This is a reflection of your own answers rather than a score. Succession and AI-readiness
          results are reported publicly in aggregate only.
        </p>
        <dl className="divide-y divide-line border-y border-line">
          {[
            ['Dependence on one person', report.succession_reflection.founderDependence],
            ['Written knowledge', report.succession_reflection.documentation],
            ['Successor position', report.succession_reflection.successorClarity],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="text-[0.9rem] font-medium text-ink">{k}</dt>
              <dd className="text-[0.95rem] leading-relaxed text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-mute">{report.succession_reflection.note}</p>
      </Section>

      {/* Scope and limitations */}
      <section className="print-block mt-12 rounded-xl border border-line bg-surface p-7">
        <h2 className="font-display text-[1.15rem] text-ink">What this snapshot does not cover</h2>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          {report.scope_notice}
        </p>
        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          {report.limitations.map((l) => (
            <li key={l} className="text-sm leading-relaxed text-ink-mute">
              {l}
            </li>
          ))}
        </ul>
      </section>

      {emailRequested && (
        <p className="mt-8 rounded-lg border border-brand/30 bg-brand-tint px-5 py-4 text-[0.95rem] text-ink">
          In the production build a copy of this snapshot is sent to {email || 'your email'} with a
          secure link and your reference number. This demonstration does not send email.
        </p>
      )}

      {/* Structured output — the report is rendered from validated JSON, not free text */}
      <section className="no-print mt-12 border-t border-line pt-8">
        <button
          onClick={() => setShowJson((v) => !v)}
          aria-expanded={showJson}
          className="text-sm font-medium text-brand underline underline-offset-4"
        >
          {showJson ? 'Hide' : 'Show'} the structured output behind this report
        </button>
        {showJson && (
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-line bg-white p-4 text-xs leading-relaxed text-ink-soft">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </section>

      <div className="no-print mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button onClick={() => window.print()}>Save as PDF</Button>
        <Button variant="secondary" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-mute">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
  compact,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'mt-0' : 'mt-12'}>
      <h2 className="mb-5 font-display text-[1.3rem] text-ink">{title}</h2>
      {children}
    </section>
  );
}

function FindingList({ items }: { items: Report['strengths'] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-mute">Not enough evidence was supplied for this list.</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((f, i) => (
        <li key={i} className="print-block border-t border-line pt-4">
          <p className="text-[0.96rem] leading-snug text-ink">{f.finding}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            <span className="text-ink-mute">Evidence: </span>
            {f.evidence}
          </p>
          <span className="mt-2 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-ink-soft">
            {f.classification}
          </span>
        </li>
      ))}
    </ul>
  );
}
