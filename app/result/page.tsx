// app/results/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadFromLocalStorage } from "@/lib/storage/localStorageClient";
import { storageKeys } from "@/lib/storage/storageKeys";

import {
  buildManualTestSession,
  clearActiveTestSession,
  getActiveTestSession,
  setActiveTestSession,
} from "@/features/test-runner/testSessionStorage";

import type { Question } from "@/types/question";
import type { TestSession } from "@/types/testSession";

/**
 * ResultsPage is the view of a test run.
 *
 * - Read finished session from localStorage
 * - Compute simple KPIs (answered count, completion %, timestamps)
 * - Show per-question review (prompt + expected + user answer)
 *
 * Not in scope yet:
 * - Similarity scoring / correctness logic
 * - Keyword extraction
 * - Search links
 */
export default function ResultsPage() {
  const router = useRouter();

  const [session, setSession] = useState<TestSession | null>(null);
  const [manualBank, setManualBank] = useState<Question[]>([]);

  /**
   * Initial load:
   * - Fetch active session (should be finished)
   * - Fetch manual bank to resolve question IDs to full question content
   */
  useEffect(() => {
    const active = getActiveTestSession();
    setSession(active);

    const bank = loadFromLocalStorage<Question[]>(storageKeys.manualQuestionBank, []);
    setManualBank(bank);
  }, []);

  /**
   * Create fast lookup table for questions by ID.
   * This keeps the render layer clean and avoids repeated array scanning.
   */
  const questionById = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of manualBank) map.set(q.id, q);
    return map;
  }, [manualBank]);

  /**
   * Build a normalized review list
   * - Stable ordering based on session.questionIds
   * - Graceful handling if a question is missing from the bank
   */
const reviewItems = useMemo(() => {
  if (!session) return [];

  return session.questionsIds.map((id) => {
    const question = questionById.get(id);
    const { prompt = "Question not found in BANK", expectedAnswer = "Expected answer not there" } = question ?? {};

    return {
      id,
      prompt,
      expectedAnswer,
      userAnswer: session.answersByQuestions[id] ?? "",
      isMissingQuestion: !question,
    };
  });
}, [session, questionById]);

  /**
   * KPI calculations:
   */
  const kpis = useMemo(() => {
    if (!session) {
      return {
        total: 0,
        answered: 0,
        unanswered: 0,
        completionPercent: 0,
      };
    }

    const total = session.questionsIds.length;

    // means the user typed something non-empty 
    const answered = session.questionsIds.reduce((count, id) => {
      const val = (session.answersByQuestions[id] ?? "").trim();
      return val.length > 0 ? count + 1 : count;
    }, 0);

    const unanswered = Math.max(total - answered, 0);

    const completionPercent =
      total === 0 ? 0 : Math.round((answered / total) * 100);

    return { total, answered, unanswered, completionPercent };
  }, [session]);

  /**
   * handleRetake starts a fresh session with the same question ordering.
   * - Keeps the experience predictable for the user
   * - Resets answers and progress
   */
  function handleRetake() {
    if (!session) return;

    // In FUTURE can branch by session.source.
    const newSession = buildManualTestSession(session.questionsIds);
    setActiveTestSession(newSession);
    router.push("/test");
  }

  /**
   * handleClearSession provides a clean reset:
   * - Removes the active session from localStorage
   * - Sends user back to manual mode
   */
  function handleClearSession() {
    clearActiveTestSession();
    router.push("/study/manual");
  }

  /**
   * Guard rails:
   * If there is no session keep UX safe and explicit.
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
  const startedAt = session.startedAtIso;
  const finishedAt = session.finishedAtIso;

  return (
    <div className="space-y-8">
      {/* Executive summary / KPI block */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          This is a run summary generated locally in your browser. No personal answers
          are stored on the server.
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

        {/* KPI grid: small, scannable, high signal */}
        <div className="grid gap-3 md:grid-cols-4">
          <KpiCard label="Total questions" value={kpis.total} />
          <KpiCard label="Answered" value={kpis.answered} />
          <KpiCard label="Unanswered" value={kpis.unanswered} />
          <KpiCard label="Completion" value={`${kpis.completionPercent}%`} />
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
            Below is a per-question breakdown. Scoring (correct/incorrect) will be added
            next using normalization + fuzzy matching.
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

                {item.isMissingQuestion && (
                  <span className="rounded-md border border-amber-500/60 px-2 py-1 text-xs text-amber-300">
                    Missing from bank
                  </span>
                )}
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
 * If it grows, we can promote it into /components.
 */
function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
