import { useEffect } from 'react';
import { Footer, Header } from './components/Chrome';
import { Landing } from './screens/Landing';
import { Consent } from './screens/Consent';
import { RespondentPick } from './screens/RespondentPick';
import { Survey } from './screens/Survey';
import { MagicBox } from './screens/MagicBox';
import { Processing, Review } from './screens/Submit';
import { ReportView } from './screens/ReportView';
import { ThankYou } from './screens/ThankYou';
import { useSession } from './state/store';

export default function App() {
  const {
    state,
    patch,
    setAnswer,
    setContext,
    setConsents,
    reset,
    saveStatus,
    resumable,
    dismissResume,
  } = useSession();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [state.stage, state.questionIndex]);

  const goHome = () => patch({ stage: 'landing' });

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="no-print sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header onHome={goHome} />

      <main id="main" className="flex-1">
        {state.stage === 'landing' && (
          <Landing
            onStart={() => patch({ stage: 'consent' })}
            onPreview={() => document.getElementById('receive')?.scrollIntoView({ block: 'start' })}
            resumable={resumable && state.stage === 'landing' && state.questionIndex > 0}
            onResume={() => {
              dismissResume();
              patch({ stage: state.respondentType ? 'survey' : 'consent' });
            }}
          />
        )}

        {state.stage === 'consent' && (
          <Consent
            consents={state.consents}
            setConsents={setConsents}
            onBack={goHome}
            onNext={() => patch({ stage: 'type' })}
          />
        )}

        {state.stage === 'type' && (
          <RespondentPick
            value={state.respondentType}
            onPick={(t) => patch({ respondentType: t, questionIndex: 0 })}
            onBack={() => patch({ stage: 'consent' })}
            onNext={() => patch({ stage: 'survey' })}
          />
        )}

        {state.stage === 'survey' && state.respondentType && (
          <Survey
            respondentType={state.respondentType}
            answers={state.answers}
            index={state.questionIndex}
            setIndex={(i) => patch({ questionIndex: i })}
            setAnswer={setAnswer}
            onBack={() => patch({ stage: 'type' })}
            onComplete={() => patch({ stage: 'magicbox' })}
            saveStatus={saveStatus}
          />
        )}

        {state.stage === 'magicbox' && (
          <MagicBox
            assets={state.assets}
            setAssets={(a) => patch({ assets: a })}
            context={state.context}
            setContext={setContext}
            onBack={() => patch({ stage: 'survey' })}
            onNext={() => patch({ stage: 'review' })}
          />
        )}

        {state.stage === 'review' && state.respondentType && (
          <Review
            respondentType={state.respondentType}
            answers={state.answers}
            assets={state.assets}
            consents={state.consents}
            email={state.email}
            setEmail={(v) => patch({ email: v })}
            onEditAnswers={() => patch({ stage: 'survey', questionIndex: 0 })}
            onEditAssets={() => patch({ stage: 'magicbox' })}
            onSubmit={() => patch({ stage: 'processing' })}
          />
        )}

        {state.stage === 'processing' && state.respondentType && (
          <Processing
            input={{
              respondentType: state.respondentType,
              answers: state.answers,
              assets: state.assets,
              context: state.context,
              respondentId: state.respondentId,
            }}
            onReady={(r) => patch({ report: r, stage: 'report' })}
          />
        )}

        {state.stage === 'report' && state.report && (
          <ReportView
            report={state.report}
            emailRequested={state.consents.reportEmail}
            email={state.email}
            onFinish={() => patch({ stage: 'done' })}
          />
        )}

        {state.stage === 'done' && (
          <ThankYou
            reference={state.respondentId}
            consents={state.consents}
            email={state.email}
            onRestart={reset}
            onBackToReport={() => patch({ stage: 'report' })}
          />
        )}
      </main>

      {/* The survey and processing screens own the full viewport; a footer
          under their sticky bars reads as a stray strip. */}
      {state.stage !== 'survey' && state.stage !== 'processing' && <Footer />}
    </div>
  );
}
