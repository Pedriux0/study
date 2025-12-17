// app/test/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveTestSession, setActiveTestSession, clearActiveTestSession } from "@/features/test-runner/testSessionStorage";
import { loadFromLocalStorage } from "@/lib/storage/localStorageClient";
import { storageKeys } from "@/lib/storage/storageKeys";
import type { Question } from "@/types/question";
import type { TestSession } from "@/types/testSession";

/**This is the page whewre all the test are gonna rin 
 * 
 * - Loading the active seession 
 * - Load manual bank of questions 
 * - Display the current questions and answers
 */
export default function TestPage(){
    const router = useRouter();
    const[session, setSession] = useState<TestSession |null>(null);
    const [manualBank, setManualBank] = useState<Question[]>([]);
    const [draftAnswer , setDraftAnswer] = useState("");

/**
 * Load: 
 * -Read the acitve session
 * -Read the question bank
 */
useEffect(()=> {
    const active = getActiveTestSession();
    if(!active){
        //No active session => send user to entry point 
        //
        router.push("/study/manual");
        return;

    }
    setSession(active);
    
       const bank = loadFromLocalStorage<Question[]>(storageKeys.manualQuestionBank, []);
    setManualBank(bank);
  }, [router]);
  /**(
   * Build an index of questions for lookup
  ) */
  const questionById = useMemo(()=> {
    const map = new Map<string ,Question>();
    for(const q of manualBank) map.set(q.id,q);
    return map;
  },[manualBank]);
  /**
   * Get the current qustion based on the index
   */
  const currentQuestion = useMemo(()=>{
    if(!session){
        return null;
    }
    const currentId = session.questionsIds[session.currentIndex];
    if(!currentId) return null;
    return questionById.get(currentId) ?? null;
  },[session,questionById]);

/**
 * Where the current question changes load the anser into the new one 
 */
useEffect(()=>{
    if(!session|| !currentQuestion) return;

    const currentAnswer = session.answersByQuestions[currentQuestion.id] ?? "";
    setDraftAnswer(currentAnswer);
},[session,currentQuestion]);
/**
 * lastAnswer writes the current draftg answe in the session objects and save it 
 * This the core component for the test runner
 * check twice for common errros 
 */
function lastAnswer(nextIndex?: number){
    if(!session || !currentQuestion){
        return null;
    }
   // Keep existing answers and add/update the current one
const updatedAnswers = {
  ...session.answersByQuestions,
  [currentQuestion.id]: draftAnswer,
};

    const updated: TestSession = {
    ...session,
    answersByQuestions: updatedAnswers,
    currentIndex: typeof nextIndex === "number" ? nextIndex : session.currentIndex,
    };
    setSession(updated);
    setActiveTestSession(updated);
    }
    //handleNext is the one who get the next answer if there is a session and push it to the user updating it
    function handleNext()
    {
        if(!session){
            return;
        }
        const nextIndex= Math.min(session.currentIndex+ 1 , session.questionsIds.length -1)
        lastAnswer(nextIndex);
    }
    //handleback return the last index of the answer ( answer)
    function handleback(){
        if(!session) return null;
        const previousIndex = Math.max(session.currentIndex -1,0);
        lastAnswer(previousIndex);
    }
    //handleFinish check the last and mark it as finished
    function handleFinish(){
        if(!session) return null;
        const finished: TestSession = {
            id: session.id,
            source: session.source,
            questionsIds: session.questionsIds,
            answersByQuestions: {
                ...session.answersByQuestions,
                ...(currentQuestion ? { [currentQuestion.id]: draftAnswer } : {}),
            },
            currentIndex: session.currentIndex,
            startedAtIso: session.startedAtIso,
            finishedAtIso: new Date().toISOString(),
        };
        setActiveTestSession(finished);
        setSession(finished);
        router.push("/result");
    }

    function handleExit(){
        clearActiveTestSession();
        router.push("/study/manual");
    }

    // show a light loading state until we have session and questions
    if(!session || manualBank.length === 0){
        return (
            <div className="space-y-2">
                <p className="text-sm text-slate-300">Loading test session...</p>
            </div>
        );
    }

    if(!currentQuestion){
        return(
        <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Test</h1>
        <p className="text-sm text-slate-300">
          We could not load the current question. This can happen if the manual question bank
          was modified after starting the test.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExit}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Return to manual mode
          </button>
        </div>
        </div>
        );
    }
    const total = session.questionsIds.length;
    const indexH = session.currentIndex + 1;
     return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Test</h1>
        <p className="text-sm text-slate-300">
          Question <strong>{indexH}</strong> of <strong>{total}</strong>
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Prompt</h2>
          <p className="text-sm text-slate-100">{currentQuestion.prompt}</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="answer" className="text-sm font-medium">
            Your answer
          </label>
          <textarea
            id="answer"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            value={draftAnswer}
            onChange={(e) => setDraftAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer here..."
          />
          <p className="text-xs text-slate-400">
            Your answers are stored locally in your browser. Nothing is sent to the server.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleback}
            disabled={session.currentIndex === 0}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={session.currentIndex >= total - 1}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Next
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Finish
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="rounded-md border border-red-500/70 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Exit
          </button>
        </div>
      </section>
    </div>
  );
}
