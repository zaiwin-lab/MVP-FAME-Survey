import { branding } from '../config/branding';
import { LanguageToggle, useI18n } from '../i18n';

export function Header({ onHome }: { onHome?: () => void }) {
  const { t } = useI18n();
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line-soft bg-white/88 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <button onClick={onHome} className="flex items-center gap-3 text-left" aria-label={t('nav.home')}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-deep text-[0.8rem] font-semibold text-white">
            FI
          </span>
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-semibold text-ink">{branding.convenor}</span>
            <span className="hidden text-[0.72rem] text-ink-mute sm:block">
              {t('nav.subtitle')}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-4">
          <PartnerMark />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

function PartnerMark() {
  const { t } = useI18n();
  if (!branding.saicApproved) {
    return <span className="hidden text-[0.72rem] text-ink-mute lg:block">{t('nav.pending')}</span>;
  }
  return (
    <span className="hidden items-center gap-2 text-[0.72rem] text-ink-soft lg:flex">
      <span className="h-4 w-px bg-line" aria-hidden="true" />
      {t('nav.collab')} {branding.partnerName}
    </span>
  );
}

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="no-print border-t border-line-soft bg-surface">
      <div className="shell pb-28 pt-10 sm:pb-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-[0.9rem] font-semibold text-ink">{branding.convenor}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {branding.saicApproved ? branding.partnerWording : t('footer.blurb')}
            </p>
            {!branding.saicApproved && (
              <p className="mt-3 text-xs text-ink-mute">{t('nav.pending')}</p>
            )}
          </div>
          <nav aria-label="Policies" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {['footer.privacy', 'footer.terms', 'footer.a11y'].map((k) => (
              <span key={k} className="text-ink-mute">
                {t(k)}
              </span>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs leading-relaxed text-ink-mute">{t('footer.demo')}</p>
            <p className="mt-3 text-xs text-ink-mute">
              &copy; {year} {branding.convenor}. {t('footer.rights')}
            </p>
          </div>
          <p className="shrink-0 text-xs text-ink-mute">
            {t('footer.credit')}{' '}
            <a
              href="https://www.kobisberhad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-link"
            >
              KOBIS Berhad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
