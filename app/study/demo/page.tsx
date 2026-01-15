"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildManualTestSession, setActiveTestSession } from "@/features/test-runner/testSessionStorage";
import { Question } from "@/types/question";
import { storageKeys } from "@/lib/storage/storageKeys";
import { saveToLocalStorage } from "@/lib/storage/localStorageClient";

const DEMO_QUESTIONS: Question[] = [
    {
        id: "demo_1",
        prompt: "What is the capital of France?",
        expectedAnswer: "Paris",
        createdAtIso: new Date().toISOString(),
    },
    {
        id: "demo_2",
        prompt: "Who wrote 'Romeo and Juliet'?",
        expectedAnswer: "William Shakespeare",
        createdAtIso: new Date().toISOString(),
    },
    {
        id: "demo_3",
        prompt: "What is 2 + 2?",
        expectedAnswer: "4",
        createdAtIso: new Date().toISOString(),
    },
    {
        id: "demo_4",
        prompt: "What is the largest planet in our solar system?",
        expectedAnswer: "Jupiter",
        createdAtIso: new Date().toISOString(),
    },
    {
        id: "demo_5",
        prompt: "What is the chemical symbol for Gold?",
        expectedAnswer: "Au",
        createdAtIso: new Date().toISOString(),
    }
];

export default function DemoStudyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    function handleStartDemo() {
        setIsLoading(true);
        // Save demo questions to manual bank so the Test runner can find them
        saveToLocalStorage(storageKeys.manualQuestionBank, DEMO_QUESTIONS);

        const questionsIds = DEMO_QUESTIONS.map((q) => q.id);
        const session = buildManualTestSession(questionsIds);
        setActiveTestSession(session);

        // Short timeout to ensure storage is preserved before navigation (sometimes helpful in rapid dev modes)
        setTimeout(() => {
            router.push("/test");
        }, 100);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold">Demo Questions Set</h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                    Try out the testing flow with these pre-made questions.
                </p>
            </section>

            <section className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">About this Demo</h2>
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                            <li>Includes {DEMO_QUESTIONS.length} sample questions</li>
                            <li>Covers General Knowledge</li>
                            <li>Does not require you to type questions manually</li>
                        </ul>
                    </div>

                    <p className="text-sm text-amber-200/80 bg-amber-900/20 p-3 rounded-md border border-amber-900/50">
                        Note: Starting this demo will overwrite your current Manual Question Bank.
                    </p>

                    <button
                        onClick={handleStartDemo}
                        disabled={isLoading}
                        className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "Starting..." : "Start Demo Test"}
                    </button>
                </div>
            </section>
        </div>
    );
}
