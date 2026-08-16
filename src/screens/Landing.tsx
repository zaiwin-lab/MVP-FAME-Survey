import { Band, Button, Eyebrow, NodeField } from '../components/ui';
import { branding } from '../config/branding';

const RECEIVE = [
  ['Marketing and Digital Presence Score', 'A single 0 to 100 position with the confidence behind it stated plainly.'],
  ['Eight dimension scores', 'Footprint, brand clarity, discoverability, consistency, conversion, trust, content, AI readiness.'],
  ['Three strongest signals', 'Each one tied to the specific evidence it came from.'],
  ['Three visibility gaps', 'What is missing, and why it costs you customers.'],
  ['Three seven-day quick wins', 'Practical, prioritised, most of them free.'],
  ['Two AI opportunities', 'Matched to the area you said has the most to gain.'],
];

const FACTS: [string, string][] = [
  ['Time needed', '7 to 10 minutes'],
  ['Cost', 'Free'],
  ['Your answers', 'Private, reported only in aggregate'],
  ['Result', 'Immediate, on screen'],
];

export function Landing({
  onStart,
  onPreview,
  resumable,
  onResume,
}: {
  onStart: () => void;
  onPreview: () => void;
  resumable: boolean;
  onResume: () => void;
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line-soft bg-white">
        <div className="grid-ground pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <NodeField className="pointer-events-none absolute right-[-3rem] top-1/2 hidden aspect-square h-[34rem] -translate-y-1/2 text-cyan opacity-55 lg:block xl:right-4" />
        <div className="shell relative py-16 md:py-24">
          <div className="max-w-2xl">
            <Eyebrow>Sarawak · 2026 research initiative</Eyebrow>
            <h1 className="font-display text-[clamp(2.1rem,5.2vw,3.9rem)] leading-[1.06] text-ink">
              Is your business ready for the next generation, and is the next generation ready
              for an AI-powered economy?
            </h1>
            <p className="measure mt-6 text-[1.06rem] leading-relaxed text-ink-soft">
              Answer a short set of questions about how your business runs today. Add your public
              digital presence to the AI Magic Box and receive an immediate Marketing and Digital
              Presence Readiness Snapshot.
            </p>

            {resumable && (
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-brand/30 bg-brand-tint px-4 py-3">
                <p className="text-sm text-ink">You have an unfinished session saved on this device.</p>
                <button
                  onClick={onResume}
                  className="text-sm font-medium text-brand underline underline-offset-4"
                >
                  Continue where you stopped
                </button>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={onStart}>Check my business readiness</Button>
              <Button variant="secondary" onClick={onPreview}>
                See what I will receive
              </Button>
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-8">
              {FACTS.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-ink-mute">{k}</dt>
                  <dd className="mt-0.5 text-[0.95rem] font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Band tone="tint" id="receive">
        <div className="max-w-2xl">
          <Eyebrow>What you receive</Eyebrow>
          <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.5rem)] leading-tight">
            A snapshot you could act on this week
          </h2>
          <p className="measure mt-4 text-ink-soft">
            Generated from your answers and the public links you choose to share. Every finding
            names the evidence it rests on.
          </p>
        </div>

        <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {RECEIVE.map(([title, body], i) => (
            <li key={title} className="border-t border-line pt-4">
              <span className="tnum text-xs text-cyan-deep">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-[1.12rem] leading-snug text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl rounded-lg border border-line bg-white px-5 py-4 text-sm leading-relaxed text-ink-soft">
          The immediate report evaluates marketing and publicly visible digital presence. It is not
          a complete assessment of financial, operational, legal, cybersecurity or organisational
          health.
        </p>
      </Band>

      <Band>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>Why this matters</Eyebrow>
            <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.4rem)] leading-tight">
              Experience built over decades still needs a route into the next one
            </h2>
            <p className="measure mt-5 leading-relaxed text-ink-soft">
              Sarawak businesses have been built through customer relationships, resilience and
              years of hard work. Where succession planning, AI awareness and digital adaptation
              are delayed, the effects tend to arrive quietly: harder recruitment of younger staff,
              slower decisions, weaker digital visibility, and steady dependence on one person.
            </p>
            <p className="measure mt-4 leading-relaxed text-ink-soft">
              This survey exists to describe that picture accurately across Sarawak, and to give
              every participant something useful in return for the ten minutes it takes.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-7">
            <h3 className="font-display text-[1.2rem] text-ink">Who should take part</h3>
            <ul className="mt-5 space-y-4">
              {[
                ['Founders and business owners', 'Continuity, knowledge transfer, competitiveness'],
                ['Next-generation successors', 'Readiness, confidence, capability, the handover itself'],
                ['Senior and transformation managers', 'Organisational readiness, skills gaps, adoption'],
              ].map(([t, s]) => (
                <li key={t} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <p className="text-[0.95rem] font-medium text-ink">{t}</p>
                  <p className="mt-0.5 text-sm text-ink-mute">{s}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              Convened by {branding.convenor}.
              {!branding.saicApproved && ` ${branding.pendingNotice}.`}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-10">
          <Button onClick={onStart}>Check my business readiness</Button>
          <span className="text-sm text-ink-mute">
            No account needed. You can stop at any point before submitting.
          </span>
        </div>
      </Band>
    </>
  );
}
