import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
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

  // Examinations with outstanding external updates
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
      {/* Page Header — Flat, Minimalist, No outer box */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Bridge Operations & Observability
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Internal Platform
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Signed in as <span className="text-zinc-900 dark:text-zinc-100 font-medium">{user?.name}</span> • Centralized register for Question Bank and Testpress/LMS deployments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
            Manage Inventory
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Examination
          </Link>
        </div>
      </div>

      {/* Outstanding Update Alerts (if any) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4">
          <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-semibold text-xs mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
            </span>
            <span>External Platform Updates Required ({pendingPlatformUpdates.length})</span>
          </div>
          <p className="text-[12px] text-zinc-600 dark:text-zinc-400 mb-3">
            Completed examinations modified internally. Corresponding updates on Testpress or Truskill LMS must be performed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.exam.generatedName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                    {item.testpressUpdatePending && (
                      <span className="font-mono text-zinc-900 dark:text-zinc-200">• Testpress Pending</span>
                    )}
                    {item.lmsUpdatePending && (
                      <span className="font-mono text-zinc-900 dark:text-zinc-200">• LMS Pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 transition"
                >
                  Review <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-1">
              <span>Total Questions</span>
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1">
              {formatNumber(totalQuestions)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{subjectsCount} active subjects</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-300">3 Tiers</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-1">
              <span>Inventory by Tier</span>
              <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2 font-mono text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] uppercase text-zinc-500 block">Easy (I)</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{formatNumber(totalEasy)}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] uppercase text-zinc-500 block">Med (II)</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{formatNumber(totalMedium)}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg text-center border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="text-[10px] uppercase text-zinc-500 block">Hard (III)</span>
                <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{formatNumber(totalHard)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 truncate">
            {latestInventoryUpdate ? (
              <span>Last: {latestInventoryUpdate.topic.name} by {latestInventoryUpdate.changedByUser.name}</span>
            ) : (
              <span>No updates yet</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-1">
              <span>Examinations</span>
              <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1">
              {formatNumber(totalExams)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="font-mono text-zinc-900 dark:text-zinc-300">{trainingExams} TR</span>
            <span>•</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-300">{regularExams} RG</span>
            <span>•</span>
            <span className="font-mono">{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="bg-white dark:bg-zinc-900/70 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase tracking-wider mb-1">
              <span>Deployment</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl font-semibold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight tabular-nums mt-1">
              {formatNumber(completedExams)}
              <span className="text-xs font-normal text-zinc-500 ml-2">Completed</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{readyForTestpress} Testpress Pending</span>
            <span>{lmsPending} LMS Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Question Bank Summary Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Bank Summary Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Question Bank Inventory Overview</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Subject-wise inventory and Roman numeral difficulty distribution</p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Subject</th>
                  <th className="py-2.5 px-4 text-right font-medium">Easy (I)</th>
                  <th className="py-2.5 px-4 text-right font-medium">Medium (II)</th>
                  <th className="py-2.5 px-4 text-right font-medium">Hard (III)</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-zinc-950 dark:text-zinc-100">Total</th>
                  <th className="py-2.5 px-4 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {subjectsWithTopics.map((sub) => {
                  const easy = sub.topics.reduce((acc, t) => acc + t.easyCount, 0);
                  const med = sub.topics.reduce((acc, t) => acc + t.mediumCount, 0);
                  const hard = sub.topics.reduce((acc, t) => acc + t.hardCount, 0);
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {sub.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                        {formatNumber(easy)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                        {formatNumber(med)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                        {formatNumber(hard)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                        {formatNumber(total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
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
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col">
          <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Recent Activity</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Traceable audit stream</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
            >
              Full Log <ArrowRight className="h-3 w-3" />
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
                <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[9px] uppercase tracking-wider">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                    {act.entityType}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium">
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
