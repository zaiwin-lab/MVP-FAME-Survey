import { useCallback, useEffect, useState } from 'react';
import type {
  Answers,
  AnswerValue,
  BusinessContext,
  Consents,
  DetectedAsset,
  Report,
  RespondentType,
} from '../types';
import { CONSENT_VERSION } from '../config/branding';

export type Stage =
  | 'landing'
  | 'receive'
  | 'info'
  | 'consent'
  | 'type'
  | 'survey'
  | 'magicbox'
  | 'review'
  | 'processing'
  | 'report'
  | 'done';

export interface SessionState {
  stage: Stage;
  respondentType: RespondentType | null;
  answers: Answers;
  consents: Consents;
  assets: DetectedAsset[];
  context: BusinessContext;
  email: string;
  questionIndex: number;
  respondentId: string;
  startedAt: string;
  report: Report | null;
}

const STORAGE_KEY = 'fame-survey-session-v1';

function newId(): string {
  const n = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  const m = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, '0');
  return `SRW-${n}-${m}`;
}

export function emptyState(): SessionState {
  return {
    stage: 'landing',
    respondentType: null,
    answers: {},
    consents: {
      research: false,
      reportEmail: false,
      futureComms: false,
      version: CONSENT_VERSION,
      timestampIso: null,
    },
    assets: [],
    context: {
      description: '',
      productsServices: '',
      targetCustomers: '',
      location: '',
      tagline: '',
    },
    email: '',
    questionIndex: 0,
    respondentId: newId(),
    startedAt: new Date().toISOString(),
    report: null,
  };
}

function load(): SessionState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export type SaveStatus = 'idle' | 'saving' | 'saved';

export function useSession() {
  const [state, setState] = useState<SessionState>(load);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [resumable, setResumable] = useState(false);

  useEffect(() => {
    const loaded = load();
    if (loaded.stage !== 'landing' && loaded.stage !== 'done') setResumable(true);
  }, []);

  useEffect(() => {
    setSaveStatus('saving');
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveStatus('saved');
      } catch {
        setSaveStatus('idle');
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [state]);

  const patch = useCallback((p: Partial<SessionState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  }, []);

  const setContext = useCallback((p: Partial<BusinessContext>) => {
    setState((s) => ({ ...s, context: { ...s.context, ...p } }));
  }, []);

  const setConsents = useCallback((p: Partial<Consents>) => {
    setState((s) => ({ ...s, consents: { ...s.consents, ...p } }));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(emptyState());
    setResumable(false);
  }, []);

  const dismissResume = useCallback(() => setResumable(false), []);

  return {
    state,
    patch,
    setAnswer,
    setContext,
    setConsents,
    reset,
    saveStatus,
    resumable,
    dismissResume,
  };
}
