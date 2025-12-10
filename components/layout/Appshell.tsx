// components\layout\Appshell.tsx

"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface AppShellProps{
    children: ReactNode ;
}

/**
 * The Appshell gives the main frames :
 * 
 *  Header with minimal navigation centered in content area
 * 
 *  Keeping simply and easy to read architecture so anyone can read it
 */

export default function AppShell({children} : AppShellProps){
    // declares the component as a function that expects a single props object matching the AppShellProps
    return (
        <div className = "min-h-screen flex flex-col bg-slate-950 text-slate-100">
            <header className="border-b border-slate-800">
                <div className="mx-aut max-w-5x1 px-4 py-3 flex items-center justify-between">
                    <Link href= "/" className = "font-semibold tracking-tight">
                        Try to study
                    </Link>
                    <nav>
                        <Link href = "/study/manual" className="hover: underline">
                         🚀 Manual  🚀
                        </Link>
                        <Link href = "/study/document" className="hover:underline">
                        Read Document 🎬 
                        </Link>
                        <Link href = "/study/demo" className="hover:underline">
                        ▶️Demo subsets 
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">
                <div className="mx auto max-w-5x1 px-4 py-8">
                    {children}
                </div>
            </main>
            <footer className="border-t boder-slate-800 py-3 text-center text-center text-xs text-slate-400">
                Self study -NO DATA IS SAVED !
            </footer>
        </div>
    );

}