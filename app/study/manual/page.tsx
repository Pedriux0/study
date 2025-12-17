// app\study\manual\page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useManualQuestionBank } from "@/features/manual-questions/useManualQuestionBank";

/**
 *
 * ManualStudyPage is the main point for the manual mode
 *  -Display the questions and allows us to create and edit
 *  -Show us the current list of stored questions in the LocalStorage
 *  -Allow deleting and clearing the Bank
 *
 * Intentionally simple UI and labels for better readability
 */

export default function ManualStudyPage() {
    const { questions, isLoaded, addQuestion, updateQuestion, deleteQuestion, clearAll } =
        useManualQuestionBank();

    // Local state for the form fields
    const [prompt, setPrompt] = useState("");
    const [expectedAnswers, setExpectedAnswers] = useState("");
    const [editQuestionId, setEditQuestionId] = useState<string | null>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editQuestionId) {
            updateQuestion(editQuestionId, prompt, expectedAnswers);
        } else {
            addQuestion(prompt, expectedAnswers);
        }
        setPrompt("");
        setExpectedAnswers("");
        setEditQuestionId(null);
    }

    function handleEditClick(id: string) {
        const questionToEdit = questions.find((question) => question.id === id);
        if (!questionToEdit) return;

        setPrompt(questionToEdit.prompt);
        setExpectedAnswers(questionToEdit.expectedAnswer);
        setEditQuestionId(questionToEdit.id);
    }
    function handleCancelEdit(){
        setPrompt("");
        setExpectedAnswers("");
        setEditQuestionId(null);
    }
    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold">Manual Questions</h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                    Use this page to create your personal bank of questions. All the questions are
                    stored locally in your browser: <strong>LocalStorage</strong>. The server never
                    receives this data.
                </p>
            </section>

            <section className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Prompt</label>
                        <input
                            className="w-full rounded border border-slate-700 bg-transparent px-3 py-2 text-sm"
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Write your question"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Expected answer</label>
                        <input
                            className="w-full rounded border border-slate-700 bg-transparent px-3 py-2 text-sm"
                            value={expectedAnswers}
                            onChange={(event) => setExpectedAnswers(event.target.value)}
                            placeholder="What should the answer look like?"
                        />
                        <p className="text-xs text-slate-400">
                            This by used for later test run and function to check your answer
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                        type = "submit"
                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium"
                        >
                            {editQuestionId ? "Save changes" : "Add questions"}
                        </button>

                        {editQuestionId && (
                            <button
                            type = "button"
                            onClick = {handleCancelEdit}
                            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium">
                            Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>
            {/*Question list: shows current state of the manual bank*/}
            <section className="space-y-3">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Your manual Questions
                        </h2>

                        <p className="text-xs text-slate-400">
                            These question are local you can edit or delete them
                        </p>
                    </div>

                    {questions.length >0 &&(
                        <button
                        type= "button"
                        onClick={clearAll}
                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium">
                            Clear All
                        </button>
                    )
                    }
                </header>
                {isLoaded && questions.length === 0 &&(
                    <p className="text-sm text-slate-400">
                        You dont have questions yet
                    </p>
                )}
                {isLoaded && questions.length > 0 &&(
                    <ul className="space-y-2">
                        {questions.map((questions)=>(
                            <li
                            key = {questions.id}
                            className="rounded-lg border border-slate-800"
                            >
                                <div className="flex items justify between gap-3 py-5">
                                    <p>
                                    <span className="font-semibold">Expected answer :</span>{
                                    "  "}
                                    {questions.expectedAnswer}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button 
                                    type ="button"
                                    onClick={()=>
                                        handleEditClick(questions.id)}
                                    className="rounded-md border border-slate-600 py-2">Edit</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button 
                                    type ="button"
                                    onClick={()=>
                                        deleteQuestion(questions.id)}
                                    className="rounded-md border border-slate-600 py-2">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
