# Sarawak Family Business Succession & AI Readiness Survey 2026

Demonstration build of the public survey experience, convened by FAME International College.

This is the buy-in demo, not the production platform. It runs entirely in the browser so it can
be shown anywhere, on any laptop, with no backend, no API keys and nothing that can fail live.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build
```

## What the demo covers

The complete public journey, end to end:

landing → consent → respondent type → survey → AI Magic Box → review → processing → snapshot → thank you

- **Three branching journeys.** Founder, next-generation successor, and senior manager each get a
  different succession section. 27 questions on the founder path, roughly 8 minutes.
- **One question per screen**, with a progress bar, section trail, back navigation, "Not sure"
  escape hatches, and autosave to `localStorage` on every keystroke. Close the tab and the landing
  page offers to resume.
- **The AI Magic Box.** Paste links in any format, all at once. They are parsed, classified by
  platform, stripped of tracking parameters, deduplicated, and shown as editable cards you confirm
  or remove. Bare `@handles` are detected too, and suppressed when a matching profile URL is
  already present.
- **Deterministic scoring.** Eight dimensions, versioned weights, evidence recorded per dimension.
  The same inputs always produce the same report.
- **The snapshot.** Overall score and band, eight dimension scores with confidence, three
  strengths, three gaps, three seven-day quick wins, two AI opportunities, one priority message,
  a succession reflection, and a scope notice. "Save as PDF" prints via a dedicated print
  stylesheet.

## Honesty rules the build actually enforces

These are the parts worth pointing at in the room. They are not decoration.

- **Nothing is fabricated.** No traffic, follower counts, engagement, rankings, revenue or
  competitor figures appear anywhere, because none of it was measured.
- **Declared is not verified.** A browser cannot fetch third-party pages, so every submitted link
  is labelled `declared` and `assets_reviewed` stays at 0. Confidence is capped at *moderate*
  while anything is unverified, however broad the evidence coverage is.
- **Missing data is missing, never zero.** Skipped questions are recorded as absent and excluded
  from their dimension rather than scored as a failure.
- **Every finding is classified** as fact, inference, recommendation or limitation, and the
  classification is shown on screen next to the finding.
- **The report renders from a structured object**, not free text. "Show the structured output
  behind this report" on the snapshot page reveals the exact JSON.
- **Succession gets a reflection, not a score.** The headline promises a succession position, so
  the report mirrors the respondent's own answers back qualitatively. Succession and AI-readiness
  scores stay research-only, reported publicly in aggregate.

## SAIC branding

Off by default and controlled by one build-time flag, `VITE_SAIC_APPROVED` (see `.env.example`).

While it is off, the header reads "Strategic partnership invitation in progress" and no SAIC name,
logo, endorsement or partnership claim renders anywhere. **No SAIC logo file is committed to this
repository.** Turn the flag on and add the asset only once written approval is in hand.

## Deploying

Netlify, via the committed `netlify.toml`: build `npm run build`, publish `dist`. Set
`VITE_SAIC_APPROVED` in the Netlify UI if and when approval lands.

## Deliberately not in this demo

Scoped out to keep the demo fast to build and impossible to break in front of an audience:

Supabase and persistence · admin and research dashboards · partner dashboard · email delivery ·
server-side PDF generation · campaign and QR tracking · authentication and roles · real fetching
of submitted links · automated tests · multi-language support.

Responses live in `localStorage` only and are never transmitted.

## Known limitations

- **Language is English only.** A production build for this audience likely needs Bahasa Malaysia,
  and possibly Chinese. Retrofitting i18n after the survey copy is finalised is expensive, so this
  is the decision worth making before Phase 1 starts.
- **Link verification needs a server.** Even then, Facebook, Instagram, TikTok, LinkedIn, Shopee
  and Lazada block automated fetching, so realistically only websites, Google Business Profiles and
  sometimes YouTube will ever be confirmed. The "paste your public text" fields exist because of
  this and should stay first-class.
- **The 7-to-10-minute claim holds for this question set.** The full instrument in the original
  brief is roughly 100 to 180 questions and would take 25 to 35 minutes.
