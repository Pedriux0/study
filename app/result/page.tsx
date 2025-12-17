// app/results/page.tsx
"use client";

import Link from "next/link";
import { getActiveTestSession } from "@/features/test-runner/testSessionStorage";

/**
 * ResultsPage
 *
 *  will compute KPIs
 */

export default function ResultsPage() {
  const session = getActiveTestSession();
 return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Results</h1>

      {!session?.finishedAtIso ? (
        <p className="text-sm text-slate-300">
          No finished test session found. Start a test from manual mode.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            Session finished successfully. Next step: compute scoring, KPIs, and keyword extraction.
          </p>
          <p className="text-xs text-slate-400">
            Finished at: {session.finishedAtIso}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href="/study/manual"
          className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Back to manual mode
        </Link>

        <Link
          href="/"
          className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Home
        </Link>
      </div>
    </div>
  );
}