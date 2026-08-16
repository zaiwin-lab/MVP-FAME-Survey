import { Button, Eyebrow, Note } from '../components/ui';
import { branding, CONSENT_VERSION } from '../config/branding';
import { useI18n } from '../i18n';
import type { Consents } from '../types';

const INFO = ['1', '2', '3', '4', '5', '6'];

export function Consent({
  consents,
  setConsents,
  onBack,
  onNext,
}: {
  consents: Consents;
  setConsents: (p: Partial<Consents>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();

  const stamp = (p: Partial<Consents>) =>
    setConsents({ ...p, timestampIso: new Date().toISOString(), version: CONSENT_VERSION });

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>{t('con.eyebrow')}</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">{t('con.h1')}</h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        {INFO.map((n) => (
          <div key={n} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="text-[0.9rem] font-medium text-ink">{t(`con.k${n}`)}</dt>
            <dd className="text-[0.95rem] leading-relaxed text-ink-soft">
              {n === '2' ? `${branding.convenor}, ${t('con.v2')}` : t(`con.v${n}`)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <Note tone="warn">{t('con.warn')}</Note>
      </div>

      <fieldset className="mt-10">
        <legend className="font-display text-[1.25rem] text-ink">{t('con.legend')}</legend>
        <p className="mt-2 text-sm text-ink-mute">{t('con.legend.sub')}</p>

        <div className="mt-6 space-y-3">
          <Checkbox
            id="consent-research"
            checked={consents.research}
            onChange={(v) => stamp({ research: v })}
            label={t('con.c1')}
            hint={t('con.required')}
          />
          <Checkbox
            id="consent-report"
            checked={consents.reportEmail}
            onChange={(v) => stamp({ reportEmail: v })}
            label={t('con.c2')}
            hint={t('con.optional')}
          />
          <Checkbox
            id="consent-comms"
            checked={consents.futureComms}
            onChange={(v) => stamp({ futureComms: v })}
            label={`${t('con.c3')} ${branding.convenor}.`}
            hint={t('con.c3.hint')}
          />
        </div>
      </fieldset>

      <p className="mt-6 text-xs text-ink-mute">
        {t('con.version')} {CONSENT_VERSION}. {t('con.stamped')}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          {t('btn.back')}
        </Button>
        <Button onClick={onNext} disabled={!consents.research}>
          {t('btn.agree')}
        </Button>
        {!consents.research && <span className="text-sm text-ink-mute">{t('con.needfirst')}</span>}
      </div>
    </div>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors ${
        checked ? 'border-brand bg-brand-tint' : 'border-line bg-white hover:border-brand/50'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(0.5_0.145_250)]"
      />
      <span>
        <span className="block text-[0.95rem] leading-relaxed text-ink">{label}</span>
        <span className="mt-1 block text-xs text-ink-mute">{hint}</span>
      </span>
    </label>
  );
}
