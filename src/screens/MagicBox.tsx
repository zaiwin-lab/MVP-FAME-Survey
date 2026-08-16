import { useMemo, useState } from 'react';
import { Button, Eyebrow, Note } from '../components/ui';
import { useI18n } from '../i18n';
import { extractAssets, mergeAssets, platformLabel } from '../lib/magicbox';
import type { AssetPlatform, BusinessContext, DetectedAsset } from '../types';

const PLATFORM_OPTIONS: AssetPlatform[] = [
  'website',
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'youtube',
  'google_business',
  'shopee',
  'lazada',
  'grabfood',
  'foodpanda',
  'whatsapp',
  'directory',
  'other',
];

const PLACEHOLDER_LINES = `www.mybusiness.com.my
facebook.com/mybusinesskch
@mybusiness_kch
https://maps.app.goo.gl/xxxxx
shopee.com.my/mybusiness`;

export function MagicBox({
  assets,
  setAssets,
  context,
  setContext,
  onBack,
  onNext,
}: {
  assets: DetectedAsset[];
  setAssets: (a: DetectedAsset[]) => void;
  context: BusinessContext;
  setContext: (p: Partial<BusinessContext>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  const [paste, setPaste] = useState('');
  const preview = useMemo(() => (paste.trim() ? extractAssets(paste) : []), [paste]);
  const fresh = preview.filter((p) => !assets.some((a) => a.id === p.id));

  const add = () => {
    setAssets(mergeAssets(assets, preview));
    setPaste('');
  };

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>{t('mb.eyebrow')}</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">{t('mb.h1')}</h1>
      <p className="measure mt-4 text-[1.02rem] leading-relaxed text-ink-soft">{t('mb.sub')}</p>

      <div className="mt-8">
        <Note tone="warn">{t('con.warn')}</Note>
      </div>

      <div className="mt-8">
        <label htmlFor="paste" className="block text-[0.95rem] font-medium text-ink">
          {t('mb.label')}
        </label>
        <textarea
          id="paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={7}
          placeholder={`${t('mb.placeholder')}\n\n${PLACEHOLDER_LINES}`}
          className="mt-2.5 w-full resize-y rounded-lg border border-line bg-white p-4 font-sans text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-mute/70 focus:border-brand"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={add} disabled={fresh.length === 0}>
            {fresh.length > 0 ? t('mb.addn', { n: fresh.length }) : t('mb.add')}
          </Button>
          <span className="text-sm text-ink-mute" aria-live="polite">
            {paste.trim() === ''
              ? t('mb.nothing')
              : t('mb.found', {
                  found: preview.length,
                  fresh: fresh.length,
                  dupe: preview.length - fresh.length,
                })}
          </span>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="detected-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 id="detected-heading" className="font-display text-[1.3rem] text-ink">
            {t('mb.detected')}
          </h2>
          <span className="tnum text-sm text-ink-mute">
            {t('mb.confirmed', { n: assets.length })}
          </span>
        </div>

        {assets.length === 0 ? (
          <p className="py-8 text-[0.95rem] text-ink-mute">{t('mb.empty')}</p>
        ) : (
          <ul className="mt-4 grid gap-2.5">
            {assets.map((a) => (
              <li
                key={a.id}
                className="anim-rise flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3.5"
              >
                <select
                  aria-label={`Platform for ${a.label}`}
                  value={a.platform}
                  onChange={(e) =>
                    setAssets(
                      assets.map((x) =>
                        x.id === a.id ? { ...x, platform: e.target.value as AssetPlatform } : x,
                      ),
                    )
                  }
                  className="min-h-9 shrink-0 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {platformLabel(p)}
                    </option>
                  ))}
                </select>
                <span className="min-w-0 flex-1 truncate text-[0.92rem] text-ink" title={a.url}>
                  {a.url}
                </span>
                <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-soft">
                  {t('mb.declared')}
                </span>
                <button
                  onClick={() => setAssets(assets.filter((x) => x.id !== a.id))}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-ink-mute hover:text-brand"
                  aria-label={`${t('btn.remove')} ${a.url}`}
                >
                  {t('btn.remove')}
                </button>
              </li>
            ))}
          </ul>
        )}

        {assets.length > 0 && (
          <p className="mt-4 text-sm leading-relaxed text-ink-mute">{t('mb.note')}</p>
        )}
      </section>

      <section className="mt-12" aria-labelledby="context-heading">
        <h2 id="context-heading" className="font-display text-[1.3rem] text-ink">
          {t('mb.ctx.h2')}
        </h2>
        <p className="mt-2 text-[0.95rem] text-ink-soft">{t('mb.ctx.sub')}</p>

        <div className="mt-6 grid gap-5">
          <TextArea
            id="description"
            label={t('mb.f.desc')}
            hint={t('mb.f.desc.h')}
            rows={3}
            value={context.description}
            onChange={(v) => setContext({ description: v })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              id="products"
              label={t('mb.f.prod')}
              rows={2}
              value={context.productsServices}
              onChange={(v) => setContext({ productsServices: v })}
            />
            <TextArea
              id="customers"
              label={t('mb.f.cust')}
              rows={2}
              value={context.targetCustomers}
              onChange={(v) => setContext({ targetCustomers: v })}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              id="location"
              label={t('mb.f.loc')}
              rows={1}
              value={context.location}
              onChange={(v) => setContext({ location: v })}
            />
            <TextArea
              id="tagline"
              label={t('mb.f.tag')}
              rows={1}
              value={context.tagline}
              onChange={(v) => setContext({ tagline: v })}
            />
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          {t('btn.back')}
        </Button>
        <Button onClick={onNext}>{t('btn.review')}</Button>
      </div>
    </div>
  );
}

function TextArea({
  id,
  label,
  hint,
  rows,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.92rem] font-medium text-ink">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-sm text-ink-mute">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-line bg-white p-3 text-[0.95rem] leading-relaxed text-ink focus:border-brand"
      />
    </div>
  );
}
