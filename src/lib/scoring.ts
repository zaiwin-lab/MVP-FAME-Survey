import type {
  AiOpportunity,
  Answers,
  BusinessContext,
  DetectedAsset,
  DimensionScore,
  Finding,
  Localised,
  QuickWin,
  Report,
  RespondentType,
  SuccessionReflection,
} from '../types';
import { REPORT_VERSION, SCORING_VERSION, SURVEY_VERSION } from '../config/branding';
import { DISCOVERY_PLATFORMS, platformLabel } from './magicbox';

/**
 * Deterministic scoring. The same inputs always produce the same report, and
 * every dimension carries the evidence it was built from. Nothing here invents
 * traffic, follower counts, rankings or competitor data: the only inputs are
 * the links the respondent declared, the text they wrote, and their answers.
 *
 * Generated prose is emitted twice: once as English (so the stored JSON reads
 * on its own) and once as a translation key the UI resolves. The engine itself
 * stays independent of the active language.
 */

export const BANDS = [
  { min: 80, key: 'ready', label: 'AI-Ready Marketing Presence' },
  { min: 65, key: 'competitive', label: 'Competitive' },
  { min: 50, key: 'developing', label: 'Developing' },
  { min: 30, key: 'emerging', label: 'Emerging' },
  { min: 0, key: 'foundation', label: 'Foundation Stage' },
] as const;

export function bandFor(score: number) {
  return BANDS.find((b) => score >= b.min)!;
}

const WEIGHTS: Record<string, number> = {
  digital_footprint: 0.16,
  brand_clarity: 0.14,
  discoverability: 0.16,
  channel_consistency: 0.1,
  conversion_readiness: 0.14,
  trust_signals: 0.1,
  content_presence: 0.1,
  ai_marketing_readiness: 0.1,
};

const DIMENSION_LABELS: Record<string, string> = {
  digital_footprint: 'Digital footprint',
  brand_clarity: 'Brand clarity',
  discoverability: 'Discoverability',
  channel_consistency: 'Channel consistency',
  conversion_readiness: 'Conversion readiness',
  trust_signals: 'Trust signals',
  content_presence: 'Content presence',
  ai_marketing_readiness: 'AI marketing readiness',
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Maps a 1-5 scale answer onto 0-100. Missing answers return null, not zero. */
function scalePct(answers: Answers, id: string): number | null {
  const v = answers[id];
  if (typeof v !== 'number') return null;
  return ((v - 1) / 4) * 100;
}

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

interface Ev {
  text: string;
  i18n: Localised;
}

const ev = (text: string, key: string, vars?: Localised['vars']): Ev => ({
  text,
  i18n: { key, vars },
});

interface Built {
  dim: DimensionScore;
  /** True when the score rests on a declared asset or supplied text, not only survey answers. */
  direct: boolean;
}

function build(key: string, score: number, evidence: Ev[], direct: boolean): Built {
  const confidence: DimensionScore['confidence'] =
    evidence.length === 0 ? 'low' : evidence.length < 2 ? 'moderate' : 'good';
  return {
    dim: {
      key,
      dimension: DIMENSION_LABELS[key],
      score: clamp(score),
      confidence,
      evidence: evidence.map((e) => e.text),
      evidence_i18n: evidence.map((e) => e.i18n),
    },
    direct,
  };
}

export interface ScoreInput {
  respondentType: RespondentType;
  answers: Answers;
  assets: DetectedAsset[];
  context: BusinessContext;
  respondentId: string;
}

export function generateReport(input: ScoreInput): Report {
  const { answers, assets, context, respondentId, respondentType } = input;
  const platforms = new Set(assets.map((a) => a.platform));
  const has = (p: string) => platforms.has(p as never);
  const built: Built[] = [];

  // 1. Digital footprint — how many places a customer could find you.
  {
    const covered = DISCOVERY_PLATFORMS.filter((p) => platforms.has(p));
    const extra = assets.length - covered.length;
    const score = covered.length * 21 + Math.min(extra, 4) * 4;
    const list = covered.map(platformLabel).join(', ');
    const e: Ev[] = [];
    if (covered.length) e.push(ev(`${list} declared`, 'ev.channels', { list }));
    if (extra > 0) e.push(ev(`${extra} further public links declared`, 'ev.extra', { n: extra }));
    built.push(build('digital_footprint', score, e, assets.length > 0));
  }

  // 2. Brand clarity — can a stranger tell what you sell and who for?
  {
    const desc = words(context.description);
    let score = 0;
    const e: Ev[] = [];
    if (desc >= 12) {
      score += 30;
      e.push(ev(`Business description supplied (${desc} words)`, 'ev.desc', { n: desc }));
    } else if (desc > 0) {
      score += 14;
      e.push(ev(`Short business description supplied (${desc} words)`, 'ev.descshort', { n: desc }));
    }
    if (words(context.productsServices) > 0) {
      score += 24;
      e.push(ev('Products or services stated', 'ev.products'));
    }
    if (words(context.targetCustomers) > 0) {
      score += 22;
      e.push(ev('Target customer stated', 'ev.customers'));
    }
    if (context.tagline.trim()) {
      score += 12;
      e.push(ev('Tagline supplied', 'ev.tagline'));
    }
    built.push(build('brand_clarity', score, e, e.length > 0));
  }

  // 3. Discoverability — local search and map presence.
  {
    let score = 0;
    const e: Ev[] = [];
    if (has('google_business')) {
      score += 40;
      e.push(ev('Google Business Profile or Maps link declared', 'ev.gbp'));
    }
    if (has('website')) {
      score += 25;
      e.push(ev('Website declared', 'ev.website'));
    }
    if (context.location.trim()) {
      score += 13;
      e.push(ev('Main location stated', 'ev.location'));
    }
    if (has('facebook') || has('instagram')) score += 10;
    built.push(build('discoverability', score, e, e.length > 0));
  }

  // 4. Channel consistency — presence spread across channels vs one island.
  {
    const named = assets.filter((a) => a.platform !== 'other').length;
    const unresolved = assets.filter((a) => a.platform === 'other').length;
    let score = named === 0 ? 0 : Math.min(named, 5) * 18;
    if (unresolved > 0) score -= Math.min(unresolved * 6, 18);
    const e: Ev[] = [];
    if (named) e.push(ev(`${named} identified channels`, 'ev.named', { n: named }));
    if (unresolved) {
      e.push(ev(`${unresolved} link or handle not yet assigned`, 'ev.unresolved', { n: unresolved }));
    }
    built.push(build('channel_consistency', score, e, assets.length > 0));
  }

  // 5. Conversion readiness — can an interested customer act?
  {
    let score = 0;
    const e: Ev[] = [];
    const market = has('shopee') || has('lazada') || has('grabfood') || has('foodpanda');
    if (has('whatsapp')) {
      score += 26;
      e.push(ev('Direct contact channel declared', 'ev.contact'));
    }
    if (market) {
      score += 30;
      e.push(ev('Transactional or marketplace channel declared', 'ev.market'));
    }
    if (has('website')) score += 18;
    const measured = scalePct(answers, 'measurement');
    if (measured !== null) {
      score += measured * 0.26;
      e.push(ev('Self-reported marketing measurement', 'ev.measure'));
    }
    built.push(build('conversion_readiness', score, e, has('whatsapp') || market));
  }

  // 6. Trust signals — longevity plus verifiable public presence.
  {
    let score = 0;
    const e: Ev[] = [];
    const yrs = answers['years_operating'];
    if (yrs === 'gt40' || yrs === '21_40') {
      score += 36;
      e.push(ev('Long trading history reported', 'ev.longhistory'));
    } else if (yrs === '11_20') {
      score += 26;
      e.push(ev('Established trading history reported', 'ev.history'));
    } else if (yrs === '3_10') {
      score += 16;
    }
    if (has('google_business')) {
      score += 30;
      e.push(ev('Public profile where customers can leave reviews', 'ev.reviews'));
    }
    if (has('website')) {
      score += 22;
      e.push(ev('Owned website rather than social pages alone', 'ev.owned'));
    }
    if (has('linkedin')) score += 8;
    built.push(build('trust_signals', score, e, has('google_business') || has('website')));
  }

  // 7. Content presence — channels that carry ongoing publishing.
  {
    const channels = (['facebook', 'instagram', 'tiktok', 'youtube'] as const).filter((p) =>
      platforms.has(p),
    );
    const list = channels.map(platformLabel).join(', ');
    const e: Ev[] = channels.length
      ? [ev(`Publishing channels declared: ${list}`, 'ev.publishing', { list })]
      : [];
    built.push(build('content_presence', channels.length * 25, e, channels.length > 0));
  }

  // 8. AI marketing readiness — capability to act on any of the above.
  {
    const fam = scalePct(answers, 'ai_familiarity');
    const skills = scalePct(answers, 'staff_skills');
    const areas = (answers['digital_areas'] as string[] | undefined) ?? [];
    const usesMarketing = areas.includes('marketing') || areas.includes('content');
    let score = 0;
    const e: Ev[] = [];
    if (fam !== null) {
      score += fam * 0.4;
      e.push(ev('Self-reported AI familiarity', 'ev.aifam'));
    }
    if (skills !== null) {
      score += skills * 0.35;
      e.push(ev('Self-reported team digital skills', 'ev.skills'));
    }
    if (usesMarketing) {
      score += 25;
      e.push(ev('Digital tools already used in marketing or content', 'ev.alreadymkt'));
    }
    built.push(build('ai_marketing_readiness', score, e, false));
  }

  const dimension_scores = built.map((b) => b.dim);
  const overall = clamp(
    dimension_scores.reduce((sum, d) => sum + d.score * (WEIGHTS[d.key] ?? 0), 0),
  );

  // Nothing is fetched in a browser-only build, so no declared asset is ever
  // confirmed. The production build replaces this with the real fetch count.
  const assetsReviewed = 0;
  const directCount = built.filter((b) => b.direct).length;
  const evidence_coverage = Math.round((directCount / built.length) * 100) / 100;
  const byCoverage: Report['confidence_level'] =
    evidence_coverage < 0.34 ? 'low' : evidence_coverage < 0.67 ? 'moderate' : 'good';
  // Confidence cannot read 'good' while no declared asset has actually been
  // opened and confirmed. Coverage measures breadth; verification measures depth.
  const confidence_level: Report['confidence_level'] =
    assets.length > assetsReviewed && byCoverage === 'good' ? 'moderate' : byCoverage;

  const ranked = [...dimension_scores].sort((a, b) => b.score - a.score);

  const toFinding = (d: DimensionScore, classification: Finding['classification']): Finding => ({
    finding: `${d.dimension} scored ${d.score} out of 100.`,
    finding_i18n: { key: 'rp.finding', vars: { dim: d.key, score: d.score } },
    evidence: d.evidence.length ? d.evidence.join('; ') : 'No supporting link or description was supplied for this area.',
    evidence_i18n: d.evidence_i18n?.length ? d.evidence_i18n : [{ key: 'ev.none' }],
    classification,
  });

  const strengths = ranked
    .filter((d) => d.evidence.length > 0)
    .slice(0, 3)
    .map((d) => toFinding(d, 'fact'));

  const gaps = [...ranked]
    .reverse()
    .slice(0, 3)
    .map((d) => toFinding(d, d.evidence.length ? 'inference' : 'limitation'));

  const lowest = ranked[ranked.length - 1];
  const band = bandFor(overall);

  const limitations_i18n: Localised[] = [{ key: 'lim.browser' }];
  const limitations = [
    'This demo runs entirely in your browser. Links you supply are recorded as declared and are not opened or independently verified.',
  ];
  if (assets.length === 0) {
    limitations.push('No public links were supplied, so presence scores rest on your answers alone.');
    limitations_i18n.push({ key: 'lim.nolinks' });
  }
  if (!context.description.trim()) {
    limitations.push('No business description was supplied, which limits the brand clarity reading.');
    limitations_i18n.push({ key: 'lim.nodesc' });
  }

  return {
    respondent_id: respondentId,
    survey_version: SURVEY_VERSION,
    report_version: REPORT_VERSION,
    scoring_version: SCORING_VERSION,
    scope: 'marketing_digital_presence',
    generated_at: new Date().toISOString(),
    assets_submitted: assets.length,
    assets_reviewed: assetsReviewed,
    evidence_coverage,
    confidence_level,
    overall_score: overall,
    readiness_band: band.label,
    readiness_band_key: band.key,
    dimension_scores,
    strengths,
    gaps,
    quick_wins: buildQuickWins(dimension_scores, platforms, context, answers),
    ai_opportunities: buildAiOpportunities(answers),
    ...firstPriority(lowest, platforms),
    succession_reflection: reflect(answers, respondentType),
    limitations,
    limitations_i18n,
    scope_notice:
      'This snapshot evaluates marketing and publicly visible digital presence based on the information and links supplied. It does not represent a complete assessment of financial, operational, legal, cybersecurity, leadership or organisational health.',
  };
}

function buildQuickWins(
  dims: DimensionScore[],
  platforms: Set<string>,
  context: BusinessContext,
  answers: Answers,
): QuickWin[] {
  const score = (k: string) => dims.find((d) => d.key === k)?.score ?? 0;
  const pool: (QuickWin & { rank: number })[] = [];
  const add = (rank: number, key: string, action: string, why: string, effort: string) =>
    pool.push({ rank, key, action, why, effort });

  // Every extra site is another place a customer can fail to find, so an
  // unclaimed map profile and mismatched details cost a multi-branch business
  // more than a single-site one.
  const multiSite = answers['branches'] !== undefined && answers['branches'] !== '1';

  if (!platforms.has('google_business')) {
    add(
      (multiSite ? 115 : 100) - score('discoverability'),
      'gbp',
      'Claim and complete your Google Business Profile.',
      'It is the first thing most customers see when they search your name or your trade in your area, and it is free.',
      'About 45 minutes, plus a postcard verification',
    );
  }
  if (!platforms.has('website')) {
    add(
      90 - score('digital_footprint'),
      'onepage',
      'Publish a single page with what you sell, where you are and how to contact you.',
      'Social pages can be lost or restricted. One page you own gives every other channel somewhere to point.',
      'Half a day',
    );
  }
  if (!context.targetCustomers.trim() || !context.productsServices.trim()) {
    add(
      88 - score('brand_clarity'),
      'oneliner',
      'Write one sentence naming who you serve and what you sell, and put it at the top of every channel.',
      'Your channels currently describe the business differently, so a first-time visitor has to work out the offer themselves.',
      'One hour',
    );
  }
  if (!platforms.has('whatsapp')) {
    add(
      80 - score('conversion_readiness'),
      'whatsapp',
      'Add a WhatsApp Business link to every profile so enquiries start in one tap.',
      'Interested customers drop off when the next step is unclear or requires typing a phone number.',
      'Under an hour',
    );
  }
  if (score('content_presence') < 50) {
    add(
      70 - score('content_presence'),
      'post3',
      'Post three pieces this week: a product, a customer result, and the people behind the business.',
      'Channels with no recent activity read as closed to customers checking whether you are still trading.',
      'Two hours total',
    );
  }
  if ((answers['measurement'] as number) <= 2) {
    add(
      65,
      'askhow',
      'Ask every new enquiry one question: how did you find us? Write the answers in a notebook.',
      'Without this you cannot tell which channel is worth your time, and every later decision is guesswork.',
      'Five minutes a day',
    );
  }
  add(
    multiSite ? 75 : 40,
    'nap',
    'Put the same business name, phone number and address on every channel, character for character.',
    'Search engines treat mismatched details as different businesses, which splits your visibility.',
    'One hour',
  );

  return pool
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 3)
    .map(({ rank: _rank, ...w }) => w);
}

function buildAiOpportunities(answers: Answers): AiOpportunity[] {
  const priority = answers['digital_priority'] as string | undefined;
  const sector = (answers['sector'] as string | undefined) ?? 'other';
  const byPriority: Record<string, AiOpportunity> = {
    marketing: {
      key: 'marketing',
      opportunity: 'Draft a month of posts in one sitting from your own product photos and notes.',
      why: 'Marketing was the area you said has the most to gain, and drafting is where most of the time goes.',
    },
    service: {
      key: 'service',
      opportunity: 'Write standard replies for your ten most common customer questions, then keep them to hand.',
      why: 'Customer service was your priority area, and repeated questions are the cheapest thing to systematise.',
    },
    sales: {
      key: 'sales',
      opportunity: 'Turn your quotation format into a fill-in template so quotes go out the same day.',
      why: 'You named sales and quotations as the biggest opportunity, and quote delay is a common reason deals go cold.',
    },
    ecommerce: {
      key: 'ecommerce',
      opportunity: 'Rewrite your marketplace listing titles and descriptions around what customers actually search for.',
      why: 'You named online selling as the priority, and listing text is what decides whether you appear at all.',
    },
    inventory: {
      key: 'inventory',
      opportunity: 'Summarise your stock movement into a weekly one-page reorder list.',
      why: 'You named stock as the priority, and reorder timing is where the money is usually tied up.',
    },
    finance: {
      key: 'finance',
      opportunity: 'Produce a plain-language monthly summary from your existing accounts.',
      why: 'You named finance as the priority, and a readable monthly picture is what makes decisions faster.',
    },
    operations: {
      key: 'operations',
      opportunity: 'Write down your three most repeated daily procedures so anyone can follow them.',
      why: 'You named operations as the priority, and written procedures are what let you step away from the business.',
    },
    reporting: {
      key: 'reporting',
      opportunity: 'Build one weekly page showing sales, enquiries and stock in the same place.',
      why: 'You named reporting as the priority, and a single view removes the weekly assembly work.',
    },
  };

  const first: AiOpportunity = (priority ? byPriority[priority] : undefined) ?? {
    key: 'default',
    opportunity:
      'Draft your customer-facing copy from your own notes rather than starting from a blank page.',
    why: 'It is the lowest-risk place to start, because you review everything before it is published.',
  };

  const second: AiOpportunity = {
    key: 'reviews',
    vars: { sector },
    opportunity:
      'Summarise what customers say about businesses like yours, then fix the two complaints you can control.',
    why: 'Public reviews of comparable businesses are already written. Reading them systematically costs nothing and points at real gaps.',
  };

  return [first, second];
}

function firstPriority(lowest: DimensionScore, platforms: Set<string>) {
  if (!platforms.has('google_business')) {
    return {
      first_priority:
        'Claim your Google Business Profile. Until customers can find you on the map with correct hours and a phone number, improvements everywhere else reach fewer people.',
      first_priority_i18n: { key: 'fp.gbp' },
    };
  }
  if (!platforms.has('website')) {
    return {
      first_priority:
        'Publish one page you own. Every other channel needs somewhere to send a serious customer, and right now there is nowhere to point.',
      first_priority_i18n: { key: 'fp.website' },
    };
  }
  return {
    first_priority: `Start with ${lowest.dimension.toLowerCase()}. It is your lowest-scoring area at ${lowest.score} out of 100, and improving it lifts the value of the channels you already run.`,
    first_priority_i18n: { key: 'fp.lowest', vars: { dim: lowest.key, score: lowest.score } },
  };
}

function reflect(answers: Answers, type: RespondentType): SuccessionReflection {
  const dep = answers['founder_dependence'] as number | undefined;
  const doc = answers['documented'] as number | undefined;
  const plan = answers['continuity_plan'] as string | undefined;

  const founderDependence: Localised =
    dep === undefined
      ? { key: 'sr.na' }
      : dep >= 4
        ? { key: 'sr.dep.high' }
        : dep === 3
          ? { key: 'sr.dep.mid' }
          : { key: 'sr.dep.low' };

  const documentation: Localised =
    doc === undefined
      ? { key: 'sr.na' }
      : doc <= 2
        ? { key: 'sr.doc.low' }
        : doc === 3
          ? { key: 'sr.doc.mid' }
          : { key: 'sr.doc.high' };

  const successorClarity: Localised =
    type === 'successor'
      ? answers['successor_intent'] === 'yes_committed'
        ? { key: 'sr.suc.committed' }
        : answers['successor_intent'] === 'no'
          ? { key: 'sr.suc.declined' }
          : { key: 'sr.suc.undecided' }
      : answers['successor_identified'] === 'yes_confirmed'
        ? { key: 'sr.id.confirmed' }
        : answers['successor_identified'] === 'yes_assumed'
          ? { key: 'sr.id.assumed' }
          : answers['successor_identified'] === 'no'
            ? { key: 'sr.id.none' }
            : { key: 'sr.id.candidate' };

  const note: Localised =
    plan === 'yes_written'
      ? { key: 'sr.plan.written' }
      : plan === 'informal'
        ? { key: 'sr.plan.informal' }
        : { key: 'sr.plan.none' };

  return { founderDependence, documentation, successorClarity, note };
}
