/**
 * Partner branding is off by default and stays off until FAME confirms written
 * approval from SAIC. In the production build this resolves from a server-side
 * setting; in this demo it is a build-time flag so nothing about an unapproved
 * partnership can be revealed by reading the bundle. No SAIC logo file is
 * committed to this repository.
 */
const flag = import.meta.env.VITE_SAIC_APPROVED;

/**
 * WhatsApp destination for the floating bubble. The default is a deliberately
 * invalid placeholder so a demo build can never dial a real stranger's line.
 * Set VITE_WHATSAPP_NUMBER (country code, digits only) before showing it live.
 */
const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '60000000000';

export const branding = {
  convenor: 'FAME International College',
  whatsappNumber: whatsapp,
  whatsappConfigured: whatsapp !== '60000000000',
  saicApproved: flag === 'true',
  /** Shown while approval is outstanding. Makes no endorsement claim. */
  pendingNotice: 'Strategic partnership invitation in progress',
  partnerName: 'Sarawak Artificial Intelligence Centre (SAIC) Sdn. Bhd.',
  partnerWording:
    'An awareness and knowledge collaboration supporting greater understanding of business succession and AI readiness among Sarawak enterprises.',
} as const;

export const SURVEY_VERSION = '2026.1-demo';
export const CONSENT_VERSION = '1.0';
export const SCORING_VERSION = '1.0.0-demo';
export const REPORT_VERSION = '1.0.0-demo';
