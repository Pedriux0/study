import { NextRequest, NextResponse } from "next/server";

// ==============================================================================
// POLYFILLS FOR PDF-PARSE (Node.js Environment)
// ==============================================================================
// 'pdf-parse' relies on 'pdfjs-dist', which expects certain browser APIs
// (DOMMatrix, ImageData, Path2D) to be present even when running in Node.js.
// These polyfills ensure stability during the build and runtime.
// ==============================================================================

// Polyfills for pdf-parse (pdfjs-dist) in Node environment
if (typeof Promise.withResolvers === 'undefined') {
    if (typeof Promise.withResolvers === 'undefined') {
        // @ts-expect-error Typescript might not know about withResolvers yet
        Promise.withResolvers = function () {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return { promise, resolve, reject };
        };
    }
}
if (typeof global.DOMMatrix === "undefined") {
    (global as any).DOMMatrix = class DOMMatrix { };
}
if (typeof global.ImageData === "undefined") {
    (global as any).ImageData = class ImageData {
        constructor(public width: number, public height: number) { }
    };
}
if (typeof global.Path2D === "undefined") {
    (global as any).Path2D = class Path2D { };
}

const pdf = require("pdf-parse"); // Using require to avoid TypeScript default export issues
import mammoth from "mammoth";

/**
 * POST /api/documents/extract
 * 
 * Public API route to handle document text extraction.
 * 
 * Features:
 * - Supports PDF (via pdf-parse) and DOCX (via mammoth)
 * - Sanitizes output (removes excess whitespace)
 * - Returns structured JSON with metadata
 * 
 * Note: This route is stateless. Files are processed in memory and never stored.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = "";

        // Determine file type and process
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload PDF or DOCX." },
                { status: 400 }
            );
        }

        // Sanitize: Collapse excess whitespace, trim
        const sanitized = extractedText
            .replace(/\s+/g, " ")
            .trim();

        return NextResponse.json({
            text: sanitized,
            characterCount: sanitized.length,
            fileName: file.name,
            fileType: file.type,
        });
    } catch (error) {
        console.error("Extraction error:", error);
        return NextResponse.json(
            { error: "Failed to extract text from document." },
            { status: 500 }
        );
    }
}
