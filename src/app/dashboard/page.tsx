import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Layers,
} from "lucide-react";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // 1. Fetch Question Bank metrics
  const subjects = await prisma.subject.findMany({
    where: { isArchived: false },
    include: {
      inventoryRecords: true,
    },
  });

  let totalQuestions = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;

  subjects.forEach((s) => {
    s.inventoryRecords.forEach((inv) => {
      totalQuestions += inv.questionCount;
      if (inv.difficultyLevel === "I_EASY") totalEasy += inv.questionCount;
      if (inv.difficultyLevel === "II_MEDIUM") totalMedium += inv.questionCount;
      if (inv.difficultyLevel === "III_HARD") totalHard += inv.questionCount;
    });
  });

  const latestInventoryUpdate = await prisma.inventoryHistory.findFirst({
    orderBy: { createdAt: "desc" },
    include: { subject: true, changedByUser: true },
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
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f1011] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#f7f8f8]">
              Assessment Operations & Observability
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828fff] border border-[#5e6ad2]/30">
              Live System
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8a8f98]">
            Welcome back, <strong className="text-slate-800 dark:text-[#d0d6e0] font-semibold">{user?.name}</strong>. Centralized internal register for Question Bank and Testpress/LMS deployments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#141516] text-xs font-medium text-slate-700 dark:text-[#d0d6e0] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#8a8f98]" />
            Update Inventory
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#5e6ad2] text-xs font-medium text-white hover:bg-[#6c76e0] shadow-[0_0_16px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.98] transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Examination
          </Link>
        </div>
      </div>

      {/* Outstanding Update Alerts (if any) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="rounded-xl border border-amber-300 dark:border-[#f0bf00]/30 bg-amber-50 dark:bg-[#f0bf00]/10 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-[#ffd500] font-semibold text-xs mb-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-[#f0bf00] shrink-0" />
            <span>Attention: External Platform Updates Required ({pendingPlatformUpdates.length})</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-[#ffd500]/80 mb-3">
            The following completed examinations have been modified internally. Staff must make the corresponding changes on Testpress or Truskill LMS and confirm them below:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#141516] border border-amber-200 dark:border-white/[0.06] text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-[#f7f8f8]">{item.exam.generatedName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8a8f98] mt-0.5">
                    {item.testpressUpdatePending && (
                      <span className="font-medium text-orange-600 dark:text-orange-400">• Testpress Update Pending</span>
                    )}
                    {item.lmsUpdatePending && (
                      <span className="font-medium text-amber-600 dark:text-amber-400">• LMS Update Pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5e6ad2] hover:text-[#7170ff]"
                >
                  Review <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Metric Cards (Linear KPI Strip) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider mb-1">
            <span>Total Questions</span>
            <BookOpen className="h-3.5 w-3.5 text-[#5e6ad2]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f7f8f8] tabular-nums">
            {formatNumber(totalQuestions)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-[#8a8f98]">
            <span>{subjects.length} active subjects</span>
            <span className="font-mono text-[#5e6ad2]">3 Difficulty Tiers</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider mb-1">
            <span>Difficulty Breakdown</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#27a644]" />
          </div>
          <div className="flex items-center gap-3 mt-1 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#8a8f98] block">Easy (I)</span>
              <span className="text-sm font-bold text-[#27a644] tabular-nums">{formatNumber(totalEasy)}</span>
            </div>
            <div className="border-l border-slate-200 dark:border-white/[0.08] pl-3">
              <span className="text-[10px] uppercase text-[#8a8f98] block">Med (II)</span>
              <span className="text-sm font-bold text-[#f0bf00] tabular-nums">{formatNumber(totalMedium)}</span>
            </div>
            <div className="border-l border-slate-200 dark:border-white/[0.08] pl-3">
              <span className="text-[10px] uppercase text-[#8a8f98] block">Hard (III)</span>
              <span className="text-sm font-bold text-[#eb5757] tabular-nums">{formatNumber(totalHard)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-[#8a8f98] truncate">
            {latestInventoryUpdate ? (
              <span>Last: {latestInventoryUpdate.subject.name} by {latestInventoryUpdate.changedByUser.name}</span>
            ) : (
              <span>No updates yet</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider mb-1">
            <span>Examinations</span>
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#f7f8f8] tabular-nums">
            {formatNumber(totalExams)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05] flex items-center gap-2 text-[11px] text-[#8a8f98]">
            <span className="font-semibold text-blue-500">{trainingExams} TR</span>
            <span>•</span>
            <span className="font-semibold text-purple-400">{regularExams} RG</span>
            <span>•</span>
            <span>{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="bg-white dark:bg-[#0f1011] p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider mb-1">
            <span>Deployment</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[#27a644]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#27a644] tabular-nums">
            {formatNumber(completedExams)}
            <span className="text-xs font-normal text-[#8a8f98] ml-1.5">Completed</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-[#8a8f98]">
            <span className="text-[#f0bf00] font-medium">{readyForTestpress} Testpress Pending</span>
            <span className="text-blue-400 font-medium">{lmsPending} LMS Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Question Bank Summary Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Bank Summary Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1011] rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f7f8f8]">Question Bank Inventory Overview</h2>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">Subject-wise inventory and Roman numeral difficulty distribution</p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-semibold text-[#5e6ad2] hover:text-[#7170ff] flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#141516] text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] border-b border-slate-200 dark:border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3.5">Subject</th>
                  <th className="py-2.5 px-3.5 text-right">Easy (I)</th>
                  <th className="py-2.5 px-3.5 text-right">Medium (II)</th>
                  <th className="py-2.5 px-3.5 text-right">Hard (III)</th>
                  <th className="py-2.5 px-3.5 text-right font-bold text-slate-900 dark:text-[#f7f8f8]">Total</th>
                  <th className="py-2.5 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {subjects.map((sub) => {
                  const easy = sub.inventoryRecords.find((i) => i.difficultyLevel === "I_EASY")?.questionCount || 0;
                  const med = sub.inventoryRecords.find((i) => i.difficultyLevel === "II_MEDIUM")?.questionCount || 0;
                  const hard = sub.inventoryRecords.find((i) => i.difficultyLevel === "III_HARD")?.questionCount || 0;
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-900 dark:text-[#f7f8f8]">
                        {sub.name}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[#27a644]">
                        {formatNumber(easy)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[#f0bf00]">
                        {formatNumber(med)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-[#eb5757]">
                        {formatNumber(hard)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-[#f7f8f8]">
                        {formatNumber(total)}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#d0d6e0] hover:text-[#5e6ad2] transition"
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
        <div className="bg-white dark:bg-[#0f1011] rounded-xl border border-slate-200 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f7f8f8]">Recent Activity</h2>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">Traceable audit stream</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-semibold text-[#5e6ad2] hover:text-[#7170ff] flex items-center gap-1"
            >
              Full Log <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-3 flex-1 divide-y divide-slate-100 dark:divide-white/[0.04] overflow-y-auto max-h-[480px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-[11px] text-[#8a8f98] mb-0.5">
                  <span className="font-medium text-slate-800 dark:text-[#d0d6e0]">{act.changedByUser.name}</span>
                  <span className="font-mono text-[10px]">{formatDateKolkata(act.createdAt)}</span>
                </div>
                <p className="text-xs font-normal text-slate-800 dark:text-[#f7f8f8] leading-snug">
                  {act.changeDescription}
                </p>
                <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] uppercase tracking-wider">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.05] text-[#8a8f98] border border-slate-200 dark:border-white/[0.06]">
                    {act.entityType}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828fff] border border-[#5e6ad2]/20">
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
