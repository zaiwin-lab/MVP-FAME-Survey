import type {
  AiOpportunity,
  Answers,
  BusinessContext,
  DetectedAsset,
  DimensionScore,
  Finding,
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
 */

export const BANDS = [
  { min: 80, label: 'AI-Ready Marketing Presence' },
  { min: 65, label: 'Competitive' },
  { min: 50, label: 'Developing' },
  { min: 30, label: 'Emerging' },
  { min: 0, label: 'Foundation Stage' },
] as const;

export function bandFor(score: number): string {
  return BANDS.find((b) => score >= b.min)!.label;
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

interface Built {
  dim: DimensionScore;
  /** True when the score rests on a declared asset or supplied text, not only survey answers. */
  direct: boolean;
}

function build(
  key: string,
  dimension: string,
  score: number,
  evidence: string[],
  direct: boolean,
): Built {
  const confidence: DimensionScore['confidence'] =
    evidence.length === 0 ? 'low' : evidence.length < 2 ? 'moderate' : 'good';
  return {
    dim: { key, dimension, score: clamp(score), confidence, evidence },
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
    const evidence = covered.length
      ? [`${covered.map(platformLabel).join(', ')} declared`]
      : [];
    if (extra > 0) evidence.push(`${extra} further public link${extra > 1 ? 's' : ''} declared`);
    built.push(
      build('digital_footprint', 'Digital footprint', score, evidence, assets.length > 0),
    );
  }

  // 2. Brand clarity — can a stranger tell what you sell and who for?
  {
    const desc = words(context.description);
    const prod = words(context.productsServices);
    const cust = words(context.targetCustomers);
    let score = 0;
    const evidence: string[] = [];
    if (desc >= 12) {
      score += 30;
      evidence.push(`Business description supplied (${desc} words)`);
    } else if (desc > 0) {
      score += 14;
      evidence.push(`Short business description supplied (${desc} words)`);
    }
    if (prod > 0) {
      score += 24;
      evidence.push('Products or services stated');
    }
    if (cust > 0) {
      score += 22;
      evidence.push('Target customer stated');
    }
    if (context.tagline.trim()) {
      score += 12;
      evidence.push('Tagline supplied');
    }
    built.push(build('brand_clarity', 'Brand clarity', score, evidence, evidence.length > 0));
  }

  // 3. Discoverability — local search and map presence.
  {
    let score = 0;
    const evidence: string[] = [];
    if (has('google_business')) {
      score += 40;
      evidence.push('Google Business Profile or Maps link declared');
    }
    if (has('website')) {
      score += 25;
      evidence.push('Website declared');
    }
    if (context.location.trim()) {
      score += 13;
      evidence.push('Main location stated');
    }
    if (has('facebook') || has('instagram')) score += 10;
    built.push(build('discoverability', 'Discoverability', score, evidence, evidence.length > 0));
  }

  // 4. Channel consistency — presence spread across channels vs one island.
  {
    const named = assets.filter((a) => a.platform !== 'other').length;
    const unresolved = assets.filter((a) => a.platform === 'other').length;
    let score = named === 0 ? 0 : Math.min(named, 5) * 18;
    if (unresolved > 0) score -= Math.min(unresolved * 6, 18);
    const evidence: string[] = [];
    if (named) evidence.push(`${named} identified channel${named > 1 ? 's' : ''}`);
    if (unresolved) evidence.push(`${unresolved} link or handle not yet assigned to a platform`);
    built.push(
      build('channel_consistency', 'Channel consistency', score, evidence, assets.length > 0),
    );
  }

  // 5. Conversion readiness — can an interested customer act?
  {
    let score = 0;
    const evidence: string[] = [];
    if (has('whatsapp')) {
      score += 26;
      evidence.push('Direct contact channel declared');
    }
    if (has('shopee') || has('lazada') || has('grabfood') || has('foodpanda')) {
      score += 30;
      evidence.push('Transactional or marketplace channel declared');
    }
    if (has('website')) score += 18;
    const measured = scalePct(answers, 'measurement');
    if (measured !== null) {
      score += measured * 0.26;
      evidence.push('Self-reported marketing measurement');
    }
    built.push(
      build(
        'conversion_readiness',
        'Conversion readiness',
        score,
        evidence,
        has('whatsapp') || has('shopee') || has('lazada') || has('grabfood') || has('foodpanda'),
      ),
    );
  }

  // 6. Trust signals — longevity plus verifiable public presence.
  {
    let score = 0;
    const evidence: string[] = [];
    const yrs = answers['years_operating'];
    if (yrs === 'gt40' || yrs === '21_40') {
      score += 36;
      evidence.push('Long trading history reported');
    } else if (yrs === '11_20') {
      score += 26;
      evidence.push('Established trading history reported');
    } else if (yrs === '3_10') {
      score += 16;
    }
    if (has('google_business')) {
      score += 30;
      evidence.push('Public profile where customers can leave reviews');
    }
    if (has('website')) {
      score += 22;
      evidence.push('Owned website rather than social pages alone');
    }
    if (has('linkedin')) score += 8;
    built.push(build('trust_signals', 'Trust signals', score, evidence, has('google_business') || has('website')));
  }

  // 7. Content presence — channels that carry ongoing publishing.
  {
    const contentChannels = (['facebook', 'instagram', 'tiktok', 'youtube'] as const).filter((p) =>
      platforms.has(p),
    );
    const score = contentChannels.length * 25;
    const evidence = contentChannels.length
      ? [`Publishing channels declared: ${contentChannels.map(platformLabel).join(', ')}`]
      : [];
    built.push(
      build('content_presence', 'Content presence', score, evidence, contentChannels.length > 0),
    );
  }

  // 8. AI marketing readiness — capability to act on any of the above.
  {
    const fam = scalePct(answers, 'ai_familiarity');
    const skills = scalePct(answers, 'staff_skills');
    const areas = (answers['digital_areas'] as string[] | undefined) ?? [];
    const usesMarketing = areas.includes('marketing') || areas.includes('content');
    let score = 0;
    const evidence: string[] = [];
    if (fam !== null) {
      score += fam * 0.4;
      evidence.push('Self-reported AI familiarity');
    }
    if (skills !== null) {
      score += skills * 0.35;
      evidence.push('Self-reported team digital skills');
    }
    if (usesMarketing) {
      score += 25;
      evidence.push('Digital tools already used in marketing or content');
    }
    built.push(build('ai_marketing_readiness', 'AI marketing readiness', score, evidence, false));
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
  // Confidence cannot read 'good' while no declared asset has actually been
  // opened and confirmed. Coverage measures breadth; verification measures depth.
  const byCoverage: Report['confidence_level'] =
    evidence_coverage < 0.34 ? 'low' : evidence_coverage < 0.67 ? 'moderate' : 'good';
  const confidence_level: Report['confidence_level'] =
    assets.length > assetsReviewed && byCoverage === 'good' ? 'moderate' : byCoverage;

  const ranked = [...dimension_scores].sort((a, b) => b.score - a.score);
  const strengths: Finding[] = ranked
    .filter((d) => d.evidence.length > 0)
    .slice(0, 3)
    .map((d) => ({
      finding: `${d.dimension} scored ${d.score} out of 100.`,
      evidence: d.evidence.join('; '),
      classification: 'fact',
    }));

  const gaps: Finding[] = [...ranked]
    .reverse()
    .slice(0, 3)
    .map((d) => ({
      finding: `${d.dimension} scored ${d.score} out of 100.`,
      evidence: d.evidence.length
        ? d.evidence.join('; ')
        : 'No supporting link or description was supplied for this area.',
      classification: d.evidence.length ? 'inference' : 'limitation',
    }));

  const quick_wins = buildQuickWins(dimension_scores, platforms, context, answers);
  const ai_opportunities = buildAiOpportunities(answers);
  const lowest = ranked[ranked.length - 1];

  const limitations: string[] = [
    'This demo runs entirely in your browser. Links you supply are recorded as declared and are not opened or independently verified.',
  ];
  if (assets.length === 0) {
    limitations.push('No public links were supplied, so presence scores rest on your answers alone.');
  }
  if (!context.description.trim()) {
    limitations.push('No business description was supplied, which limits the brand clarity reading.');
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
    readiness_band: bandFor(overall),
    dimension_scores,
    strengths,
    gaps,
    quick_wins,
    ai_opportunities,
    first_priority: firstPriority(lowest, platforms),
    succession_reflection: reflect(answers, respondentType),
    limitations,
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

  if (!platforms.has('google_business')) {
    pool.push({
      rank: 100 - score('discoverability'),
      action: 'Claim and complete your Google Business Profile.',
      why: 'It is the first thing most customers see when they search your name or your trade in your area, and it is free.',
      effort: 'About 45 minutes, plus a postcard verification',
    });
  }
  if (!platforms.has('website')) {
    pool.push({
      rank: 90 - score('digital_footprint'),
      action: 'Publish a single page with what you sell, where you are and how to contact you.',
      why: 'Social pages can be lost or restricted. One page you own gives every other channel somewhere to point.',
      effort: 'Half a day',
    });
  }
  if (!context.targetCustomers.trim() || !context.productsServices.trim()) {
    pool.push({
      rank: 88 - score('brand_clarity'),
      action: 'Write one sentence naming who you serve and what you sell, and put it at the top of every channel.',
      why: 'Your channels currently describe the business differently, so a first-time visitor has to work out the offer themselves.',
      effort: 'One hour',
    });
  }
  if (!platforms.has('whatsapp')) {
    pool.push({
      rank: 80 - score('conversion_readiness'),
      action: 'Add a WhatsApp Business link to every profile so enquiries start in one tap.',
      why: 'Interested customers drop off when the next step is unclear or requires typing a phone number.',
      effort: 'Under an hour',
    });
  }
  if (score('content_presence') < 50) {
    pool.push({
      rank: 70 - score('content_presence'),
      action: 'Post three pieces this week: a product, a customer result, and the people behind the business.',
      why: 'Channels with no recent activity read as closed to customers checking whether you are still trading.',
      effort: 'Two hours total',
    });
  }
  if ((answers['measurement'] as number) <= 2) {
    pool.push({
      rank: 65,
      action: 'Ask every new enquiry one question: how did you find us? Write the answers in a notebook.',
      why: 'Without this you cannot tell which channel is worth your time, and every later decision is guesswork.',
      effort: 'Five minutes a day',
    });
  }
  pool.push({
    rank: 40,
    action: 'Put the same business name, phone number and address on every channel, character for character.',
    why: 'Search engines treat mismatched details as different businesses, which splits your visibility.',
    effort: 'One hour',
  });

  return pool.sort((a, b) => b.rank - a.rank).slice(0, 3).map(({ rank: _rank, ...w }) => w);
}

function buildAiOpportunities(answers: Answers): AiOpportunity[] {
  const priority = answers['digital_priority'] as string | undefined;
  const sector = (answers['sector'] as string | undefined) ?? 'your sector';
  const byPriority: Record<string, AiOpportunity> = {
    marketing: {
      opportunity: 'Draft a month of posts in one sitting from your own product photos and notes.',
      why: 'Marketing was the area you said has the most to gain, and drafting is where most of the time goes.',
    },
    service: {
      opportunity: 'Write standard replies for your ten most common customer questions, then keep them to hand.',
      why: 'Customer service was your priority area, and repeated questions are the cheapest thing to systematise.',
    },
    sales: {
      opportunity: 'Turn your quotation format into a fill-in template so quotes go out the same day.',
      why: 'You named sales and quotations as the biggest opportunity, and quote delay is a common reason deals go cold.',
    },
    ecommerce: {
      opportunity: 'Rewrite your marketplace listing titles and descriptions around what customers actually search for.',
      why: 'You named online selling as the priority, and listing text is what decides whether you appear at all.',
    },
    inventory: {
      opportunity: 'Summarise your stock movement into a weekly one-page reorder list.',
      why: 'You named stock as the priority, and reorder timing is where the money is usually tied up.',
    },
    finance: {
      opportunity: 'Produce a plain-language monthly summary from your existing accounts.',
      why: 'You named finance as the priority, and a readable monthly picture is what makes decisions faster.',
    },
    operations: {
      opportunity: 'Write down your three most repeated daily procedures so anyone can follow them.',
      why: 'You named operations as the priority, and written procedures are what let you step away from the business.',
    },
    reporting: {
      opportunity: 'Build one weekly page showing sales, enquiries and stock in the same place.',
      why: 'You named reporting as the priority, and a single view removes the weekly assembly work.',
    },
  };

  const first: AiOpportunity = (priority ? byPriority[priority] : undefined) ?? {
    opportunity:
      'Draft your customer-facing copy from your own notes rather than starting from a blank page.',
    why: 'It is the lowest-risk place to start, because you review everything before it is published.',
  };

  const second: AiOpportunity = {
    opportunity: `Summarise what customers say about businesses like yours in ${sector.toLowerCase()}, then fix the two complaints you can control.`,
    why: 'Public reviews of comparable businesses are already written. Reading them systematically costs nothing and points at real gaps.',
  };

  return [first, second];
}

function firstPriority(lowest: DimensionScore, platforms: Set<string>): string {
  if (!platforms.has('google_business')) {
    return 'Claim your Google Business Profile. Until customers can find you on the map with correct hours and a phone number, improvements everywhere else reach fewer people.';
  }
  if (!platforms.has('website')) {
    return 'Publish one page you own. Every other channel needs somewhere to send a serious customer, and right now there is nowhere to point.';
  }
  return `Start with ${lowest.dimension.toLowerCase()}. It is your lowest-scoring area at ${lowest.score} out of 100, and improving it lifts the value of the channels you already run.`;
}

function reflect(answers: Answers, type: RespondentType): SuccessionReflection {
  const dep = answers['founder_dependence'] as number | undefined;
  const doc = answers['documented'] as number | undefined;
  const thirty = answers['thirty_days'] as string | undefined;
  const plan = answers['continuity_plan'] as string | undefined;

  const founderDependence =
    dep === undefined
      ? 'Not answered.'
      : dep >= 4
        ? 'High. You reported that decisions concentrate on one person, and that the business would struggle without them.'
        : dep === 3
          ? 'Moderate. Some decisions are shared, but key ones still route to one person.'
          : 'Low. Decision-making appears distributed across more than one person.';

  const documentation =
    doc === undefined
      ? 'Not answered.'
      : doc <= 2
        ? `Limited. Little is written down, and ${
            thirty === 'no' ? 'you said the business could not run 30 days without its key person' : 'knowledge sits mainly with individuals'
          }.`
        : doc === 3
          ? 'Partial. Some processes are recorded, others live in people’s heads.'
          : 'Good. Processes are largely written down and could be followed by someone new.';

  const successorClarity =
    type === 'successor'
      ? answers['successor_intent'] === 'yes_committed'
        ? 'You have said you are committed to leading the business.'
        : answers['successor_intent'] === 'no'
          ? 'You have said you would rather not lead the business. That is worth an open conversation with the founder.'
          : 'Your intention to lead is not yet settled, which is common and worth discussing openly.'
      : answers['successor_identified'] === 'yes_confirmed'
        ? 'A successor has been identified and agreed openly.'
        : answers['successor_identified'] === 'yes_assumed'
          ? 'You have a successor in mind, but you indicated it has not been discussed with them.'
          : answers['successor_identified'] === 'no'
            ? 'No successor has been identified yet.'
            : 'A possible candidate exists, but nothing has been decided.';

  const note =
    plan === 'yes_written'
      ? 'You reported a written continuity plan already in place, which puts you ahead of most businesses of your size.'
      : plan === 'informal'
        ? 'You reported an informal understanding rather than a written plan. Writing down the current one is usually a single afternoon.'
        : 'You reported no continuity plan. The first version does not need a lawyer: who decides what, and who holds which relationships, is enough to start.';

  return { founderDependence, documentation, successorClarity, note };
}
