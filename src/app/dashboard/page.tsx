import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  ArrowUpRight,
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
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Operations overview
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-normal bg-[#f4f4f5] dark:bg-[#232325] text-zinc-600 dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08]">
              IST live
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Central register for question bank inventory, deterministic naming, and deployment status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#19191b] text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150"
          >
            <BookOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            Question bank
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New examination
          </Link>
        </div>
      </div>

      {/* External Platform Sync Required (Priority Banner) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#19191b] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08] mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                External platform synchronization required ({pendingPlatformUpdates.length})
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Action required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#f4f4f5] dark:bg-[#232325] border border-black/[0.08] dark:border-white/[0.08] text-xs"
              >
                <div>
                  <div className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {item.exam.generatedName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                    {item.testpressUpdatePending && (
                      <span className="text-zinc-800 dark:text-zinc-200">Testpress pending</span>
                    )}
                    {item.testpressUpdatePending && item.lmsUpdatePending && <span>•</span>}
                    {item.lmsUpdatePending && (
                      <span className="text-zinc-800 dark:text-zinc-200">LMS pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium h-7 px-2.5 rounded-md bg-white dark:bg-[#19191b] text-zinc-900 dark:text-zinc-100 border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150"
                >
                  Sync <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-normal">
              <span>Total inventory</span>
              <BookOpen className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2">
              {formatNumber(totalQuestions)}
            </div>

            {/* Proportional distribution gauge */}
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex mt-3">
              <div style={{ width: `${easyPct}%` }} title={`Easy ${easyPct}%`} className="bg-zinc-300 dark:bg-zinc-600 h-full" />
              <div style={{ width: `${medPct}%` }} title={`Medium ${medPct}%`} className="bg-zinc-500 dark:bg-zinc-400 h-full" />
              <div style={{ width: `${hardPct}%` }} title={`Hard ${hardPct}%`} className="bg-zinc-900 dark:bg-zinc-100 h-full" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span>{subjectsCount} active subjects</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-300">3 tiers</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 text-xs font-normal">
              Tier distribution
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-xs">
              <div>
                <span className="text-[11px] text-zinc-500 block">I Easy</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatNumber(totalEasy)}
                </span>
                <span className="text-[10px] text-zinc-400 block">{easyPct}%</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block">II Med</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatNumber(totalMedium)}
                </span>
                <span className="text-[10px] text-zinc-400 block">{medPct}%</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block">III Hard</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatNumber(totalHard)}
                </span>
                <span className="text-[10px] text-zinc-400 block">{hardPct}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-xs text-zinc-500 truncate">
            {latestInventoryUpdate ? (
              <span>Last: {latestInventoryUpdate.topic.name}</span>
            ) : (
              <span>No recorded inventory updates</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-normal">
              <span>Examination registry</span>
              <FileSpreadsheet className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2">
              {formatNumber(totalExams)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>{trainingExams} TR</span>
            <span>•</span>
            <span>{regularExams} RG</span>
            <span>•</span>
            <span>{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="bg-white dark:bg-[#19191b] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-xs font-normal">
              <span>Deployment pipeline</span>
              <CheckCircle2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="text-[28px] leading-none font-medium font-mono text-zinc-900 dark:text-zinc-100 tabular-nums mt-2 flex items-baseline gap-2">
              <span>{formatNumber(completedExams)}</span>
              <span className="text-xs font-normal text-zinc-500">completed</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>{readyForTestpress} Testpress</span>
            <span>{lmsPending} LMS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Question Bank Ledger & Recent Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Bank Summary Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Question bank inventory by subject
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Aggregated tier counts across active subjects
              </p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors duration-150"
            >
              All subjects <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f4f5] dark:bg-[#232325] text-[11px] font-mono text-zinc-500 border-b border-black/[0.08] dark:border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Subject</th>
                  <th className="py-2.5 px-4 text-right font-normal">I Easy</th>
                  <th className="py-2.5 px-4 text-right font-normal">II Med</th>
                  <th className="py-2.5 px-4 text-right font-normal">III Hard</th>
                  <th className="py-2.5 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">Total</th>
                  <th className="py-2.5 px-4 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {subjectsWithTopics.map((sub) => {
                  const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
                  const med = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
                  const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-3 px-4 font-normal text-zinc-900 dark:text-zinc-100">
                        {sub.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatNumber(easy)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatNumber(med)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatNumber(hard)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatNumber(total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center h-7 px-2.5 rounded-md text-xs font-medium bg-[#f4f4f5] dark:bg-[#232325] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-black/[0.08] dark:border-white/[0.08] transition-colors duration-150"
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

        {/* Recent Audit Activities (1 Column) */}
        <div className="bg-white dark:bg-[#19191b] rounded-xl border border-black/[0.08] dark:border-white/[0.08] flex flex-col">
          <div className="p-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Operational ledger
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Recent audit events</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors duration-150"
            >
              Full log <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="p-4 flex-1 divide-y divide-black/[0.04] dark:divide-white/[0.04] overflow-y-auto max-h-[460px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{act.changedByUser.name}</span>
                  <span className="font-mono text-[10px]">{formatDateKolkata(act.createdAt)}</span>
                </div>
                <p className="text-xs font-normal text-zinc-700 dark:text-zinc-300 leading-snug">
                  {act.changeDescription}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#f4f4f5] dark:bg-[#232325] text-zinc-600 dark:text-zinc-400 border border-black/[0.08] dark:border-white/[0.08]">
                    {act.entityType}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium">
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
