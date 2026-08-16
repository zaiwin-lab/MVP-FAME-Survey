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
- **Four languages.** English, Bahasa Malaysia, Chinese and Iban, switchable from the
  header pill at any point, including on a report that has already been generated. The choice
  persists across sessions and the browser's own language seeds the first visit.
- **Two floating bubbles.** An AI assistant on the left (24/7 badge, prepared answers to the
  five questions respondents actually ask) and WhatsApp on the right, with a pre-filled message
  in the active language. Both lift clear of the survey's sticky action bar and collapse to
  icons on a phone.
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

## Languages

The toggle is **EN / BM / 中 / IB**, matching the pattern used across the other KOBIS sites.

Copy lives in `src/i18n/` as three dictionaries, each row ordered `[en, bm, zh, ib]`:

| File | Covers |
|---|---|
| `dict.ui.ts` | Chrome, buttons, every screen's static copy, the assistant Q&A |
| `dict.survey.ts` | All 27 questions, their help text, and every answer option |
| `dict.report.ts` | Everything the scoring engine generates |

The report translating is the part worth checking: the scoring engine emits each generated
sentence twice, once as English (so the stored JSON reads on its own) and once as a translation
key the UI resolves. That keeps the engine independent of the active language while letting
quick wins, AI opportunities, evidence lines, the succession reflection and the scope notice all
follow the toggle. A missing cell falls back to English rather than rendering blank.

Answer *values* are stable keys (`fnb`, `yes_confirmed`), not display strings, so responses stay
comparable across languages and survive copy edits.

**Before this goes public, the Bahasa Malaysia, Chinese and Iban copy needs a native-speaker
review pass.** It is careful work, not machine output, but it has not been checked by a native
speaker of any of the three, and Iban in particular deserves a local reader.

## Studio credit

The footer carries a quiet credit to KOBIS Berhad, linking to
https://www.kobisberhad.com. At rest it is muted body text. On hover or keyboard
focus the name lifts to full ink, a gold-to-cyan hairline wipes in beneath it,
and a warm highlight sweeps once behind the wordmark.

The sweep is a glow behind the text, not a gradient clipped into it, so the name
stays solid and legible while it passes. `prefers-reduced-motion` keeps the
underline and drops the sweep. The footer reserves a bottom lane so the floating
bubbles never land on the credit.

## SAIC branding

Off by default and controlled by one build-time flag, `VITE_SAIC_APPROVED` (see `.env.example`).

While it is off, the header reads "Strategic partnership invitation in progress" and no SAIC name,
logo, endorsement or partnership claim renders anywhere. **No SAIC logo file is committed to this
repository.** Turn the flag on and add the asset only once written approval is in hand.

## Deploying

Netlify, via the committed `netlify.toml`: build `npm run build`, publish `dist`.

Set `VITE_WHATSAPP_NUMBER` to FAME's real enquiry line before showing the demo publicly; the
default is an invalid placeholder. Set `VITE_SAIC_APPROVED` if and when approval lands.

## Deliberately not in this demo

Scoped out to keep the demo fast to build and impossible to break in front of an audience:

Supabase and persistence · admin and research dashboards · partner dashboard · email delivery ·
server-side PDF generation · campaign and QR tracking · authentication and roles · real fetching
of submitted links · automated tests · a live model behind the AI assistant.

Responses live in `localStorage` only and are never transmitted.

## Known limitations

- **Translations are unreviewed.** See the Languages section above. The infrastructure is done
  and the coverage is complete; what is missing is a native speaker's eye on BM, Chinese and Iban.
- **The AI assistant is scripted.** Five prepared answers, labelled as such in the panel itself.
  Wiring it to a live model is a Phase 1 task, and needs the cost ceiling and rate limiting that
  come with it.
- **Link verification needs a server.** Even then, Facebook, Instagram, TikTok, LinkedIn, Shopee
  and Lazada block automated fetching, so realistically only websites, Google Business Profiles and
  sometimes YouTube will ever be confirmed. The "paste your public text" fields exist because of
  this and should stay first-class.
- **The 7-to-10-minute claim holds for this question set.** The full instrument in the original
  brief is roughly 100 to 180 questions and would take 25 to 35 minutes.
