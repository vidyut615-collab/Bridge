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
  Shield,
  Layers,
  PlusCircle,
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
    <div className="space-y-8">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Operational Observability Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Live State
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Here is the current status of question inventory and assessment deployments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <BookOpen className="h-4 w-4 text-slate-500" />
            Update Inventory
          </Link>
          <Link
            href="/examinations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            Add Examination
          </Link>
        </div>
      </div>

      {/* Outstanding Update Alerts (if any) */}
      {pendingPlatformUpdates.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-semibold mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Attention: External Platform Updates Required ({pendingPlatformUpdates.length})</span>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            The following completed examinations have been modified internally. Staff must make the corresponding changes on Testpress or Truskill LMS and confirm them below:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingPlatformUpdates.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200/90 text-sm"
              >
                <div>
                  <div className="font-semibold text-slate-900">{item.exam.generatedName}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {item.testpressUpdatePending && (
                      <span className="font-medium text-orange-600">• Testpress Update Pending</span>
                    )}
                    {item.lmsUpdatePending && (
                      <span className="font-medium text-amber-700">• LMS Update Pending</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/examinations/${item.exam.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Review <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Questions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Questions</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {formatNumber(totalQuestions)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{subjects.length} active subjects</span>
            <span className="font-medium text-indigo-600">3 Difficulty Tiers</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Difficulty Breakdown</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Level I</span>
              <div className="text-base font-bold text-emerald-700">{formatNumber(totalEasy)}</div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[11px] font-semibold text-slate-500">Level II</span>
              <div className="text-base font-bold text-amber-700">{formatNumber(totalMedium)}</div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[11px] font-semibold text-slate-500">Level III</span>
              <div className="text-base font-bold text-red-700">{formatNumber(totalHard)}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 truncate">
            {latestInventoryUpdate ? (
              <span>Last: {latestInventoryUpdate.subject.name} by {latestInventoryUpdate.changedByUser.name}</span>
            ) : (
              <span>No updates yet</span>
            )}
          </div>
        </div>

        {/* Registered Examinations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Examinations</span>
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {formatNumber(totalExams)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-blue-600">{trainingExams} TR</span>
            <span>•</span>
            <span className="font-semibold text-purple-600">{regularExams} RG</span>
            <span>•</span>
            <span className="font-semibold text-slate-600">{globalExams} Global</span>
          </div>
        </div>

        {/* Operational Deployment Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Deployment Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {formatNumber(completedExams)}
            <span className="text-sm font-medium text-slate-400 ml-1.5">Completed</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-amber-600 font-medium">{readyForTestpress} Testpress Pending</span>
            <span className="text-blue-600 font-medium">{lmsPending} LMS Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Question Bank Summary Table & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Bank Summary Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Question Bank Inventory Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Subject-wise inventory and Roman numeral difficulty distribution</p>
            </div>
            <Link
              href="/question-bank"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Easy (I)</th>
                  <th className="py-3 px-4 text-right">Medium (II)</th>
                  <th className="py-3 px-4 text-right">Hard (III)</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900">Total</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const easy = sub.inventoryRecords.find((i) => i.difficultyLevel === "I_EASY")?.questionCount || 0;
                  const med = sub.inventoryRecords.find((i) => i.difficultyLevel === "II_MEDIUM")?.questionCount || 0;
                  const hard = sub.inventoryRecords.find((i) => i.difficultyLevel === "III_HARD")?.questionCount || 0;
                  const total = easy + med + hard;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {sub.name}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-700 font-medium">
                        {formatNumber(easy)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-700 font-medium">
                        {formatNumber(med)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-red-700 font-medium">
                        {formatNumber(hard)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatNumber(total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/question-bank/${sub.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Traceable audit stream</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full Log <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[480px]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{act.changedByUser.name}</span>
                  <span>{formatDateKolkata(act.createdAt)}</span>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {act.changeDescription}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {act.entityType}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
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
