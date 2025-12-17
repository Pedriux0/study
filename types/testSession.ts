//types /testSession.ts
import type { QuestionSource } from "./question"; 
/**
 * TestSession is the representation of the test run 
 * 
 * Idea 
 *  -session lives in the browser 
 *  -nevers stores personal data
 */

export interface TestSession{
    id : string;

/**
 * Manual for the manual question bank 
 * Future features: 
 *  -document generated sets 
 *  -sets demo (MongoDB) simple examples common ones
 */

    source: QuestionSource;

    /**
     * A list ordened by ID for the test
     * avoiding depending of array indexes(can change of users edits)
     */
    questionsIds: string[];

    /**
     * Map the question id 
     * stored as raw input
     */
    answersByQuestios: Record<string,string>;
    /**
     * Pointer to the current question index
     */
    currentIndex: number;
    startedAtIso: string;
    finishedAtIso: string;
}