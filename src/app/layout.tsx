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
  title: "Bridge — Assessment Operations & Observability",
  description: "Internal operations platform for question bank inventory governance, atomic examination registry, and two-way deployment observability for Truskill.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      <body className="min-h-full flex flex-col bg-[#fafafa] dark:bg-[#141415] text-[#171717] dark:text-[#ededed] font-sans antialiased">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#19191b] py-3 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Bridge</span>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-zinc-500 dark:text-zinc-400">Operations Ledger</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 font-mono">
              <span>Assessment and examination infrastructure</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Truskill Ops</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
