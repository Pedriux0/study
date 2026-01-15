"use client";

import { useState } from "react";
import Link from "next/link";
import { useManualQuestionBank } from "@/features/manual-questions/useManualQuestionBank";
import mammoth from "mammoth";

interface ExtractedData {
    text: string;
    characterCount: number;
    fileName: string;
    fileType: string;
}

/**
 * DocumentStudyPage Component (Client-Side Version)
 * 
 * Adapted for GitHub Pages (Static Export).
 * Removing server-side API dependencies.
 * 
 * Capabilities:
 * - DOCX: Handled via 'mammoth' in browser.
 * - PDF: Not supported in static version (requires heavy worker).
 * - TXT/MD: Handled via FileReader.
 */
export default function DocumentStudyPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Question form state
    const [prompt, setPrompt] = useState("");
    const [expectedAnswer, setExpectedAnswer] = useState("");
    const [questionAddedMsg, setQuestionAddedMsg] = useState("");

    const { addQuestion } = useManualQuestionBank();

    async function handleUpload() {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            let text = "";

            if (file.name.endsWith(".docx")) {
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
                text = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
            } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                throw new Error("PDF parsing is not supported in the live demo version. Please use DOCX or TXT.");
            } else {
                throw new Error("Unsupported file type. Please use DOCX or TXT.");
            }

            // Sanitize
            const sanitized = text.replace(/\s+/g, " ").trim();

            setExtracted({
                text: sanitized,
                characterCount: sanitized.length,
                fileName: file.name,
                fileType: file.type
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to extract text");
        } finally {
            setIsUploading(false);
        }
    }

    function handleAddQuestion() {
        if (!prompt.trim() || !expectedAnswer.trim()) return;

        addQuestion(prompt, expectedAnswer);
        setPrompt("");
        setExpectedAnswer("");
        setQuestionAddedMsg("Question added to manual bank!");
        setTimeout(() => setQuestionAddedMsg(""), 3000);
    }

    function handleClear() {
        setFile(null);
        setExtracted(null);
        setError(null);
    }

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
                    ← Back to Home
                </Link>
                <h1 className="text-2xl font-semibold">Study Document</h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                    Upload a PDF or DOCX file to extract text. You can then read the content and
                    create questions for your study bank directly from here.
                </p>
            </section>

            {/* Upload Section */}
            {!extracted && (
                <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                        📄
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                            Upload Study Material
                        </label>
                        <input
                            type="file"
                            accept=".pdf, .docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full max-w-xs mx-auto text-sm text-slate-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-slate-800 file:text-slate-200
                                hover:file:bg-slate-700"
                        />
                        <p className="text-xs text-slate-500">
                            Supported formats: DOCX, TXT (PDF disabled in demo)
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 bg-red-900/20 py-2 px-4 rounded inline-block">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUploading ? "Extracting..." : "Start Studying"}
                    </button>
                </section>
            )}

            {/* Study Interface */}
            {extracted && (
                <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-200px)]">
                    {/* Left: Text Preview */}
                    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                        <header className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/50">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">
                                    {extracted.fileName}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {extracted.characterCount} characters
                                </p>
                            </div>
                            <button
                                onClick={handleClear}
                                className="text-xs text-slate-400 hover:text-white underline"
                            >
                                Close File
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-serif">
                            {extracted.text}
                        </div>
                    </section>

                    {/* Right: Question Creator */}
                    <section className="flex flex-col space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                            <h2 className="text-lg font-semibold">Create Question</h2>
                            <p className="text-xs text-slate-400">
                                Read the text and formulate questions to test yourself later.
                            </p>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">Question Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm focus:border-sky-500 outline-none"
                                        rows={3}
                                        placeholder="e.g. What is the main argument of this text?"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-400">Expected Answer</label>
                                    <textarea
                                        value={expectedAnswer}
                                        onChange={(e) => setExpectedAnswer(e.target.value)}
                                        className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm focus:border-sky-500 outline-none"
                                        rows={2}
                                        placeholder="Key points to remember..."
                                    />
                                </div>

                                <button
                                    onClick={handleAddQuestion}
                                    className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                                >
                                    Add to Question Bank
                                </button>

                                {questionAddedMsg && (
                                    <p className="text-xs text-emerald-400 text-center animate-pulse">
                                        {questionAddedMsg}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                            <h3 className="text-sm font-semibold mb-2">Next Steps</h3>
                            <div className="space-y-2">
                                <Link
                                    href="/study/manual"
                                    className="block w-full text-center rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                                >
                                    Review All Questions
                                </Link>
                                <Link
                                    href="/test"
                                    className="block w-full text-center rounded-md bg-emerald-600/20 border border-emerald-600/50 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
                                >
                                    Start Test Session
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
