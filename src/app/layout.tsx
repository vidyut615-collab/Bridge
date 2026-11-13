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
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] font-sans antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-card)] py-4 text-xs">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-semibold text-[var(--text-primary)] tracking-tight">BRIDGE</span>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-secondary)]">ASSESSMENT INFRASTRUCTURE</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-3 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems nominal</span>
              </span>
              <span>•</span>
              <span className="text-[var(--text-secondary)]">Truskill Assessment Operations</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
