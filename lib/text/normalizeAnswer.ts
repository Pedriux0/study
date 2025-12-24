// lib/text/normalizeAnswer.ts

/**
 * normalizeAnswer prepares text for comparison.
 *
 * This function aims to make comparisons tolerant to:
 * - case differences
 * - accents (á, é, í, ó, ú)
 * - punctuation differences
 * - extra whitespace
 *
 * It does NOT attempt semantic understanding.
 */
export function normalizeAnswer(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withoutDiacritics = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lettersAndNumbers = withoutDiacritics.replace(/[^a-z0-9\s]/g, " ");
  const singleSpaced = lettersAndNumbers.replace(/\s+/g, " ").trim();
  return singleSpaced;
}

