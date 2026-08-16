import { Button, Eyebrow, Note } from '../components/ui';
import { branding, CONSENT_VERSION } from '../config/branding';
import type { Consents } from '../types';

const INFO: [string, string][] = [
  ['Purpose', 'To describe how prepared Sarawak businesses are for leadership succession and for AI adoption, and to give each participant an immediate view of their own digital presence.'],
  ['Who is organising it', `${branding.convenor}, as a research and awareness initiative.`],
  ['What is collected', 'Your role, business profile, and views on continuity, succession, AI and digital adoption. Public business links only if you choose to add them.'],
  ['How long it takes', 'About 7 to 10 minutes, plus a few minutes if you use the AI Magic Box.'],
  ['How findings are used', 'Public reporting is aggregated. No individual business is identified in any published output.'],
  ['Your control', 'You can stop at any point before submitting. Nothing is recorded until you submit.'],
];

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
  const stamp = (p: Partial<Consents>) =>
    setConsents({ ...p, timestampIso: new Date().toISOString(), version: CONSENT_VERSION });

  return (
    <div className="shell max-w-3xl py-12 md:py-16">
      <Eyebrow>Before you begin</Eyebrow>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.7rem)] leading-tight">
        Survey information and consent
      </h1>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        {INFO.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <dt className="text-[0.9rem] font-medium text-ink">{k}</dt>
            <dd className="text-[0.95rem] leading-relaxed text-ink-soft">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <Note tone="warn">
          Only ever submit public links and public business information. Never enter passwords,
          private dashboards, customer records, confidential documents or financial account
          details.
        </Note>
      </div>

      <fieldset className="mt-10">
        <legend className="font-display text-[1.25rem] text-ink">Your choices</legend>
        <p className="mt-2 text-sm text-ink-mute">
          These are recorded separately. Asking for your report does not sign you up to anything
          else.
        </p>

        <div className="mt-6 space-y-3">
          <Checkbox
            id="consent-research"
            checked={consents.research}
            onChange={(v) => stamp({ research: v })}
            required
            label="I have read the survey information and voluntarily agree to participate in this research and awareness initiative."
          />
          <Checkbox
            id="consent-report"
            checked={consents.reportEmail}
            onChange={(v) => stamp({ reportEmail: v })}
            label="I would like a copy of my Marketing and Digital Presence Readiness Snapshot sent to my email."
            hint="Optional"
          />
          <Checkbox
            id="consent-comms"
            checked={consents.futureComms}
            onChange={(v) => stamp({ futureComms: v })}
            label={`I agree to receive future educational insights, business-awareness materials and programme information from ${branding.convenor}.`}
            hint="Optional and entirely separate from the report"
          />
        </div>
      </fieldset>

      <p className="mt-6 text-xs text-ink-mute">
        Consent version {CONSENT_VERSION}. Each choice is stored with its own timestamp.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!consents.research}>
          Agree and continue
        </Button>
        {!consents.research && (
          <span className="text-sm text-ink-mute">The first box is required to continue.</span>
        )}
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
  required,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  required?: boolean;
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
        {(hint || required) && (
          <span className="mt-1 block text-xs text-ink-mute">{required ? 'Required' : hint}</span>
        )}
      </span>
    </label>
  );
}
