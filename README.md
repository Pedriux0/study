# Self-Study Platform (MVP)

A local-first, privacy-focused application for self-guided learning and testing. 
Designed to run entirely in the browser using Next.js, with zero server-side persistence of personal data.

## Problems Solved
- **Privacy**: Study data (questions, answers, document text) never leaves your machine.
- **Focus**: A clean, distraction-free environment for reading and testing.
- **Flexibility**: Create your own questions or extract them from your study documents (PDF/DOCX).

## Features
- **Manual Mode**: Create and manage your own bank of questions.
- **Demo Mode**: Try the platform with a pre-loaded "General Knowledge" question set.
- **Document Mode**: Upload PDF/DOCX files to read text and instantly create questions.
- **Test Runner**: Take quizzes with immediate feedback and scoring.
- **Results & Review**: See detailed KPIs (Accuracy, Completion) and review answers with auto-generated learning links (Google, Wikipedia, YouTube).

## Philosophy
- **Local-First**: All application state uses `localStorage`. The server is stateless, used only for document text extraction routes.
- **No AI / No LLMs**: This project uses deterministic logic (Levenshtein distance) for string comparison and similarity scoring. It is fast, predictable, and runs offline.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Persistence**: Browser `localStorage`

### Key Directories
- `app/`: Next.js App Router pages and API routes.
- `components/`: UI building blocks (using functional React components).
- `features/`: Core business logic (Question Bank, Test Runner).
- `lib/`: Utilities for text processing, storage, and configuration.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## Recent Changes & Improvements
- **Document Reading**: Added support for uploading and extracting text from PDF and DOCX files.
- **Keyword Extraction**: Implemented deterministic keyword extraction to identify key concepts in questions.
- **Learning Links**: Automatically generated search links (Google, Wikipedia, YouTube) for extracted keywords.
- **Codebase Polish**: Standardized interfaces, fixed types, and resolved build dependencies for Node.js environments.

## Future Improvements (Roadmap)
While this MVP is feature-complete, future iterations could include:
- **AI Integration**: Replace deterministic keyword extraction with LLM-based analysis for deeper insights.
- **Cloud Persistence**: Add optional server-side storage to sync progress across devices.
- **Spaced Repetition**: Implement an algorithm (e.g., SM-2) to schedule reviews based on performance.
- **Mobile Support**: Adapt the UI for a native-like experience on mobile devices.

## License
MIT License. See [LICENSE](LICENSE) for details.
