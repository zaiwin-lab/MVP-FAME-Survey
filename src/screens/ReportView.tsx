import { useState } from 'react';
import { Button, Dial, Eyebrow, Meter } from '../components/ui';
import { useI18n, type T } from '../i18n';
import type { Localised, Report } from '../types';

/** Resolves a generated Localised value, falling back to the engine's English. */
function loc(t: T, l: Localised | undefined, fallback: string): string {
  if (!l) return fallback;
  const vars = { ...l.vars };
  if (typeof vars.dim === 'string') vars.dim = t(`dim.${vars.dim}`, undefined, String(vars.dim));
  return t(l.key, vars, fallback);
}

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
  const { t } = useI18n();
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="shell max-w-4xl py-12 md:py-16">
      <Eyebrow>{t('rp.eyebrow')}</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4.2vw,2.8rem)] leading-tight">{t('rp.h1')}</h1>
      <p className="tnum mt-3 text-sm text-ink-mute">
        {t('rp.meta', {
          id: report.respondent_id,
          sv: report.survey_version,
          sc: report.scoring_version,
        })}
      </p>

      {/* Headline score */}
      <section className="print-block mt-10 flex flex-col gap-8 rounded-xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
        <Dial value={report.overall_score} label={t('rp.outof')} />
        <div className="min-w-0">
          <p className="font-display text-[1.6rem] leading-tight text-ink">
            {t(`band.${report.readiness_band_key}`, undefined, report.readiness_band)}
          </p>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            {t('rp.basedon', { n: report.assets_submitted })}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
            <Stat
              label={t('rp.conf')}
              value={t(`conf.${report.confidence_level}`)}
            />
            <Stat label={t('rp.cov')} value={`${Math.round(report.evidence_coverage * 100)}%`} />
            <Stat
              label={t('rp.verified')}
              value={t('rv.nof', { n: report.assets_reviewed, total: report.assets_submitted })}
            />
          </dl>
        </div>
      </section>

      {/* Dimensions */}
      <Section title={t('rp.dims')}>
        <div className="divide-y divide-line-soft">
          {report.dimension_scores.map((d) => (
            <Meter
              key={d.key}
              label={t(`dim.${d.key}`, undefined, d.dimension)}
              value={d.score}
              confidence={t(`rp.evidence.${d.confidence}`)}
            />
          ))}
        </div>
      </Section>

      {/* Priority */}
      <section className="print-block mt-12 rounded-xl border-2 border-gold/60 bg-gold/8 p-7">
        <h2 className="font-display text-[1.25rem] text-ink">{t('rp.priority.h2')}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink">
          {loc(t, report.first_priority_i18n, report.first_priority)}
        </p>
      </section>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <Section title={t('rp.strengths')} compact>
          <FindingList items={report.strengths} t={t} />
        </Section>
        <Section title={t('rp.gaps')} compact>
          <FindingList items={report.gaps} t={t} />
        </Section>
      </div>

      <Section title={t('rp.wins')}>
        <ol className="grid gap-4 sm:grid-cols-3">
          {report.quick_wins.map((w, i) => (
            <li key={i} className="print-block rounded-lg border border-line bg-white p-5">
              <span className="tnum text-xs text-cyan-deep">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1.5 text-[0.98rem] font-medium leading-snug text-ink">
                {t(`qw.${w.key}.a`, undefined, w.action)}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                {t(`qw.${w.key}.w`, undefined, w.why)}
              </p>
              <p className="mt-3 border-t border-line-soft pt-3 text-xs text-ink-mute">
                {t(`qw.${w.key}.e`, undefined, w.effort)}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={t('rp.ai')}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {report.ai_opportunities.map((o, i) => (
            <li key={i} className="print-block rounded-lg border border-line bg-surface p-5">
              <p className="text-[0.98rem] font-medium leading-snug text-ink">
                {t(`ao.${o.key}.o`, o.vars, o.opportunity)}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                {t(`ao.${o.key}.w`, o.vars, o.why)}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Succession reflection — no score, by design */}
      <Section title={t('rp.succ')}>
        <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          {t('rp.succ.sub')}
        </p>
        <dl className="divide-y divide-line border-y border-line">
          {[
            [t('rp.succ.k1'), t(report.succession_reflection.founderDependence.key)],
            [t('rp.succ.k2'), t(report.succession_reflection.documentation.key)],
            [t('rp.succ.k3'), t(report.succession_reflection.successorClarity.key)],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="text-[0.9rem] font-medium text-ink">{k}</dt>
              <dd className="text-[0.95rem] leading-relaxed text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-mute">{t(report.succession_reflection.note.key)}</p>
      </Section>

      {/* Scope and limitations */}
      <section className="print-block mt-12 rounded-xl border border-line bg-surface p-7">
        <h2 className="font-display text-[1.15rem] text-ink">{t('rp.scope.h2')}</h2>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          {t('rp.scopenotice', undefined, report.scope_notice)}
        </p>
        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          {report.limitations_i18n.map((l, i) => (
            <li key={l.key} className="text-sm leading-relaxed text-ink-mute">
              {t(l.key, l.vars, report.limitations[i])}
            </li>
          ))}
        </ul>
      </section>

      {emailRequested && (
        <p className="mt-8 rounded-lg border border-brand/30 bg-brand-tint px-5 py-4 text-[0.95rem] text-ink">
          {t('rp.email.note', { email: email || t('rp.your.email') })}
        </p>
      )}

      {/* Structured output — the report is rendered from validated JSON, not free text */}
      <section className="no-print mt-12 border-t border-line pt-8">
        <button
          onClick={() => setShowJson((v) => !v)}
          aria-expanded={showJson}
          className="text-sm font-medium text-brand underline underline-offset-4"
        >
          {showJson ? t('rp.json.hide') : t('rp.json.show')}
        </button>
        {showJson && (
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-line bg-white p-4 text-xs leading-relaxed text-ink-soft">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </section>

      <div className="no-print mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button onClick={() => window.print()}>{t('btn.pdf')}</Button>
        <Button variant="secondary" onClick={onFinish}>
          {t('btn.finish')}
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

function FindingList({ items, t }: { items: Report['strengths']; t: T }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-mute">{t('rp.nofind')}</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((f, i) => (
        <li key={i} className="print-block border-t border-line pt-4">
          <p className="text-[0.96rem] leading-snug text-ink">
            {loc(t, f.finding_i18n, f.finding)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            <span className="text-ink-mute">{t('rp.ev')} </span>
            {(f.evidence_i18n ?? []).map((e) => t(e.key, e.vars)).join('; ') || f.evidence}
          </p>
          <span className="mt-2 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-ink-soft">
            {t(`cls.${f.classification}`, undefined, f.classification)}
          </span>
        </li>
      ))}
    </ul>
  );
}
