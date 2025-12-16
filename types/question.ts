// types/question.ts

/**
 * Source of the questions that descriebes where a questions comes from.
 * Keep the domain clean and easy to read: 
 *  -"manual": created by the user
 *  -"document" : generated from the upload file
 *  -"demo": predefined demo sets stored
 */
export type QuestionSource = "manual" | "document" | "demo";

/**
 * QuestionType for future expansions
 * MVP uses only "open text", keeping UI and logic simple
 */
export type QuestionType = "open-text";

/**
 * Question is the main domain entity for the project
 * Minimal specifications:
 * -id : unique identifier for list and op
 * -prompt : question for the user
 * -expectedAnswers: the "correct" answer to compare
 * -type : question type (open text)
 * -source: where it comes from
 * -tags: metada for grouping
 */

export interface Question{
    id:string; 
    prompt: string;
    expectedAnswer: string;
    type : QuestionType;
    source: QuestionSource;
    tags ?: string[];
}
/**
 * QuestionSet for documents and demos 
 * Predefined so the code can have good bases 
 */

export interface QuestionSet{
    id: string;
    name: string;
    description?: string;
    visibility: "system" | "demo";
    questions : Question[]
}