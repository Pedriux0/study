import Link from "next/link";

interface StudyModeCardProps {
    title: string;
    description: string;
    href: string;
}

/**
 * The study cards is small, focused in a single mode
 * Keeps the ModeSelector easy to read and growth
 */
function StudyModeCard({title ,description,href} : StudyModeCardProps){
    return(
        <Link 
        href = {href}
        className = "block rounded-x1 border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-lg font-semibold mb-1">
                {title}
            </h2>
            <p className="text-medium text-slate-300">
                {description}
            </p>
        </Link>
    );
}
/**
 * Mode Selector is the main entry point 
 * Gives 3 cores :
 * - Users Questions 
 * - Document info
 * - Demo questions set
 */
export default function ModeSelector(){
    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold mb-2">
                    Select Mode
                </h1>
                <p className="text-sm text-slate-300 max-w-xl">
                    <strong>Select the Mode to start to learn</strong>
                    <br/>
                    Option 1. Upload a PDF/Word
                    <br />
                    Option 2. Try premade questions sets (Not recommend for examns)
                    <br />
                    Option 3. Create your own exam (Questions and Answers)
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <StudyModeCard
                title= "Manual Questions"
                description = "Create your own examn, learn how"
                href= "/study/manual"
                />
                <StudyModeCard
                title= "Demo Questions set"
                description = "Use a prepared set"
                href = "/study/demo" />
            </div>
        </section>
    )
}