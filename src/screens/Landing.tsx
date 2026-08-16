import { Band, Button, Eyebrow, NodeField } from '../components/ui';
import { branding } from '../config/branding';
import { useI18n } from '../i18n';

const RECEIVE = ['land.r1', 'land.r2', 'land.r3', 'land.r4', 'land.r5', 'land.r6'];
const FACTS = ['time', 'cost', 'priv', 'res'];
const WHO = ['land.who1', 'land.who2', 'land.who3'];

export function Landing({
  onStart,
  onPreview,
  resumable,
  onResume,
}: {
  onStart: () => void;
  onPreview: () => void;
  resumable: boolean;
  onResume: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line-soft bg-white">
        <div className="grid-ground pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <NodeField className="pointer-events-none absolute right-[-3rem] top-1/2 hidden aspect-square h-[34rem] -translate-y-1/2 text-cyan opacity-55 lg:block xl:right-4" />
        <div className="shell relative py-16 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>{t('land.eyebrow')}</Eyebrow>
            <h1 className="font-display text-[clamp(2.1rem,5.2vw,3.9rem)] leading-[1.06] text-ink">
              {t('land.h1')}
            </h1>
            <p className="measure mt-6 text-[1.06rem] leading-relaxed text-ink-soft">
              {t('land.sub')}
            </p>

            {resumable && (
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-brand/30 bg-brand-tint px-4 py-3">
                <p className="text-sm text-ink">{t('land.resume')}</p>
                <button
                  onClick={onResume}
                  className="text-sm font-medium text-brand underline underline-offset-4"
                >
                  {t('land.resume.cta')}
                </button>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={onStart}>{t('btn.start')}</Button>
              <Button variant="secondary" onClick={onPreview}>
                {t('btn.preview')}
              </Button>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-8">
              {FACTS.map((k) => (
                <div key={k}>
                  <dt className="text-xs text-ink-mute">{t(`land.fact.${k}`)}</dt>
                  <dd className="mt-0.5 text-[0.95rem] font-medium text-ink">
                    {t(`land.fact.${k}.v`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Band tone="tint" id="receive">
        <div className="max-w-2xl">
          <Eyebrow>{t('land.receive.eyebrow')}</Eyebrow>
          <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.5rem)] leading-tight">
            {t('land.receive.h2')}
          </h2>
          <p className="measure mt-4 text-ink-soft">{t('land.receive.sub')}</p>
        </div>

        <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {RECEIVE.map((k, i) => (
            <li key={k} className="border-t border-line pt-4">
              <span className="tnum text-xs text-cyan-deep">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-[1.12rem] leading-snug text-ink">{t(k)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t(`${k}.b`)}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl rounded-lg border border-line bg-white px-5 py-4 text-sm leading-relaxed text-ink-soft">
          {t('land.scope')}
        </p>
      </Band>

      <Band>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>{t('land.why.eyebrow')}</Eyebrow>
            <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.4rem)] leading-tight">
              {t('land.why.h2')}
            </h2>
            <p className="measure mt-5 leading-relaxed text-ink-soft">{t('land.why.p1')}</p>
            <p className="measure mt-4 leading-relaxed text-ink-soft">{t('land.why.p2')}</p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-7">
            <h3 className="font-display text-[1.2rem] text-ink">{t('land.who.h3')}</h3>
            <ul className="mt-5 space-y-4">
              {WHO.map((k) => (
                <li key={k} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <p className="text-[0.95rem] font-medium text-ink">{t(k)}</p>
                  <p className="mt-0.5 text-sm text-ink-mute">{t(`${k}.s`)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              {t('land.convenor')} {branding.convenor}.
              {!branding.saicApproved && ` ${t('nav.pending')}.`}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-10">
          <Button onClick={onStart}>{t('btn.start')}</Button>
          <span className="text-sm text-ink-mute">{t('land.noaccount')}</span>
        </div>
      </Band>
    </>
  );
}
