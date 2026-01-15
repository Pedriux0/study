//features\manual-questions\useManualQuestionBank.ts

"use client";

import { useEffect, useState } from "react";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage/localStorageClient";
import type { Question } from "@/types/question";
import { Qahiri } from "next/font/google";

/**
 * 
 * STORAGE_KEY is the unique value in localStorage
 * "v1" in case that we need to update or change
 */

const STORAGE_KEY = "manualQuestionBank_v1";

/**
 * ManualQuestionBank is an alias (easy to read and manage)
 */
type ManualQuestionBank = Question[];

/**
 * createEmptyState returns the inital state for the question bank
 * This will help us to reduce the quantity of code and improves performance
 * eliminates the db crossing
 */
function createEmptyState(): ManualQuestionBank {
    return [];
}

/**
 * generateQuestionId creates id simple and unique usinf time and randominez
 * enough to avoid collision 
 */
function generateQuestionId(): string {
    return `(${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * useManualQuestionBank hook for managin questions
 * 
 * Use:
 *  -Load questions from the localStorage 
 *  -Provide simple op: +, update , delete , clearAll;
 *  -Make automatic changes to localStorage
 */
export function useManualQuestionBank() {
    const [questions, setQuestion] = useState<ManualQuestionBank>(createEmptyState);
    const [isLoaded, setItLoaded] = useState(false);

    //Load the initial state (only run on the client) "use client"
    useEffect(() => {
        const stored = loadFromLocalStorage<ManualQuestionBank>(
            STORAGE_KEY,
            createEmptyState(),
        );
        setQuestion(stored);
        setItLoaded(true);
    }, [])

    /**
     * change of quesitons 
     * this creates a new state to the localStorage
     */
    useEffect(() => {
        if (!isLoaded) return;
        saveToLocalStorage(STORAGE_KEY, questions);
    }, [questions, isLoaded]);
    /**
     * addQuestions creates a new one and add it to the list 
     **/
    function addQuestion(prompt: string, expectedAnswer: string) {
        const trimmedPrompt = prompt.trim();
        const trimmedAnswer = expectedAnswer.trim();

        if (!trimmedAnswer || !trimmedPrompt) {
            //Return simple validation (for now)
            return;
        }
        const newQuestion: Question = {
            id: generateQuestionId(),
            prompt: trimmedPrompt,
            expectedAnswer: trimmedAnswer,
            type: "open-text",
            source: "manual"
        };
        setQuestion((prev) => [...prev, newQuestion]);
    }
    /**
     * updateQuestion updates a question by id
     * if not found leaves it 
     */
    function updateQuestion(id: string, prompt: string, expectedAnswer: string) {
        const trimmedPrompt = prompt.trim();
        const trimmedAnswer = expectedAnswer.trim();

        setQuestion(prev =>
            prev.map(question => {
                if (question.id !== id) return question;

                const prompt = trimmedPrompt || question.prompt;
                const expectedAnswer = trimmedAnswer || question.expectedAnswer;
                //the ... let use the question to updated without droping the rest
                return { ...question, prompt, expectedAnswer };
            })
        );
    }
    /**(
     * deleteQuestions removes the questions from the bank using the id
    ) */
    function deleteQuestion(id: string) {
        setQuestion(previous =>
            previous.filter(question => question.id !== id)
        );
    }
    function clearAll() {
        setQuestion(createEmptyState());
    }
    return {
        questions,
        isLoaded,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        clearAll,
    };
}
