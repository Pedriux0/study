// lib/text/evaluateAnswer.ts

import { appConfig } from "@/lib/config/appConfig";
import { normalizeAnswer } from "@/lib/text/normalizeAnswer";
import { similarityPercent } from "@/lib/text/similarity";

/**
 * AnswerEvaluationStatus is the simplest classification we need right now.
 * Later we can extend it with semantic AI validation.
 */
export type AnswerEvaluationStatus = "CORRECT" | "INCORRECT" | "UNANSWERED";

export interface AnswerEvaluationResult {
  status: AnswerEvaluationStatus;
  similarity: number; // 0..100
  normalizedUserAnswer: string;
  normalizedExpectedAnswer: string;
}

/**
 * evaluateAnswer compares userAnswer vs expectedAnswer using:
 * - normalization (case, accents, punctuation)
 * - Levenshtein similarity threshold
 *
 * This is NOT "semantic correctness" (AI can be plugged in later).
 */
export function evaluateAnswer(
  userAnswerRaw: string,
  expectedAnswerRaw: string,
): AnswerEvaluationResult {
  const normalizedUserAnswer = normalizeAnswer(userAnswerRaw);
  const normalizedExpectedAnswer = normalizeAnswer(expectedAnswerRaw);

  // If the user didn't provide content, it's unanswered.
  if (normalizedUserAnswer.length === 0) {
    return {
      status: "UNANSWERED",
      similarity: 0,
      normalizedUserAnswer,
      normalizedExpectedAnswer,
    };
  }

  const similarity = similarityPercent(normalizedUserAnswer, normalizedExpectedAnswer);

  const status: AnswerEvaluationStatus =
    similarity >= appConfig.similarityThresholdPercent ? "CORRECT" : "INCORRECT";

  return {
    status,
    similarity,
    normalizedUserAnswer,
    normalizedExpectedAnswer,
  };
}
