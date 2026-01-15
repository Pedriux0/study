import { normalizeAnswer } from "./normalizeAnswer";

/**
 * Common English stop words to filter out noise.
 * Kept small and simple for this MVP.
 */
const STOP_WORDS = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "is", "are", "was", "were", "has", "had"
]);

/**
 * extractKeywords
 * 
 * 1. Normalize text (lowercase, remove accents/punctuation)
 * 2. Split into words
 * 3. Filter out:
 *    - Stop words
 *    - Words shorter than 3 chars
 * 4. Deduplicate
 * 
 * @param text - The raw input text (e.g. expected answer)
 * @returns Array of unique, cleaned keywords
 */
export function extractKeywords(text: string): string[] {
    if (!text) return [];

    // Re-using existing normalization logic to strip punctuation/accents
    const normalized = normalizeAnswer(text);

    const words = normalized.split(" ");

    const keywords = words.filter((word) => {
        // 1. Length check
        if (word.length < 3) return false;

        // 2. Stop word check
        if (STOP_WORDS.has(word)) return false;

        return true;
    });

    // Deduplicate using Set and return array
    return Array.from(new Set(keywords));
}
