import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Layers,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // 1. Fetch Question Bank metrics from topics
  const topics = await prisma.topic.findMany({
    where: { isArchived: false, subject: { isArchived: false } },
    include: { subject: true },
  });

  const subjectsWithTopics = await prisma.subject.findMany({
    where: { isArchived: false },
    include: {
      topics: {
        where: { isArchived: false },
      },
    },
    orderBy: { name: "asc" },
  });

  const subjectsCount = subjectsWithTopics.length;

  let totalQuestions = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;

  topics.forEach((t) => {
    totalQuestions += t.easyCount + t.mediumCount + t.hardCount;
    totalEasy += t.easyCount;
    totalMedium += t.mediumCount;
    totalHard += t.hardCount;
  });

  const easyPct = totalQuestions > 0 ? ((totalEasy / totalQuestions) * 100).toFixed(1) : "0";
  const medPct = totalQuestions > 0 ? ((totalMedium / totalQuestions) * 100).toFixed(1) : "0";
  const hardPct = totalQuestions > 0 ? ((totalHard / totalQuestions) * 100).toFixed(1) : "0";

  const latestInventoryUpdate = await prisma.topicInventoryHistory.findFirst({
    orderBy: { createdAt: "desc" },
    include: { topic: { include: { subject: true } }, changedByUser: true },
  });

  // 2. Fetch Examination metrics
  const totalExams = await prisma.exam.count();
  const globalExams = await prisma.exam.count({ where: { category: "GLOBAL" } });
  const trainingExams = await prisma.exam.count({ where: { category: "COLLEGE_TRAINING" } });
  const regularExams = await prisma.exam.count({ where: { category: "COLLEGE_REGULAR" } });

  const completedExams = await prisma.exam.count({ where: { overallStatus: "COMPLETED" } });
  const readyForTestpress = await prisma.exam.count({ where: { overallStatus: "READY_FOR_TESTPRESS" } });
  const lmsPending = await prisma.exam.count({ where: { overallStatus: "LMS_PENDING" } });

  // Examinations with outstanding external platform updates
  const pendingPlatformUpdates = await prisma.examPlatformStatus.findMany({
    where: {
      OR: [{ testpressUpdatePending: true }, { lmsUpdatePending: true }],
    },
    include: {
      exam: {
        include: { college: true },
      },
    },
  });

  // 3. Fetch Recent Activity
  const recentActivities = await prisma.auditLog.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { changedByUser: true },
  });

  return (
    <div className="space-y-8">
      {/* Top Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              Operations command
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              IST LIVE
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Central repository for question bank inventory, deterministic blueprint composition, and deployment pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors duration-150"
          >
            <BookOpen className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            <span>Question bank</span>
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span>New examination</span>
          </Link>
        </div>
      </div>

      {/* External Platform Sync Required (Priority Alert) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="craft-card p-5 border-amber-300/60 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/10">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-amber-900/30 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                External platform synchronization required ({pendingPlatformUpdates.length})
              </span>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
              Action required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-hairline)] text-sm"
              >
                <div>
                  <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                    {item.exam.generatedName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono mt-1">
                    {item.testpressUpdatePending && (
                      <span className="text-amber-600 dark:text-amber-400">Testpress sync pending</span>
                    )}
                    {item.testpressUpdatePending && item.lmsUpdatePending && <span>•</span>}
                    {item.lmsUpdatePending && (
                      <span className="text-amber-600 dark:text-amber-400">LMS sync pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md bg-[var(--bg-raised)] text-[var(--text-primary)] border border-[var(--border-hairline)] hover:bg-[var(--border-hairline)] transition-colors"
                >
                  <span>Sync</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="craft-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <span>Total inventory</span>
              <BookOpen className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-semibold font-mono text-[var(--text-primary)] tabular-nums mt-3">
              {formatNumber(totalQuestions)}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">questions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{subjectsCount} active subjects</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">{topics.length} topics</span>
          </div>
        </div>

        {/* Tier Distribution Gauge */}
        <div className="craft-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <span>Tier balance</span>
              <Layers className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 font-mono">
              <div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-sans">I Easy</span>
                <span className="text-base font-semibold text-[var(--text-primary)] tabular-nums">
                  {formatNumber(totalEasy)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">{easyPct}%</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-sans">II Med</span>
                <span className="text-base font-semibold text-[var(--text-primary)] tabular-nums">
                  {formatNumber(totalMedium)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">{medPct}%</span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-sans">III Hard</span>
                <span className="text-base font-semibold text-[var(--text-primary)] tabular-nums">
                  {formatNumber(totalHard)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">{hardPct}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] text-xs text-[var(--text-muted)] truncate font-mono">
            {latestInventoryUpdate ? (
              <span>Updated: {latestInventoryUpdate.topic.name}</span>
            ) : (
              <span>Ready for composition</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="craft-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <span>Exam specifications</span>
              <FileSpreadsheet className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-semibold font-mono text-[var(--text-primary)] tabular-nums mt-3">
              {formatNumber(totalExams)}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">registered</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>{trainingExams} Training</span>
            <span>•</span>
            <span>{regularExams} Regular</span>
            <span>•</span>
            <span>{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="craft-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <span>Deployment pipeline</span>
              <CheckCircle2 className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-semibold font-mono text-[var(--text-primary)] tabular-nums mt-3">
              {formatNumber(completedExams)}
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 ml-1.5 font-sans font-medium">live deployed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>{readyForTestpress} Testpress queue</span>
            <span>•</span>
            <span>{lmsPending} LMS queue</span>
          </div>
        </div>
      </div>

      {/* MOMENT: Question Bank Tier Spectrum Bar */}
      <div className="craft-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Master question bank tier spectrum
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Live difficulty distribution ratio across {formatNumber(totalQuestions)} active items in all subjects
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="text-[var(--text-secondary)]">Easy ({easyPct}%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              <span className="text-[var(--text-secondary)]">Medium ({medPct}%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              <span className="text-[var(--text-secondary)]">Hard ({hardPct}%)</span>
            </span>
          </div>
        </div>

        {/* Proportional continuous bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
          <div
            style={{ width: `${easyPct}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
            title={`Easy: ${formatNumber(totalEasy)} (${easyPct}%)`}
          />
          <div
            style={{ width: `${medPct}%` }}
            className="h-full bg-amber-500 transition-all duration-300"
            title={`Medium: ${formatNumber(totalMedium)} (${medPct}%)`}
          />
          <div
            style={{ width: `${hardPct}%` }}
            className="h-full bg-indigo-500 transition-all duration-300"
            title={`Hard: ${formatNumber(totalHard)} (${hardPct}%)`}
          />
        </div>

        {/* Subject Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {subjectsWithTopics.map((sub) => {
            const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
            const med = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
            const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
            const total = easy + med + hard;
            const subEasyPct = total > 0 ? ((easy / total) * 100).toFixed(0) : "0";
            const subMedPct = total > 0 ? ((med / total) * 100).toFixed(0) : "0";
            const subHardPct = total > 0 ? ((hard / total) * 100).toFixed(0) : "0";

            return (
              <Link
                key={sub.id}
                href={`/question-bank/${sub.id}`}
                className="craft-card-subtle p-3.5 hover:border-[var(--border-strong)] transition-all duration-150 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {sub.name}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-lg font-semibold font-mono text-[var(--text-primary)] tabular-nums mt-1">
                  {formatNumber(total)}
                  <span className="text-[11px] font-normal text-[var(--text-muted)] ml-1 font-sans">items</span>
                </div>
                {/* Mini bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800 mt-2">
                  <div style={{ width: `${subEasyPct}%` }} className="h-full bg-emerald-500" />
                  <div style={{ width: `${subMedPct}%` }} className="h-full bg-amber-500" />
                  <div style={{ width: `${subHardPct}%` }} className="h-full bg-indigo-500" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono mt-2">
                  <span>{sub.topics.length} topics</span>
                  <span>{subEasyPct}% / {subMedPct}% / {subHardPct}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Subject Detail Inventory & Recent Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Bank Detailed Summary Table (2 Columns) */}
        <div className="lg:col-span-2 craft-card overflow-hidden">
          <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Subject inventory matrix
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Atomic item breakdown by difficulty tiers
              </p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
            >
              <span>View all topics</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-raised)] text-xs font-mono text-[var(--text-muted)] border-b border-[var(--border-hairline)] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5 font-normal">Subject</th>
                  <th className="py-3 px-4 text-right font-normal">I Easy</th>
                  <th className="py-3 px-4 text-right font-normal">II Med</th>
                  <th className="py-3 px-4 text-right font-normal">III Hard</th>
                  <th className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">Total</th>
                  <th className="py-3 px-5 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {subjectsWithTopics.map((sub) => {
                  const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
                  const med = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
                  const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg-raised)] transition-colors duration-150">
                      <td className="py-3.5 px-5 font-medium text-[var(--text-primary)]">
                        {sub.name}
                        <span className="block text-xs font-mono text-[var(--text-muted)] font-normal mt-0.5">
                          {sub.topics.length} active topics
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatNumber(easy)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                        {formatNumber(med)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                        {formatNumber(hard)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                        {formatNumber(total)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center h-7 px-3 rounded-md text-xs font-medium bg-[var(--bg-raised)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-hairline)] transition-colors duration-150"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Audit Stream (1 Column) */}
        <div className="craft-card flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Operational audit ledger
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Immutable system events</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
            >
              <span>Audit stream</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="p-5 flex-1 divide-y divide-[var(--border-hairline)] overflow-y-auto max-h-[500px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span className="font-semibold text-[var(--text-primary)]">{act.changedByUser.name}</span>
                  <span className="font-mono text-[11px]">{formatDateKolkata(act.createdAt)}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {act.changeDescription}
                </p>
                <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                    {act.entityType.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium">
                    {act.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
