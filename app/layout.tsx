//App/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/Appshell";
import { Children } from "react";

//Brief description of what this is
export const metadata: Metadata ={
  title: "Study Experiment - MVP",
  description :
  "Open Source self-study projects , just a simple experiment remember this can have problems"
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
