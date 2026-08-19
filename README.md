# Sarawak Family Business Succession & AI Readiness Survey

> **Portfolio maturity:** Interactive Demonstration Prototype · Human-Reviewed Readiness Assessment

A multilingual survey and decision-support experience for understanding family-business succession and AI readiness in Sarawak. The product turns structured responses into an explainable readiness snapshot while keeping evidence quality, confidence and limitations visible.

This repository uses a permanent product identity even though the repository name retains MVP for development history.

## Business problem

Family businesses need a practical way to discuss succession, digital capability and AI readiness without turning incomplete self-reported information into false certainty. Conventional forms collect answers but rarely give respondents an immediate, understandable next step.

## Intended users

- family-business founders;
- next-generation successors;
- senior managers;
- programme and research teams reviewing aggregated readiness patterns.

## Product journey

**Landing → consent → respondent path → survey → evidence review → processing → readiness snapshot → next steps**

The demonstration includes:

- three branching respondent journeys for founders, successors and senior managers;
- 29 questions on each respondent path, with one question per screen and local autosave;
- conditional follow-ups, so a multi-site business is asked which other divisions it operates in
  while a single-site business never sees the question;
- four interface languages: English, Bahasa Malaysia, Chinese and Iban;
- input controls matched to each question: stepped sliders on ordinal bands, dropdowns for long
  lists, segmented controls, rating scales and capped multi-select;
- link parsing and deduplication for respondent-declared public assets;
- deterministic scoring across eight dimensions with versioned weights;
- confidence-aware findings, strengths, gaps and seven-day quick wins;
- structured output that labels facts, inferences, recommendations and limitations;
- print-to-PDF support for the resulting snapshot.

## Strategic value

The product demonstrates how an assessment can become a governed decision-support journey rather than a passive form. It can help a programme team:

- create a consistent front door for diverse family businesses;
- separate declared evidence from verified evidence;
- give respondents useful next actions without presenting a diagnosis as certainty;
- preserve comparable structured responses across four languages;
- prepare a responsible foundation for later research and programme dashboards.

## What is implemented

The repository contains a React and TypeScript single-page application, multilingual dictionaries, branching survey screens, local state management, deterministic scoring logic, structured report generation, consent and review flows, and Netlify deployment configuration.

### Technology

React 18 · TypeScript · Vite · Tailwind CSS · localStorage · Netlify configuration

The package version is explicitly marked as a demonstration build. No production backend, authentication service or live language model is included.

## Delivery role

**Ts. Zaiwin Kassim** leads product strategy, stakeholder requirements, solution architecture and supervised AI-assisted delivery with the **KOBIS AI Prodigy Team**. In this project, that role covers the assessment journey, explainability rules, multilingual product direction and responsible-use boundaries.

This portfolio attribution does not imply commissioning, deployment, endorsement or partnership by any third party beyond evidence explicitly documented in the repository.

## Responsible-use design

The demonstration intentionally applies the following controls:

- respondent-submitted links are labelled as declared, not verified;
- missing answers remain missing instead of being converted to zero;
- confidence is capped when evidence has not been reviewed;
- each generated statement is classified as fact, inference, recommendation or limitation;
- succession is reflected qualitatively rather than reduced to a definitive score;
- responses stay in the browser and are not transmitted;
- no traffic, revenue, ranking, competitor or social metrics are invented.

The output is an initial readiness reflection, not professional legal, financial, employment or succession advice. Material decisions require human review and appropriate professional input.

## Current limitations

- **No production data layer:** responses persist only in localStorage.
- **No authentication or programme dashboard:** administrative and research workflows are out of scope.
- **No live AI model:** the assistant uses prepared answers and the readiness engine is deterministic.
- **No automated third-party verification:** submitted links remain self-declared.
- **Translations require review:** Bahasa Malaysia, Chinese and especially Iban copy need native-speaker validation before public use.
- **No automated test suite is documented:** build and type-check scripts exist, but production assurance is not claimed.
- **No verified public demo URL is documented:** this README does not publish an unverified deployment link.

## Run locally

Requirements: Node.js and npm.

    npm install
    npm run dev
    npm run typecheck
    npm run build
    npm run preview

The local development server is normally available at http://localhost:5173.

## Deployment notes

The committed Netlify configuration builds with npm run build and publishes the generated dist directory.

Before any public pilot:

1. complete native-speaker review for all non-English copy;
2. set an approved WhatsApp enquiry number, which converts the bubble from an at-launch notice into a live link;
3. confirm consent, retention and research-governance requirements;
4. add a secure backend only after access controls and data minimisation are defined;
5. activate any third-party branding only after written approval.

## Repository map

- **src/screens** — respondent journey and report screens
- **src/i18n** — multilingual interface, survey and report dictionaries
- **src/state** — browser-side state and persistence
- **src/lib** — scoring and supporting logic
- **src/types.ts** — structured domain types
- **netlify.toml** — static deployment configuration

## Portfolio evidence

This repository demonstrates product strategy, multilingual UX, explainable scoring, structured AI-readiness outputs and responsible prototype boundaries. It should be evaluated as an interactive demonstration prototype, not as a deployed research platform or validated diagnostic instrument.
