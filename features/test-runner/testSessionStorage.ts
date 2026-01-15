// features/test-runner/testSessionStorage.ts

"use client";

import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/storage/localStorageClient";
import { storageKeys } from "@/lib/storage/storageKeys";
import type { TestSession } from "@/types/testSession";
/**(
 * createSessionId create a small id unique
) */
function createSessionid(): string{
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).slice(2, 8);
    return `ts_${timestamp}_${randomHex}`;
}
/**
 * buildManualTestSession create new session form the list of questions 
 */
export function buildManualTestSession(questionsIds:string[]) : TestSession{
    return {
        id: createSessionid(),
        source: "manual",
        questionsIds,
        answersByQuestions: {},
        currentIndex: 0,
        startedAtIso: new Date().toISOString(),
        finishedAtIso:"",
    };
    }
    /**
     * getActiveTestSession load the currently session
     * Return null if not active
     */
export function getActiveTestSession():TestSession |null{
    return loadFromLocalStorage<TestSession | null>(storageKeys.activeTestSession,null)

}
/**
 * clearActiveTestSession detele the session by overwrite
 */
export function clearActiveTestSession(): void{
    saveToLocalStorage(storageKeys.activeTestSession, null)
}
/**
 * setActiveTestSession stoys in the localStorage
 * called when to start or update 
 */
export function setActiveTestSession(session: TestSession){
    saveToLocalStorage(storageKeys.activeTestSession,session);
}
