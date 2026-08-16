import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { branding } from '../config/branding';

const FAQ_KEYS = ['1', '2', '3', '4', '5'];

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none">
      <path d="M12 2v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.4" fill="currentColor" />
      <rect
        x="3.2"
        y="5.6"
        width="17.6"
        height="13"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="9" cy="12" r="1.6" fill="currentColor" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" />
      <path d="M9.5 15.8h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M1.6 10.5v3.5M22.4 10.5v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.38-1.99-1.23-.74-.65-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.62 4.15 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/**
 * Two persistent bubbles: an AI helper on the left and WhatsApp on the right.
 * `lifted` raises them clear of the survey's sticky action bar.
 */
export function FloatingBubbles({ lifted }: { lifted: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const offset = lifted ? 'bottom-24 sm:bottom-24' : 'bottom-5';
  const waHref = `https://wa.me/${branding.whatsappNumber}?text=${encodeURIComponent(t('fab.wa.msg'))}`;

  return (
    <div className="no-print">
      {/* Left: AI assistant */}
      <div className={`fixed left-4 z-40 sm:left-5 ${offset} transition-[bottom] duration-300`}>
        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('fab.ai.title')}
            className="anim-rise absolute bottom-16 left-0 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_44px_-12px_rgba(16,32,64,.32)]"
          >
            <div className="bg-brand-deep px-4 py-3.5 text-white">
              <p className="text-[0.95rem] font-semibold">{t('fab.ai.title')}</p>
              <p className="mt-0.5 text-xs text-white/75">{t('fab.ai.sub')}</p>
            </div>
            <div className="max-h-[min(24rem,55vh)] overflow-y-auto p-2">
              {FAQ_KEYS.map((k) => {
                const isOpen = active === k;
                return (
                  <div key={k} className="border-b border-line-soft last:border-0">
                    <button
                      onClick={() => setActive(isOpen ? null : k)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 px-2 py-3 text-left text-[0.9rem] font-medium text-ink hover:text-brand"
                    >
                      {t(`faq.q${k}`)}
                      <span
                        aria-hidden="true"
                        className={`shrink-0 text-ink-mute transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <p className="px-2 pb-3.5 text-[0.87rem] leading-relaxed text-ink-soft">
                        {t(`faq.a${k}`)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="border-t border-line bg-surface px-4 py-2.5 text-[0.72rem] leading-relaxed text-ink-mute">
              {t('fab.ai.demo')}
            </p>
          </div>
        )}

        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t('fab.ai.close') : t('fab.ai.open')}
          className="group flex h-14 items-center gap-2.5 rounded-full bg-brand pl-4 pr-4 text-white shadow-[0_10px_26px_-8px_rgba(16,48,94,.7)] transition-[transform,background-color] duration-200 hover:bg-brand-deep active:scale-95 sm:pr-5"
        >
          <span className="relative">
            <RobotIcon />
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan ring-2 ring-brand group-hover:ring-brand-deep"
              aria-hidden="true"
            />
          </span>
          <span className="hidden text-[0.82rem] font-semibold sm:block">{t('fab.ai')}</span>
        </button>
      </div>

      {/* Right: WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('fab.wa')}
        className={`fixed right-4 z-40 flex h-14 items-center gap-2.5 rounded-full pl-4 pr-4 text-white shadow-[0_10px_26px_-8px_rgba(18,140,70,.7)] transition-[transform,background-color] duration-200 hover:bg-[#1fbd5a] active:scale-95 sm:right-5 sm:pr-5 ${offset}`}
        style={{ backgroundColor: '#25D366' }}
      >
        <WhatsAppIcon />
        <span className="hidden text-[0.82rem] font-semibold sm:block">{t('fab.wa')}</span>
      </a>
    </div>
  );
}
