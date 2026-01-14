// lib/text/similarity.ts

/**
 * levenshteinDistance computes edit distance between two strings.
 * It represents the minimum number of single-character edits needed
 * to transform one string into the other.
 *
 * Complexity:
 * - Time: O(aLen * bLen)
 * - Space: O(bLen) using a rolling array optimization
 *
 * For an MVP with short answers, this is more than enough.
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Early exits for trivial cases
  if (a === b) return 0;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // dp[j] will represent the edit distance between:
  // - prefix of "a" up to current i
  // - prefix of "b" up to j
  const dp = new Array<number>(bLen + 1);

  // Base case: transforming empty "a" into first j chars of "b"
  for (let j = 0; j <= bLen; j++) {
    dp[j] = j;
  }

  for (let i = 1; i <= aLen; i++) {
    let prevDiagonal = dp[0]; // dp[i-1][j-1] in a 2D matrix
    dp[0] = i; // dp[i][0] = i deletions

    for (let j = 1; j <= bLen; j++) {
      const temp = dp[j]; // dp[i-1][j] before we overwrite it

      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      // dp[j] currently holds dp[i-1][j]
      // dp[j-1] holds dp[i][j-1]
      // prevDiagonal holds dp[i-1][j-1]
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prevDiagonal + cost, // substitution
      );

      prevDiagonal = temp;
    }
  }

  return dp[bLen];
}

/**
 * similarityPercent returns an integer 0..100:
 * - 100 means identical strings
 * - 0 means completely different
 *
 * It uses normalized edit distance:
 * similarity = 1 - (distance / maxLen)
 */
export function similarityPercent(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);

  // If both are empty strings, treat as perfectly similar.
  if (maxLen === 0) return 100;

  const dist = levenshteinDistance(a, b);
  const similarity = 1 - dist / maxLen;

  // Clamp for safety and return a clean percentage.
  const percent = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
  return percent;
}
