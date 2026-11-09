import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bridge | Internal Operations Platform — Powered by Truskill",
  description: "Internal assessment operations, question bank inventory, and deployment observability infrastructure for Truskill.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('truskill_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-5 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium tracking-tight text-zinc-900 dark:text-zinc-100">BRIDGE</span>
              <span className="text-zinc-400">/ INTERNAL OPERATIONS</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
              <span>Assessment & Exam Operations</span>
              <span>•</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-200">Powered by Truskill</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
