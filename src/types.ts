export type RespondentType = 'founder' | 'successor' | 'manager';

export type QuestionType =
  | 'single'      // radio cards, for qualitative choices with longer labels
  | 'multi'       // chips, capped selection
  | 'scale'       // 1-5 agreement buttons
  | 'slider'      // stepped slider across ordinal bands
  | 'segmented'   // compact segmented control for short option sets
  | 'select'      // dropdown, for lists too long to show as cards
  | 'text'
  | 'longtext';

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  section: SectionId;
  text: string;
  help?: string;
  type: QuestionType;
  options?: Option[];
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
  /** Shown only to these respondent types. Omitted means shown to all. */
  showFor?: RespondentType[];
  optional?: boolean;
  /** Adds a "Not sure" escape hatch to single-choice questions. */
  allowNotSure?: boolean;
  /** Offers "Prefer not to answer" beside a segmented control. */
  allowDecline?: boolean;
  /** Translation key for a footnote shown under the control. */
  note?: string;
}

export type SectionId =
  | 'profile'
  | 'business'
  | 'continuity'
  | 'succession'
  | 'ai'
  | 'digital'
  | 'barriers';

export interface Section {
  id: SectionId;
  name: string;
  blurb: string;
}

export type AnswerValue = string | string[] | number;

export type Answers = Record<string, AnswerValue>;

export interface Consents {
  research: boolean;
  reportEmail: boolean;
  futureComms: boolean;
  version: string;
  timestampIso: string | null;
}

export type AssetPlatform =
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'google_business'
  | 'shopee'
  | 'lazada'
  | 'grabfood'
  | 'foodpanda'
  | 'whatsapp'
  | 'directory'
  | 'other';

export interface DetectedAsset {
  id: string;
  platform: AssetPlatform;
  label: string;
  raw: string;
  url: string;
  /**
   * Demo build runs entirely in the browser, so no asset is fetched.
   * Everything the respondent supplies is recorded as 'declared'.
   */
  verification: 'declared' | 'reachable' | 'unreachable';
}

export interface BusinessContext {
  description: string;
  productsServices: string;
  targetCustomers: string;
  location: string;
  tagline: string;
}

export type Classification = 'fact' | 'inference' | 'recommendation' | 'limitation';

/** Generated text carries the key that produced it so the UI can translate it. */
export interface Localised {
  key: string;
  vars?: Record<string, string | number>;
}

export interface Finding {
  finding: string;
  finding_i18n?: Localised;
  evidence: string;
  evidence_i18n?: Localised[];
  classification: Classification;
}

export interface DimensionScore {
  dimension: string;
  key: string;
  evidence_i18n?: Localised[];
  score: number;
  confidence: 'low' | 'moderate' | 'good';
  evidence: string[];
}

export interface QuickWin {
  action: string;
  why: string;
  effort: string;
  key: string;
}

export interface AiOpportunity {
  opportunity: string;
  why: string;
  key: string;
  vars?: Record<string, string | number>;
}

export interface SuccessionReflection {
  founderDependence: Localised;
  documentation: Localised;
  successorClarity: Localised;
  note: Localised;
}

export interface Report {
  respondent_id: string;
  survey_version: string;
  report_version: string;
  scoring_version: string;
  scope: 'marketing_digital_presence';
  generated_at: string;
  assets_submitted: number;
  assets_reviewed: number;
  evidence_coverage: number;
  confidence_level: 'low' | 'moderate' | 'good';
  overall_score: number;
  readiness_band: string;
  readiness_band_key: string;
  dimension_scores: DimensionScore[];
  strengths: Finding[];
  gaps: Finding[];
  quick_wins: QuickWin[];
  ai_opportunities: AiOpportunity[];
  first_priority: string;
  first_priority_i18n: Localised;
  succession_reflection: SuccessionReflection;
  limitations: string[];
  limitations_i18n: Localised[];
  scope_notice: string;
}
