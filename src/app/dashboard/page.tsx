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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
              Operations Overview
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              IST Live
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Authenticated as <span className="text-zinc-900 dark:text-zinc-200 font-medium">{user?.name}</span> • Central register for inventory, exam naming, and platform sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121214] text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
            Question Bank
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            New Examination
          </Link>
        </div>
      </div>

      {/* External Platform Sync Required (Priority Banner) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#141416] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-mono font-bold">
                !
              </span>
              <span className="text-xs font-medium text-zinc-950 dark:text-zinc-100">
                External Platform Synchronization Required ({pendingPlatformUpdates.length})
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Action required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#18181b] border border-zinc-200/80 dark:border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {item.exam.generatedName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                    {item.testpressUpdatePending && (
                      <span className="text-zinc-900 dark:text-zinc-300">Testpress Pending</span>
                    )}
                    {item.testpressUpdatePending && item.lmsUpdatePending && <span>•</span>}
                    {item.lmsUpdatePending && (
                      <span className="text-zinc-900 dark:text-zinc-300">LMS Pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Sync <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono">
              <span>TOTAL INVENTORY</span>
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1.5">
              {formatNumber(totalQuestions)}
            </div>

            {/* Quiet visual distribution bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden flex mt-2.5">
              <div style={{ width: `${easyPct}%` }} title={`Easy ${easyPct}%`} className="bg-zinc-400 dark:bg-zinc-500 h-full" />
              <div style={{ width: `${medPct}%` }} title={`Medium ${medPct}%`} className="bg-zinc-700 dark:bg-zinc-300 h-full" />
              <div style={{ width: `${hardPct}%` }} title={`Hard ${hardPct}%`} className="bg-zinc-950 dark:bg-zinc-100 h-full" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{subjectsCount} active subjects</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-300">3 tiers</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 text-[11px] font-mono">
              TIER DISTRIBUTION
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2 font-mono text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-500 block">I Easy</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {formatNumber(totalEasy)}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{easyPct}%</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-500 block">II Med</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {formatNumber(totalMedium)}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{medPct}%</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] text-zinc-500 block">III Hard</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {formatNumber(totalHard)}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">{hardPct}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 truncate">
            {latestInventoryUpdate ? (
              <span>Last: {latestInventoryUpdate.topic.name} by {latestInventoryUpdate.changedByUser.name}</span>
            ) : (
              <span>No recorded inventory updates</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono">
              <span>EXAMINATION REGISTRY</span>
              <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1.5">
              {formatNumber(totalExams)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>{trainingExams} TR</span>
            <span>•</span>
            <span>{regularExams} RG</span>
            <span>•</span>
            <span>{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="bg-white dark:bg-[#121214] p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono">
              <span>DEPLOYMENT PIPELINE</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1.5">
              {formatNumber(completedExams)}
              <span className="text-xs font-normal text-zinc-500 ml-2">Completed</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>{readyForTestpress} Testpress</span>
            <span>{lmsPending} LMS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Question Bank Ledger & Recent Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Bank Summary Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Question Bank Inventory by Subject
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Aggregated tier counts across active subjects
              </p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              All subjects <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Subject</th>
                  <th className="py-2.5 px-4 text-right font-normal">I Easy</th>
                  <th className="py-2.5 px-4 text-right font-normal">II Med</th>
                  <th className="py-2.5 px-4 text-right font-normal">III Hard</th>
                  <th className="py-2.5 px-4 text-right font-medium text-zinc-950 dark:text-zinc-100">Total</th>
                  <th className="py-2.5 px-4 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {subjectsWithTopics.map((sub) => {
                  const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
                  const med = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
                  const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
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
                      <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-zinc-950 dark:text-zinc-50">
                        {formatNumber(total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
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
        <div className="bg-white dark:bg-[#121214] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs flex flex-col">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight">
                Operational Ledger
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Recent audit events</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              Full log <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="p-4 flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[460px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{act.changedByUser.name}</span>
                  <span className="font-mono text-[10px]">{formatDateKolkata(act.createdAt)}</span>
                </div>
                <p className="text-xs font-normal text-zinc-700 dark:text-zinc-300 leading-snug">
                  {act.changeDescription}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[9px]">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                    {act.entityType}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900 font-medium">
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
