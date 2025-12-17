// lib/storage/storageKeys.ts

/**
 * Centralized keys to keep storage names consistent and easy to migrate.
 */
export const storageKeys = {
    manualQuestionBank: "manualQuestionBank_v1",
    activeTestSession: "activeTestSession_v1",
    
} as const;

const STORAGE_KEY = storageKeys.manualQuestionBank;