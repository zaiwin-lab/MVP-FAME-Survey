import { useMemo, useState } from 'react';
import { Button, Eyebrow, Note } from '../components/ui';
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

const PLACEHOLDER = `Paste anything here. For example:

www.mybusiness.com.my
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
  const [paste, setPaste] = useState('');
  const preview = useMemo(() => (paste.trim() ? extractAssets(paste) : []), [paste]);
  const fresh = preview.filter((p) => !assets.some((a) => a.id === p.id));

  const add = () => {
    setAssets(mergeAssets(assets, preview));
    setPaste('');
  };

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>Step 3 of 3</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">
        The AI Magic Box
      </h1>
      <p className="measure mt-4 text-[1.02rem] leading-relaxed text-ink-soft">
        Place your public digital footprint here. Everything you add is read, sorted by platform
        and checked for duplicates so you can confirm it before anything is scored.
      </p>

      <div className="mt-8">
        <Note tone="warn">
          Public links and public business information only. Never enter passwords, private
          dashboards, customer records, confidential documents or financial account details.
        </Note>
      </div>

      <div className="mt-8">
        <label htmlFor="paste" className="block text-[0.95rem] font-medium text-ink">
          Paste your links, one per line or all together
        </label>
        <textarea
          id="paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={7}
          placeholder={PLACEHOLDER}
          className="mt-2.5 w-full resize-y rounded-lg border border-line bg-white p-4 font-sans text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-mute/70 focus:border-brand"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={add} disabled={fresh.length === 0}>
            {fresh.length > 0
              ? `Add ${fresh.length} detected asset${fresh.length > 1 ? 's' : ''}`
              : 'Add detected assets'}
          </Button>
          <span className="text-sm text-ink-mute" aria-live="polite">
            {paste.trim() === ''
              ? 'Nothing detected yet'
              : `${preview.length} found, ${fresh.length} new, ${preview.length - fresh.length} already added`}
          </span>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="detected-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 id="detected-heading" className="font-display text-[1.3rem] text-ink">
            Detected assets
          </h2>
          <span className="tnum text-sm text-ink-mute">{assets.length} confirmed</span>
        </div>

        {assets.length === 0 ? (
          <p className="py-8 text-[0.95rem] text-ink-mute">
            None yet. Paste above, or continue without any links. The report will say clearly that
            presence scores rest on your answers alone.
          </p>
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
                  declared
                </span>
                <button
                  onClick={() => setAssets(assets.filter((x) => x.id !== a.id))}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-ink-mute hover:text-brand"
                  aria-label={`Remove ${a.url}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {assets.length > 0 && (
          <p className="mt-4 text-sm leading-relaxed text-ink-mute">
            This demonstration runs entirely in your browser, so these links are recorded as
            declared by you and are not opened. The report states this, and your confidence level
            reflects it.
          </p>
        )}
      </section>

      <section className="mt-12" aria-labelledby="context-heading">
        <h2 id="context-heading" className="font-display text-[1.3rem] text-ink">
          Tell the analysis what you actually do
        </h2>
        <p className="mt-2 text-[0.95rem] text-ink-soft">
          This text is read directly and is what the brand clarity score is built from.
        </p>

        <div className="mt-6 grid gap-5">
          <TextArea
            id="description"
            label="What does the business do?"
            hint="A few sentences is plenty."
            rows={3}
            value={context.description}
            onChange={(v) => setContext({ description: v })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              id="products"
              label="Main products or services"
              rows={2}
              value={context.productsServices}
              onChange={(v) => setContext({ productsServices: v })}
            />
            <TextArea
              id="customers"
              label="Who are your customers?"
              rows={2}
              value={context.targetCustomers}
              onChange={(v) => setContext({ targetCustomers: v })}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              id="location"
              label="Main location"
              rows={1}
              value={context.location}
              onChange={(v) => setContext({ location: v })}
            />
            <TextArea
              id="tagline"
              label="Tagline, if you have one"
              rows={1}
              value={context.tagline}
              onChange={(v) => setContext({ tagline: v })}
            />
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review and submit</Button>
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
