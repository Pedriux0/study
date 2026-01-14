// app/results/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadFromLocalStorage } from "@/lib/storage/localStorageClient";
import { storageKeys } from "@/lib/storage/storageKeys";
import { evaluateAnswer } from "@/lib/text/evaluateAnswer";

import {
  buildManualTestSession,
  clearActiveTestSession,
  getActiveTestSession,
  setActiveTestSession,
} from "@/features/test-runner/testSessionStorage";

import type { Question } from "@/types/question";
import type { TestSession } from "@/types/testSession";

/**
 * ResultsPage is the "close-out" view of a test run.
 *
 * MVP scope:
 * - Read finished session from localStorage
 * - Compute KPIs (answered/unanswered + correct/incorrect + accuracy)
 * - Show per-question review (prompt + expected + user answer)
 * - Provide CTAs to retake or clear the session
 *
 * Notes:
 * - This page does NOT store anything on the server.
 * - All personal answers remain in the browser.
 * - Scoring is based on normalization + Levenshtein similarity (no AI yet).
 */
export default function ResultsPage() {
  const router = useRouter();

  const [session, setSession] = useState<TestSession | null>(null);
  const [manualBank, setManualBank] = useState<Question[]>([]);

  /**
   * Initial load:
   * - Fetch active session (should be finished by /test)
   * - Fetch manual bank to resolve question IDs to actual question content
   */
  useEffect(() => {
    const active = getActiveTestSession();
    setSession(active);

    const bank = loadFromLocalStorage<Question[]>(
      storageKeys.manualQuestionBank,
      [],
    );
    setManualBank(bank);
  }, []);

  /**
   * Build a quick lookup table for questions by ID.
   * This prevents repeated scanning of arrays during rendering.
   */
  const questionById = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of manualBank) map.set(q.id, q);
    return map;
  }, [manualBank]);

  /**
   * Build a normalized "review list" for the UI:
   * - Stable ordering based on session.questionIds
   * - Includes evaluation status + similarity percent
   * - Handles missing questions gracefully
   */
  const reviewItems = useMemo(() => {
    if (!session) return [];

    return session.questionsIds.map((id) => {
      const question = questionById.get(id) ?? null;
      const userAnswer = session.answersByQuestions[id] ?? "";

      const expectedAnswer = question?.expectedAnswer ?? "";
      const evaluation =
        question?.expectedAnswer
          ? evaluateAnswer(userAnswer, expectedAnswer)
          : {
              status: "UNANSWERED" as const,
              similarity: 0,
              normalizedUserAnswer: "",
              normalizedExpectedAnswer: "",
            };

      return {
        id,
        prompt: question?.prompt ?? "(Question not found in manual bank)",
        expectedAnswer:
          question?.expectedAnswer ?? "(Expected answer not available)",
        userAnswer,
        evaluation,
        isMissingQuestion: question === null,
      };
    });
  }, [session, questionById]);

  /**
   * KPI calculations:
   * - Answered/unanswered
   * - Correct/incorrect (only for answered items)
   * - Accuracy (correct / answered)
   */
  const kpis = useMemo(() => {
    if (!session) {
      return {
        total: 0,
        answered: 0,
        unanswered: 0,
        correct: 0,
        incorrect: 0,
        completionPercent: 0,
        accuracyPercent: 0,
      };
    }

    const total = session.questionsIds.length;

    let answered = 0;
    let unanswered = 0;
    let correct = 0;
    let incorrect = 0;

    for (const id of session.questionsIds) {
      const question = questionById.get(id);
      const userAnswer = session.answersByQuestions[id] ?? "";

      // If we cannot resolve the expected answer, we cannot score it reliably.
      // We treat it as unanswered for KPI purposes.
      if (!question?.expectedAnswer) {
        unanswered += 1;
        continue;
      }

      const result = evaluateAnswer(userAnswer, question.expectedAnswer);

      if (result.status === "UNANSWERED") {
        unanswered += 1;
      } else {
        answered += 1;

        if (result.status === "CORRECT") correct += 1;
        if (result.status === "INCORRECT") incorrect += 1;
      }
    }

    // Completion is based on answered/total (simple MVP metric).
    const completionPercent = total === 0 ? 0 : Math.round((answered / total) * 100);

    // Accuracy is based on correct/answered (common testing metric).
    const accuracyPercent =
      answered === 0 ? 0 : Math.round((correct / answered) * 100);

    return {
      total,
      answered,
      unanswered,
      correct,
      incorrect,
      completionPercent,
      accuracyPercent,
    };
  }, [session, questionById]);

  /**
   * handleRetake starts a fresh session using the same question ordering.
   * This keeps retakes predictable and easy to compare.
   */
  function handleRetake() {
    if (!session) return;

    // MVP: retake supported for manual sessions.
    const newSession = buildManualTestSession(session.questionsIds);
    setActiveTestSession(newSession);
    router.push("/test");
  }

  /**
   * handleClearSession provides a clean reset:
   * - Removes the active session from localStorage
   * - Sends the user back to manual mode
   */
  function handleClearSession() {
    clearActiveTestSession();
    router.push("/study/manual");
  }

  /**
   * Guard rails:
   * - If there is no session, show clear guidance
   * - If not finished yet, offer to return to /test
   */
  if (!session) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-sm text-slate-300">
          No test session found. Please start a test from manual mode.
        </p>
        <Link
          href="/study/manual"
          className="inline-block rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Go to manual mode
        </Link>
      </div>
    );
  }

  if (!session.finishedAtIso) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-sm text-slate-300">
          This session is not marked as finished yet. You can continue the test.
        </p>
        <div className="flex gap-2">
          <Link
            href="/test"
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Return to test
          </Link>
          <Link
            href="/study/manual"
            className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Manual mode
          </Link>
        </div>
      </div>
    );
  }

  // We keep timestamps as ISO strings (no formatting dependency in MVP).
  const startedAt = session.startedAtIso;
  const finishedAt = session.finishedAtIso;

  return (
    <div className="space-y-8">
      {/* Executive summary / KPI block */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          This summary is generated locally in your browser. No personal answers are
          stored on the server.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Run KPIs</h2>
            <p className="text-xs text-slate-400">
              Session ID: <span className="font-mono">{session.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Retake test
            </button>

            <button
              type="button"
              onClick={handleClearSession}
              className="rounded-md border border-red-500/70 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Clear session
            </button>

            <Link
              href="/study/manual"
              className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Manual mode
            </Link>
          </div>
        </div>

        {/* KPI grid: scannable, high-signal metrics */}
        <div className="grid gap-3 md:grid-cols-6">
          <KpiCard label="Total questions" value={kpis.total} />
          <KpiCard label="Answered" value={kpis.answered} />
          <KpiCard label="Unanswered" value={kpis.unanswered} />
          <KpiCard label="Correct" value={kpis.correct} />
          <KpiCard label="Incorrect" value={kpis.incorrect} />
          <KpiCard label="Accuracy" value={`${kpis.accuracyPercent}%`} />
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <p>
            Started: <span className="font-mono">{startedAt}</span>
          </p>
          <p>
            Finished: <span className="font-mono">{finishedAt}</span>
          </p>
        </div>
      </section>

      {/* Review list */}
      <section className="space-y-3">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold">Review</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Each item shows your answer versus the expected answer. Correctness is based on
            normalization + similarity scoring (no semantic AI yet).
          </p>
        </header>

        <ul className="space-y-3">
          {reviewItems.map((item, idx) => (
            <li
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">
                    Question {idx + 1} of {reviewItems.length}
                  </p>
                  <p className="text-sm font-medium text-slate-100">
                    {item.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.isMissingQuestion && (
                    <span className="rounded-md border border-amber-500/60 px-2 py-1 text-xs text-amber-300">
                      Missing from bank
                    </span>
                  )}

                  <StatusBadge status={item.evaluation.status} />

                  <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    Similarity: {item.evaluation.similarity}%
                  </span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    Expected answer
                  </p>
                  <p className="text-sm text-slate-100 whitespace-pre-wrap">
                    {item.expectedAnswer}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    Your answer
                  </p>
                  <p className="text-sm text-slate-100 whitespace-pre-wrap">
                    {item.userAnswer.trim().length > 0
                      ? item.userAnswer
                      : "(No answer provided)"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation footer */}
      <section className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Home
        </Link>
        <Link
          href="/study/manual"
          className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Manual mode
        </Link>
      </section>
    </div>
  );
}

/**
 * KpiCard is a small presentational component.
 * We keep it inside this file to avoid spreading small UI pieces
 * into many files during the MVP.
 */
function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}

/**
 * StatusBadge provides a clean and scannable label for each evaluated answer.
 * It is intentionally simple and uses a limited set of states.
 */
function StatusBadge({
  status,
}: {
  status: "CORRECT" | "INCORRECT" | "UNANSWERED";
}) {
  if (status === "CORRECT") {
    return (
      <span className="rounded-md border border-emerald-500/60 px-2 py-1 text-xs text-emerald-300">
        Correct
      </span>
    );
  }

  if (status === "INCORRECT") {
    return (
      <span className="rounded-md border border-red-500/60 px-2 py-1 text-xs text-red-300">
        Incorrect
      </span>
    );
  }

  return (
    <span className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300">
      Unanswered
    </span>
  );
}
