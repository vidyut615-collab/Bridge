import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bridge - Truskill",
  description: "Internal operations platform for question bank inventory governance, atomic examination registry, and two-way deployment observability for Truskill.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
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
      <body className="min-h-full flex flex-col bg-zinc-100/70 dark:bg-[#0a0a0c] text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {children}
        </main>
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0e0e11]/70 backdrop-blur-xs py-4 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">BRIDGE</span>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-zinc-500 dark:text-zinc-400">OPERATIONS LEDGER</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 font-mono">
              <span>Assessment & Exam Infrastructure</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Truskill Operations</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
