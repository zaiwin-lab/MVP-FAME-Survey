import type { Question, Section, RespondentType } from '../types';

export const SECTIONS: Section[] = [
  { id: 'profile', name: 'About you', blurb: 'Your role and experience' },
  { id: 'business', name: 'The business', blurb: 'Sector, size and structure' },
  { id: 'continuity', name: 'Continuity', blurb: 'How the business runs day to day' },
  { id: 'succession', name: 'Succession', blurb: 'The next generation' },
  { id: 'ai', name: 'AI awareness', blurb: 'What you know and expect' },
  { id: 'digital', name: 'Digital adoption', blurb: 'Tools in use today' },
  { id: 'barriers', name: 'Barriers and support', blurb: 'What gets in the way' },
];

export const RESPONDENT_TYPES: {
  id: RespondentType;
  title: string;
  who: string;
  examples: string[];
}[] = [
  {
    id: 'founder',
    title: 'Founder or business owner',
    who: 'You started the business, or you own and run it today.',
    examples: ['Founders', 'Family-business owners', 'SME owners', 'Cooperative leaders'],
  },
  {
    id: 'successor',
    title: 'Next-generation successor',
    who: 'You are expected to take over, or you are considering it.',
    examples: ['Children of owners', 'Identified successors', 'Young managers'],
  },
  {
    id: 'manager',
    title: 'Senior manager or transformation leader',
    who: 'You help run or modernise the business without owning it.',
    examples: ['General managers', 'Operations leads', 'Digital transformation managers'],
  },
];

const SECTOR_OPTIONS = [
  'Food and beverage',
  'Retail and trading',
  'Agriculture and agri-processing',
  'Construction and property',
  'Manufacturing',
  'Logistics and transport',
  'Professional services',
  'Tourism and hospitality',
  'Automotive',
  'Health and wellness',
  'Education and training',
  'Other',
].map((s) => ({ value: s, label: s }));

const AGREEMENT = {
  min: 1,
  max: 5,
  minLabel: 'Not at all',
  maxLabel: 'Completely',
};

export const QUESTIONS: Question[] = [
  // ---- Section 1: About you -------------------------------------------------
  {
    id: 'role',
    section: 'profile',
    text: 'What best describes your current role?',
    type: 'single',
    options: [
      { value: 'owner_operator', label: 'Owner and day-to-day operator' },
      { value: 'owner_only', label: 'Owner, not in daily operations' },
      { value: 'successor_in_business', label: 'Successor already working in the business' },
      { value: 'successor_outside', label: 'Successor not yet in the business' },
      { value: 'senior_manager', label: 'Senior manager or department head' },
      { value: 'transformation_lead', label: 'Digital or transformation lead' },
    ],
  },
  {
    id: 'age_range',
    section: 'profile',
    text: 'Which age range applies to you?',
    type: 'single',
    optional: true,
    options: [
      { value: 'u25', label: 'Under 25' },
      { value: '25_34', label: '25 to 34' },
      { value: '35_44', label: '35 to 44' },
      { value: '45_54', label: '45 to 54' },
      { value: '55_64', label: '55 to 64' },
      { value: '65p', label: '65 or above' },
      { value: 'no_answer', label: 'Prefer not to answer' },
    ],
  },
  {
    id: 'experience_years',
    section: 'profile',
    text: 'How many years of business experience do you have?',
    type: 'single',
    options: [
      { value: 'lt2', label: 'Less than 2 years' },
      { value: '2_5', label: '2 to 5 years' },
      { value: '6_10', label: '6 to 10 years' },
      { value: '11_20', label: '11 to 20 years' },
      { value: 'gt20', label: 'More than 20 years' },
    ],
  },

  // ---- Section 2: The business ---------------------------------------------
  {
    id: 'sector',
    section: 'business',
    text: 'Which sector best describes the business?',
    type: 'single',
    options: SECTOR_OPTIONS,
  },
  {
    id: 'division',
    section: 'business',
    text: 'Where in Sarawak is the business mainly based?',
    type: 'single',
    options: [
      'Kuching',
      'Samarahan',
      'Serian',
      'Sri Aman',
      'Betong',
      'Sarikei',
      'Sibu',
      'Mukah',
      'Bintulu',
      'Miri',
      'Limbang',
      'Kapit',
      'Outside Sarawak',
    ].map((s) => ({ value: s, label: s })),
  },
  {
    id: 'years_operating',
    section: 'business',
    text: 'How long has the business been operating?',
    type: 'single',
    options: [
      { value: 'lt3', label: 'Less than 3 years' },
      { value: '3_10', label: '3 to 10 years' },
      { value: '11_20', label: '11 to 20 years' },
      { value: '21_40', label: '21 to 40 years' },
      { value: 'gt40', label: 'More than 40 years' },
    ],
  },
  {
    id: 'employees',
    section: 'business',
    text: 'How many people work in the business?',
    type: 'single',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: '2_5', label: '2 to 5' },
      { value: '6_20', label: '6 to 20' },
      { value: '21_50', label: '21 to 50' },
      { value: '51_150', label: '51 to 150' },
      { value: 'gt150', label: 'More than 150' },
    ],
  },
  {
    id: 'family_owned',
    section: 'business',
    text: 'Is this a family-owned business?',
    type: 'single',
    allowNotSure: true,
    options: [
      { value: 'yes_family_run', label: 'Yes, and family members work in it' },
      { value: 'yes_not_run', label: 'Yes, but family members do not work in it' },
      { value: 'no', label: 'No' },
      { value: 'cooperative', label: 'It is a cooperative' },
    ],
  },
  {
    id: 'customer_type',
    section: 'business',
    text: 'Who are your main customers?',
    type: 'single',
    options: [
      { value: 'consumers', label: 'Consumers, walk-in or online' },
      { value: 'businesses', label: 'Other businesses' },
      { value: 'government', label: 'Government or agencies' },
      { value: 'mixed', label: 'A mix' },
    ],
  },

  // ---- Section 3: Continuity ------------------------------------------------
  {
    id: 'founder_dependence',
    section: 'continuity',
    text: 'How much does the business depend on one key person for decisions?',
    help: 'Think about who signs off on pricing, hiring and major spending.',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Not dependent', maxLabel: 'Totally dependent' },
  },
  {
    id: 'thirty_days',
    section: 'continuity',
    text: 'Could the business run normally for 30 days without that person?',
    type: 'single',
    allowNotSure: true,
    options: [
      { value: 'yes_comfortably', label: 'Yes, comfortably' },
      { value: 'yes_with_difficulty', label: 'Yes, but with difficulty' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'documented',
    section: 'continuity',
    text: 'Are your important processes written down somewhere another person could follow?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Nothing written', maxLabel: 'Fully documented' },
  },
  {
    id: 'relationships_held',
    section: 'continuity',
    text: 'Are your most valuable customer relationships held by one person?',
    type: 'single',
    allowNotSure: true,
    options: [
      { value: 'one_person', label: 'Yes, mostly one person' },
      { value: 'few_people', label: 'A few people share them' },
      { value: 'company_wide', label: 'They belong to the company, not an individual' },
    ],
  },
  {
    id: 'continuity_plan',
    section: 'continuity',
    text: 'Is there a written plan for what happens if the owner stops working suddenly?',
    type: 'single',
    allowNotSure: true,
    options: [
      { value: 'yes_written', label: 'Yes, written and shared' },
      { value: 'informal', label: 'An informal understanding only' },
      { value: 'no', label: 'No plan' },
    ],
  },

  // ---- Section 4: Succession (branched) -------------------------------------
  {
    id: 'successor_identified',
    section: 'succession',
    text: 'Has a successor been identified?',
    type: 'single',
    showFor: ['founder', 'manager'],
    allowNotSure: true,
    options: [
      { value: 'yes_confirmed', label: 'Yes, and it has been agreed openly' },
      { value: 'yes_assumed', label: 'Yes in my mind, but not discussed' },
      { value: 'candidate', label: 'A possible candidate, not decided' },
      { value: 'no', label: 'No successor identified' },
    ],
  },
  {
    id: 'transition_horizon',
    section: 'succession',
    text: 'When do you expect leadership to change hands?',
    type: 'single',
    showFor: ['founder', 'manager'],
    allowNotSure: true,
    options: [
      { value: 'lt2', label: 'Within 2 years' },
      { value: '2_5', label: '2 to 5 years' },
      { value: '6_10', label: '6 to 10 years' },
      { value: 'gt10', label: 'More than 10 years' },
      { value: 'never', label: 'No plan to transition' },
    ],
  },
  {
    id: 'decision_rights',
    section: 'succession',
    text: 'How much real decision-making has already been handed over?',
    type: 'scale',
    showFor: ['founder', 'manager'],
    scale: { min: 1, max: 5, minLabel: 'None yet', maxLabel: 'Substantially handed over' },
  },
  {
    id: 'transition_blocker',
    section: 'succession',
    text: 'What most stands in the way of a smooth transition?',
    type: 'single',
    showFor: ['founder', 'manager'],
    options: [
      { value: 'no_interest', label: 'No one in the family is interested' },
      { value: 'not_ready', label: 'The successor is not ready yet' },
      { value: 'founder_letting_go', label: 'Letting go is difficult' },
      { value: 'finances', label: 'Financial or ownership complexity' },
      { value: 'no_time', label: 'No time to plan it properly' },
      { value: 'nothing', label: 'Nothing significant' },
    ],
  },
  {
    id: 'successor_intent',
    section: 'succession',
    text: 'Do you want to lead this business in the future?',
    type: 'single',
    showFor: ['successor'],
    allowNotSure: true,
    options: [
      { value: 'yes_committed', label: 'Yes, I am committed to it' },
      { value: 'yes_conditions', label: 'Yes, if certain things change' },
      { value: 'undecided', label: 'I am still deciding' },
      { value: 'no', label: 'No, I would rather not' },
    ],
  },
  {
    id: 'successor_understanding',
    section: 'succession',
    text: 'How well do you understand how the business actually makes money?',
    type: 'scale',
    showFor: ['successor'],
    scale: { min: 1, max: 5, minLabel: 'Not clearly', maxLabel: 'Very clearly' },
  },
  {
    id: 'successor_trust',
    section: 'succession',
    text: 'Are you trusted to make decisions without approval?',
    type: 'scale',
    showFor: ['successor'],
    scale: { min: 1, max: 5, minLabel: 'Never', maxLabel: 'Routinely' },
  },
  {
    id: 'successor_concern',
    section: 'succession',
    text: 'What concerns you most about taking over?',
    type: 'single',
    showFor: ['successor'],
    options: [
      { value: 'capability', label: 'Whether I have the capability' },
      { value: 'staff', label: 'Being accepted by long-serving staff' },
      { value: 'founder_control', label: 'The founder not really letting go' },
      { value: 'relevance', label: 'The business model becoming outdated' },
      { value: 'own_path', label: 'Giving up my own career path' },
      { value: 'none', label: 'Nothing major' },
    ],
  },

  // ---- Section 5: AI awareness ---------------------------------------------
  {
    id: 'ai_familiarity',
    section: 'ai',
    text: 'How familiar are you with AI tools?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Never used one', maxLabel: 'Use them weekly' },
  },
  {
    id: 'ai_relevance',
    section: 'ai',
    text: 'How relevant do you think AI is to your business in the next three years?',
    type: 'scale',
    scale: AGREEMENT,
  },
  {
    id: 'ai_concerns',
    section: 'ai',
    text: 'Which concerns about AI matter most to you?',
    help: 'Choose up to three.',
    type: 'multi',
    options: [
      { value: 'accuracy', label: 'Wrong or made-up answers' },
      { value: 'privacy', label: 'Customer data privacy' },
      { value: 'security', label: 'Cybersecurity risk' },
      { value: 'cost', label: 'Cost with unclear return' },
      { value: 'jobs', label: 'Effect on my staff' },
      { value: 'skills', label: 'Nobody here knows how to use it' },
      { value: 'trust', label: 'Losing the human touch with customers' },
      { value: 'none', label: 'No particular concern' },
    ],
  },

  // ---- Section 6: Digital adoption -----------------------------------------
  {
    id: 'digital_areas',
    section: 'digital',
    text: 'Where does the business already use digital or AI tools?',
    help: 'Choose everything that applies.',
    type: 'multi',
    options: [
      { value: 'marketing', label: 'Marketing and social media' },
      { value: 'content', label: 'Content and design' },
      { value: 'service', label: 'Customer service' },
      { value: 'sales', label: 'Sales and quotations' },
      { value: 'finance', label: 'Accounting and finance' },
      { value: 'inventory', label: 'Stock and inventory' },
      { value: 'operations', label: 'Daily operations' },
      { value: 'hr', label: 'Staff and payroll' },
      { value: 'ecommerce', label: 'Online selling' },
      { value: 'reporting', label: 'Reporting and dashboards' },
      { value: 'none', label: 'None of these yet' },
    ],
  },
  {
    id: 'digital_priority',
    section: 'digital',
    text: 'Of those, which one area would help the business most if it improved?',
    help: 'Pick the single area with the most to gain.',
    type: 'single',
    options: [
      { value: 'marketing', label: 'Marketing and social media' },
      { value: 'service', label: 'Customer service' },
      { value: 'sales', label: 'Sales and quotations' },
      { value: 'finance', label: 'Accounting and finance' },
      { value: 'inventory', label: 'Stock and inventory' },
      { value: 'operations', label: 'Daily operations' },
      { value: 'ecommerce', label: 'Online selling' },
      { value: 'reporting', label: 'Reporting and dashboards' },
    ],
  },
  {
    id: 'measurement',
    section: 'digital',
    text: 'When you spend on marketing, can you tell what it produced?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'No idea', maxLabel: 'Measured clearly' },
  },
  {
    id: 'staff_skills',
    section: 'digital',
    text: 'How would you rate your team’s digital skills overall?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Very limited', maxLabel: 'Strong' },
  },

  // ---- Section 7: Barriers and support -------------------------------------
  {
    id: 'barriers',
    section: 'barriers',
    text: 'What holds the business back from adopting new technology?',
    help: 'Choose up to three.',
    type: 'multi',
    options: [
      { value: 'knowledge', label: 'Not knowing where to start' },
      { value: 'skills', label: 'No skilled staff' },
      { value: 'cost', label: 'Cost' },
      { value: 'roi', label: 'Unclear return on investment' },
      { value: 'time', label: 'No time' },
      { value: 'security', label: 'Security and privacy worries' },
      { value: 'resistance_owner', label: 'Owner prefers current ways' },
      { value: 'resistance_staff', label: 'Staff resist change' },
      { value: 'infrastructure', label: 'Internet or infrastructure' },
      { value: 'advisers', label: 'No trusted adviser to ask' },
      { value: 'toomany', label: 'Too many tools, hard to choose' },
    ],
  },
  {
    id: 'support_wanted',
    section: 'barriers',
    text: 'What kind of support would genuinely help?',
    help: 'Choose up to three.',
    type: 'multi',
    options: [
      { value: 'awareness', label: 'Awareness sessions' },
      { value: 'workshops', label: 'Hands-on workshops' },
      { value: 'diagnostics', label: 'A proper business diagnostic' },
      { value: 'demos', label: 'Seeing AI tools demonstrated' },
      { value: 'successor_dev', label: 'Successor development' },
      { value: 'advisory', label: 'Digital transformation advisory' },
      { value: 'mentoring', label: 'Mentoring' },
      { value: 'implementation', label: 'Someone to implement it with us' },
      { value: 'cases', label: 'Case studies from similar businesses' },
      { value: 'gov', label: 'Government or institutional support' },
    ],
  },
];

export function questionsFor(type: RespondentType): Question[] {
  return QUESTIONS.filter((q) => !q.showFor || q.showFor.includes(type));
}

export function sectionsFor(type: RespondentType): Section[] {
  const live = new Set(questionsFor(type).map((q) => q.section));
  return SECTIONS.filter((s) => live.has(s.id));
}
