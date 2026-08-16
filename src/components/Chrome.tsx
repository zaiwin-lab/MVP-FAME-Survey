import { branding } from '../config/branding';

export function Header({ onHome }: { onHome?: () => void }) {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line-soft bg-white/88 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <button
          onClick={onHome}
          className="flex items-center gap-3 text-left"
          aria-label="Return to the start"
        >
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-deep text-[0.8rem] font-semibold text-white">
            FI
          </span>
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-semibold text-ink">
              {branding.convenor}
            </span>
            <span className="block text-[0.72rem] text-ink-mute">
              Succession &amp; AI Readiness Survey 2026
            </span>
          </span>
        </button>
        <PartnerMark />
      </div>
    </header>
  );
}

function PartnerMark() {
  if (!branding.saicApproved) {
    return (
      <span className="hidden text-[0.72rem] text-ink-mute sm:block">
        {branding.pendingNotice}
      </span>
    );
  }
  return (
    <span className="hidden items-center gap-2 text-[0.72rem] text-ink-soft sm:flex">
      <span className="h-4 w-px bg-line" aria-hidden="true" />
      In collaboration with {branding.partnerName}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="no-print border-t border-line-soft bg-surface">
      <div className="shell py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-[0.9rem] font-semibold text-ink">{branding.convenor}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {branding.saicApproved
                ? branding.partnerWording
                : 'A research and awareness initiative on business succession and AI readiness among Sarawak enterprises.'}
            </p>
            {!branding.saicApproved && (
              <p className="mt-3 text-xs text-ink-mute">{branding.pendingNotice}</p>
            )}
          </div>
          <nav aria-label="Policies" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {['Privacy notice', 'Terms of participation', 'Accessibility statement'].map((l) => (
              <span key={l} className="text-ink-mute">
                {l}
              </span>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-ink-mute">
          Demonstration build. Responses are stored only in this browser and are not transmitted
          anywhere. Individual answers stay private; public findings are reported in aggregate only.
        </p>
      </div>
    </footer>
  );
}
