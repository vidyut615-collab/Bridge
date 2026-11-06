import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ArrowRight, Layers, Folder, Clock, User, AlertCircle } from "lucide-react";
import { formatDateKolkata, formatNumber } from "@/lib/utils";

export default async function QuestionBankPage() {
  const subjects = await prisma.subject.findMany({
    where: { isArchived: false },
    include: {
      inventoryRecords: true,
      inventoryHistories: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { changedByUser: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate totals
  let grandTotal = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;

  const rows = subjects.map((sub, idx) => {
    const easyRecord = sub.inventoryRecords.find((i) => i.difficultyLevel === "I_EASY");
    const mediumRecord = sub.inventoryRecords.find((i) => i.difficultyLevel === "II_MEDIUM");
    const hardRecord = sub.inventoryRecords.find((i) => i.difficultyLevel === "III_HARD");

    const easy = easyRecord?.questionCount || 0;
    const medium = mediumRecord?.questionCount || 0;
    const hard = hardRecord?.questionCount || 0;
    const total = easy + medium + hard;

    grandTotal += total;
    totalEasy += easy;
    totalMedium += medium;
    totalHard += hard;

    const latestHistory = sub.inventoryHistories[0];

    return {
      no: idx + 1,
      id: sub.id,
      name: sub.name,
      easy,
      easyFolder: easyRecord?.folderName || "—",
      medium,
      mediumFolder: mediumRecord?.folderName || "—",
      hard,
      hardFolder: hardRecord?.folderName || "—",
      total,
      lastUpdated: latestHistory?.createdAt,
      lastUpdatedBy: latestHistory?.changedByUser?.name || "System",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Question Bank Observability</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active Inventory
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Subject-wise aggregate question counts, folder associations, and difficulty distribution (Roman tiers I, II, III).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Questions</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatNumber(grandTotal)}</div>
          <div className="text-[11px] text-slate-400 mt-1">{subjects.length} Subjects</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Easy (Level I)</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{formatNumber(totalEasy)}</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {grandTotal > 0 ? `${((totalEasy / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Medium (Level II)</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{formatNumber(totalMedium)}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            {grandTotal > 0 ? `${((totalMedium / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/20">
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wider">Hard (Level III)</div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{formatNumber(totalHard)}</div>
          <div className="text-[11px] text-red-600 mt-1">
            {grandTotal > 0 ? `${((totalHard / grandTotal) * 100).toFixed(1)}%` : "0%"} of total
          </div>
        </div>
      </div>

      {/* Consolidated Inventory Table (PRD Section 5.6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Subject Inventory Register</h2>
          <span className="text-xs text-slate-500">Click &quot;Update Counts&quot; to modify any subject</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-right">Easy (I)</th>
                <th className="py-3 px-4 text-right">Medium (II)</th>
                <th className="py-3 px-4 text-right">Hard (III)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Total</th>
                <th className="py-3 px-4">Folder Information</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                    {row.no}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="hover:text-indigo-600 transition"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700 font-medium">
                    {formatNumber(row.easy)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-700 font-medium">
                    {formatNumber(row.medium)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-red-700 font-medium">
                    {formatNumber(row.hard)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatNumber(row.total)}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                      <span className="truncate max-w-[200px]" title={row.easyFolder}>
                        I: {row.easyFolder}
                      </span>
                      <span className="truncate max-w-[200px]" title={row.mediumFolder}>
                        II: {row.mediumFolder}
                      </span>
                      <span className="truncate max-w-[200px]" title={row.hardFolder}>
                        III: {row.hardFolder}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    <div>{formatDateKolkata(row.lastUpdated)}</div>
                    <div className="text-[11px] text-slate-400">by {row.lastUpdatedBy}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/question-bank/${row.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      Update Counts <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Total Row (PRD Section 5.6 Table Footer) */}
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={2} className="py-3.5 px-4 uppercase text-xs tracking-wider">
                  Total Questions
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-800">
                  {formatNumber(totalEasy)}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-800">
                  {formatNumber(totalMedium)}
                </td>
                <td className="py-3.5 px-4 text-right text-red-800">
                  {formatNumber(totalHard)}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-950 text-base">
                  {formatNumber(grandTotal)}
                </td>
                <td colSpan={3} className="py-3.5 px-4 text-xs text-slate-500 italic">
                  Sum of all {subjects.length} active subject question banks
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
