// lib/config/appConfig.ts

/**
 * appConfig contains small global settings for the MVP.
 * Keeping them here avoids magic numbers across the codebase.
 *
 * IMPORTANT:
 * - This project optimizes for clarity over cleverness.
 * - Values are intentionally conservative and easy to tune.
 */
export const appConfig = {
  /**
   * Similarity threshold (0..100).
   * If a user's answer similarity >= this value, we consider it correct.
   *
   * 80 is a practical MVP default:
   * - tolerates small typos
   * - still expects the user to be conceptually close
   */
  similarityThresholdPercent: 80,
} as const;
