import { Button, Eyebrow, NodeField } from '../components/ui';
import { branding } from '../config/branding';
import { useI18n } from '../i18n';
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
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden">
      <NodeField className="pointer-events-none absolute right-0 top-1/2 hidden aspect-square h-[26rem] -translate-y-1/2 text-cyan opacity-40 lg:block" />
      <div className="shell relative max-w-3xl py-16 md:py-24">
        <Eyebrow>{t('ty.eyebrow')}</Eyebrow>
        <h1 className="font-display text-[clamp(1.9rem,4.4vw,2.9rem)] leading-tight">
          {t('ty.h1')}
        </h1>
        <p className="measure mt-5 text-[1.02rem] leading-relaxed text-ink-soft">{t('ty.p1')}</p>
        <p className="measure mt-4 leading-relaxed text-ink-soft">{t('ty.p2')}</p>

        <dl className="mt-10 divide-y divide-line border-y border-line">
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="text-sm text-ink-mute">{t('ty.ref')}</dt>
            <dd className="tnum font-medium text-ink">{reference}</dd>
          </div>
          {consents.reportEmail && (
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="text-sm text-ink-mute">{t('ty.copy')}</dt>
              <dd className="text-right text-[0.95rem] text-ink">
                {t('ty.willsend', { email: email || t('rp.your.email') })}
              </dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <dt className="text-sm text-ink-mute">
              {t('ty.future')} {branding.convenor}
            </dt>
            <dd className="text-[0.95rem] text-ink">
              {consents.futureComms ? t('ty.optedin') : t('ty.optedout')}
            </dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={onBackToReport}>{t('ty.again')}</Button>
          <Button variant="secondary" onClick={onRestart}>
            {t('ty.restart')}
          </Button>
        </div>
      </div>
    </div>
  );
}
